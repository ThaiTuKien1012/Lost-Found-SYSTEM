const LostItem = require('../models/LostItem');
const idGenerator = require('../utils/idGenerator');
const AuditLog = require('../models/AuditLog');

exports.createLostItem = async (req, res) => {
  try {
    const reportId = idGenerator.generateLostItemId(req.body.campus);

    const lostItem = new LostItem({
      reportId,
      studentId: req.userId,
      ...req.body,
      status: 'pending'
    });

    await lostItem.save();

    // Audit log
    await AuditLog.create({
      userId: req.userId,
      action: 'create_report',
      actionType: 'CREATE',
      entityType: 'lost_item',
      entityId: reportId,
      status: 'success'
    });

    res.status(201).json({
      success: true,
      data: { reportId, ...lostItem.toObject() },
      message: 'Report created successfully'
    });
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

