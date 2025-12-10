const LostItem = require('../models/LostItem');
const idGenerator = require('../utils/idGenerator');
const AuditLog = require('../models/AuditLog');

exports.createLostItem = async (req, res) => {
  try {
    // Validation
    const { itemName, description, category, color, dateLost, locationLost, campus, phone, images } = req.body;

    // 1. Tên Đồ: 3-100 chars, no HTML, trim
    if (!itemName || itemName.trim().length < 3 || itemName.trim().length > 100) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Tên đồ vật phải từ 3-100 ký tự' }
      });
    }

    // Sanitize HTML from itemName
    const sanitizedItemName = itemName.trim().replace(/<[^>]*>/g, '');

    // 2. Mô Tả: 10-1000 chars, no HTML, allow \n
    if (!description || description.trim().length < 10 || description.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Mô tả phải từ 10-1000 ký tự' }
      });
    }

    // Sanitize HTML from description (keep \n)
    const sanitizedDescription = description.trim().replace(/<[^>]*>/g, '');

    // 3. Loại: REQUIRED, enum only
    const validCategories = ['PHONE', 'WALLET', 'BAG', 'LAPTOP', 'WATCH', 'BOOK', 'KEYS', 'OTHER'];
    if (!category || !validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Loại đồ vật không hợp lệ' }
      });
    }

    // 4. Màu: Optional, max 50 chars
    if (color && color.trim().length > 50) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Màu sắc tối đa 50 ký tự' }
      });
    }

    // 5. Ngày: No future, warn if >90 days
    if (!dateLost) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Ngày thất lạc là bắt buộc' }
      });
    }

    const lostDate = new Date(dateLost);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (lostDate > today) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Ngày thất lạc không thể là ngày tương lai' }
      });
    }

    const daysDiff = Math.floor((today - lostDate) / (1000 * 60 * 60 * 24));
    const warning = daysDiff > 90 ? 'Cảnh báo: Đã quá 90 ngày kể từ ngày thất lạc' : null;

    // 6. Nơi: Optional, max 200 chars
    if (locationLost && locationLost.trim().length > 200) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Nơi thất lạc tối đa 200 ký tự' }
      });
    }

    // 7. Campus: REQUIRED, enum, pre-fill user's
    const validCampuses = ['NVH', 'SHTP'];
    if (!campus || !validCampuses.includes(campus)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Campus không hợp lệ' }
      });
    }

    // 8. Số ĐT: Optional, VN format 09/01, 10-11 digits
    if (phone && phone.trim()) {
      const phoneRegex = /^(0[9|1])\d{8,9}$/;
      if (!phoneRegex.test(phone.trim())) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Số điện thoại không đúng định dạng (09/01 + 8-9 số)' }
        });
      }
    }

    // 9. Ảnh: Optional, max 5 files
    if (images && Array.isArray(images) && images.length > 5) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Tối đa 5 hình ảnh' }
      });
    }

    const reportId = idGenerator.generateLostItemId(campus);

    const lostItem = new LostItem({
      reportId,
      studentId: req.userId,
      itemName: sanitizedItemName,
      description: sanitizedDescription,
      category,
      color: color ? color.trim() : '',
      dateLost: lostDate,
      locationLost: locationLost ? locationLost.trim() : '',
      campus,
      phone: phone ? phone.trim() : '',
      images: images || [],
      status: 'pending'
    });

    await lostItem.save();

    // Return warning if exists
    const responseData = {
      success: true,
      data: { reportId, ...lostItem.toObject() },
      message: 'Report created successfully'
    };

    if (warning) {
      responseData.warning = warning;
    }

    // Audit log
    await AuditLog.create({
      userId: req.userId,
      action: 'create_report',
      actionType: 'CREATE',
      entityType: 'lost_item',
      entityId: reportId,
      status: 'success'
    });

    res.status(201).json(responseData);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getLostItem = async (req, res) => {
  try {
    const lostItem = await LostItem.findById(req.params.id);

    if (!lostItem) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Lost item not found' }
      });
    }

    // Increment view count
    lostItem.viewCount += 1;
    await lostItem.save();

    res.status(200).json({
      success: true,
      data: lostItem
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getMyReports = async (req, res) => {
  try {
    const { status, campus, page = 1, limit = 10 } = req.query;

    const query = { studentId: req.userId };

    if (status) query.status = status;
    if (campus) query.campus = campus;

    const skip = (page - 1) * limit;

    const reports = await LostItem.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await LostItem.countDocuments(query);

    res.status(200).json({
      success: true,
      data: reports,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateLostItem = async (req, res) => {
  try {
    const lostItem = await LostItem.findById(req.params.id);

    if (!lostItem) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Lost item not found' }
      });
    }

    // Check ownership
    if (lostItem.studentId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized' }
      });
    }

    // Students can only update certain fields, not status or system fields
    const allowedFields = [
      'itemName',
      'description',
      'category',
      'color',
      'dateLost',
      'locationLost',
      'campus',
      'phone',
      'features',
      'priority',
      'images'
    ];

    // Filter out fields that students cannot update
    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Update only allowed fields
    Object.assign(lostItem, updateData);
    await lostItem.save();

    res.status(200).json({
      success: true,
      data: lostItem,
      message: 'Report updated successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteLostItem = async (req, res) => {
  try {
    const lostItem = await LostItem.findById(req.params.id);

    if (!lostItem) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Lost item not found' }
      });
    }

    await LostItem.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.verifyLostItem = async (req, res) => {
  try {
    const lostItem = await LostItem.findById(req.params.id);

    if (!lostItem) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Lost item not found' }
      });
    }

    if (lostItem.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATUS', message: 'Only pending reports can be verified' }
      });
    }

    // Update status and verification info
    lostItem.status = 'verified';
    lostItem.verifiedBy = req.userId;
    lostItem.verifiedAt = new Date();
    lostItem.isVisible = true;
    await lostItem.save();

    // Audit log
    await AuditLog.create({
      userId: req.userId,
      action: 'verify_report',
      actionType: 'UPDATE',
      entityType: 'lost_item',
      entityId: lostItem.reportId,
      status: 'success'
    });

    res.status(200).json({
      success: true,
      data: lostItem,
      message: 'Report verified successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.rejectLostItem = async (req, res) => {
  try {
    const lostItem = await LostItem.findById(req.params.id);

    if (!lostItem) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Lost item not found' }
      });
    }

    if (lostItem.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATUS', message: 'Only pending reports can be rejected' }
      });
    }

    const { reason } = req.body;

    if (!reason || reason.trim() === '') {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Rejection reason is required' }
      });
    }

    // Update status and rejection info
    lostItem.status = 'rejected';
    lostItem.rejectionReason = reason.trim();
    lostItem.verifiedBy = req.userId;
    lostItem.verifiedAt = new Date();
    lostItem.isVisible = false;
    await lostItem.save();

    // Audit log
    await AuditLog.create({
      userId: req.userId,
      action: 'reject_report',
      actionType: 'UPDATE',
      entityType: 'lost_item',
      entityId: lostItem.reportId,
      status: 'success',
      notes: reason
    });

    res.status(200).json({
      success: true,
      data: lostItem,
      message: 'Report rejected successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.listLostItems = async (req, res) => {
  try {
    const { status, campus, category, page = 1, limit = 20 } = req.query;

    const query = {};

    if (status) query.status = status;
    if (campus) query.campus = campus;
    if (category) query.category = category;

    const skip = (page - 1) * limit;

    const reports = await LostItem.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await LostItem.countDocuments(query);

    res.status(200).json({
      success: true,
      data: reports,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.searchLostItems = async (req, res) => {
  try {
    const { keyword, category, campus, page = 1, limit = 20 } = req.query;

    const query = { isVisible: true, status: 'verified' };

    if (keyword) {
      query.$text = { $search: keyword };
    }
    if (category) query.category = category;
    if (campus) query.campus = campus;

    const skip = (page - 1) * limit;

    const results = await LostItem.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await LostItem.countDocuments(query);

    res.status(200).json({
      success: true,
      data: results,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

