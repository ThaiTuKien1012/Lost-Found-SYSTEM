const FoundItem = require('../models/FoundItem');
const idGenerator = require('../utils/idGenerator');

exports.createFoundItem = async (req, res) => {
  try {
    // Validation theo doc
    const { itemName, description, category, color, condition, dateFound, locationFound, campus, warehouseLocation, images } = req.body;

    // 1. Tên Đồ: 3-100 chars, no HTML, trim
    if (!itemName || itemName.trim().length < 3 || itemName.trim().length > 100) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Tên đồ vật phải từ 3-100 ký tự' }
      });
    }
    const sanitizedItemName = itemName.trim().replace(/<[^>]*>/g, '');

    // 2. Mô Tả: 10-1000 chars, no HTML, allow \n
    if (!description || description.trim().length < 10 || description.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Mô tả phải từ 10-1000 ký tự' }
      });
    }
    const sanitizedDescription = description.trim().replace(/<[^>]*>/g, '');

    // 3. Loại: REQUIRED, enum only
    const validCategories = ['PHONE', 'WALLET', 'BAG', 'LAPTOP', 'WATCH', 'BOOK', 'KEYS', 'OTHER'];
    if (!category || !validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Loại đồ vật không hợp lệ' }
      });
    }

    // 4. Màu: REQUIRED (khác Lost Form - optional), max 50 chars
    if (!color || color.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Màu sắc là bắt buộc' }
      });
    }
    if (color.trim().length > 50) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Màu sắc tối đa 50 ký tự' }
      });
    }

    // 5. Ngày: No future
    if (!dateFound) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Ngày tìm được là bắt buộc' }
      });
    }
    const foundDate = new Date(dateFound);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (foundDate > today) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Ngày tìm được không thể là ngày tương lai' }
      });
    }

    // 6. Nơi Tìm Được: REQUIRED (khác Lost Form - optional), max 200 chars
    if (!locationFound || locationFound.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Nơi tìm được là bắt buộc' }
      });
    }
    if (locationFound.trim().length > 200) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Nơi tìm được tối đa 200 ký tự' }
      });
    }

    // 7. Campus: REQUIRED, enum
    const validCampuses = ['NVH', 'SHTP'];
    if (!campus || !validCampuses.includes(campus)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Campus không hợp lệ' }
      });
    }

    // 8. Condition: REQUIRED, enum
    const validConditions = ['excellent', 'good', 'slightly_damaged', 'damaged'];
    if (!condition || !validConditions.includes(condition)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Tình trạng đồ không hợp lệ' }
      });
    }

    // 9. Warehouse Location: Optional, max 200 chars
    if (warehouseLocation && warehouseLocation.trim().length > 200) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Vị trí kho tối đa 200 ký tự' }
      });
    }

    // 10. Ảnh: Optional, max 5 files
    if (images && Array.isArray(images) && images.length > 5) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Tối đa 5 hình ảnh' }
      });
    }

    const foundId = idGenerator.generateFoundItemId(campus);

    const foundItem = new FoundItem({
      foundId,
      securityOfficerId: req.userId,
      itemName: sanitizedItemName,
      description: sanitizedDescription,
      category,
      color: color.trim(),
      condition,
      dateFound: foundDate,
      locationFound: locationFound.trim(),
      campus,
      warehouseLocation: warehouseLocation ? warehouseLocation.trim() : '',
      images: images || [],
      status: 'unclaimed'
    });

    await foundItem.save();

    res.status(201).json({
      success: true,
      data: { foundId, ...foundItem.toObject() },
      message: 'Found item recorded successfully'
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getFoundItem = async (req, res) => {
  try {
    const foundItem = await FoundItem.findById(req.params.id);

    if (!foundItem) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Found item not found' }
      });
    }

    foundItem.viewCount += 1;
    await foundItem.save();

    res.status(200).json({
      success: true,
      data: foundItem
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.listFoundItems = async (req, res) => {
  try {
    const { campus, status, page = 1, limit = 20 } = req.query;
    const query = {};

    // If user is security, automatically filter by their campus
    if (req.user && req.user.role === 'security' && req.user.campus) {
      query.campus = req.user.campus;
    } else if (campus) {
      query.campus = campus;
    }

    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const items = await FoundItem.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await FoundItem.countDocuments(query);

    res.status(200).json({
      success: true,
      data: items,
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

exports.updateFoundItem = async (req, res) => {
  try {
    const foundItem = await FoundItem.findById(req.params.id);

    if (!foundItem) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Found item not found' }
      });
    }

    Object.assign(foundItem, req.body);
    await foundItem.save();

    res.status(200).json({
      success: true,
      data: foundItem,
      message: 'Found item updated successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteFoundItem = async (req, res) => {
  try {
    await FoundItem.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Found item deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.searchFoundItems = async (req, res) => {
  try {
    const { keyword, category, campus, page = 1, limit = 20 } = req.query;
    const query = { status: 'unclaimed' };

    if (keyword) {
      query.$text = { $search: keyword };
    }
    if (category) query.category = category;
    if (campus) query.campus = campus;

    const skip = (page - 1) * limit;

    const results = await FoundItem.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await FoundItem.countDocuments(query);

    res.status(200).json({
      success: true,
      data: results,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

