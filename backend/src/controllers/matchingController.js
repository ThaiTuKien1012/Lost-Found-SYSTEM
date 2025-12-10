const MatchingRequest = require('../models/MatchingRequest');
const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');
const User = require('../models/User');
const idGenerator = require('../utils/idGenerator');

// Staff: Tạo match thủ công
exports.createMatch = async (req, res) => {
  try {
    const { lostItemId, foundItemId, matchReason, notes } = req.body;
    const staffId = req.userId;

    // Validate input
    if (!foundItemId) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'foundItemId is required' }
      });
    }

    // Check if found item exists
    const foundItem = await FoundItem.findOne({ foundId: foundItemId });
    if (!foundItem) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Found item not found' }
      });
    }

    // Check if found item is available
    if (foundItem.status !== 'unclaimed') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATUS', message: 'Found item is not available for matching' }
      });
    }

    let studentId = null;
    let lostItem = null;

    // If lostItemId is provided, validate it
    if (lostItemId) {
      lostItem = await LostItem.findOne({ reportId: lostItemId });
      if (!lostItem) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Lost item not found' }
        });
      }
      studentId = lostItem.studentId.toString();
    } else {
      // If no lostItemId, we need studentId from request
      if (!req.body.studentId) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Either lostItemId or studentId is required' }
        });
      }
      studentId = req.body.studentId;
    }

    // Generate request ID
    const requestId = idGenerator.generateMatchingRequestId();

    // Create matching request
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    const matchingRequest = new MatchingRequest({
      requestId,
      lostItemId: lostItemId || null,
      foundItemId,
      studentId,
      staffId,
      matchReason: matchReason || 'Staff manually matched items',
      notes,
      status: 'pending',
      expiresAt
    });

    await matchingRequest.save();

    res.status(201).json({
      success: true,
      data: matchingRequest,
      message: 'Matching request created successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: { code: 'INTERNAL_ERROR', message: error.message } 
    });
  }
};

// Staff: Xem danh sách matches
exports.listMatches = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search, fromDate, toDate, matchedBy } = req.query;
    const query = {};

    // Handle expired status - matches that are pending but expired
    if (status === 'expired') {
      query.status = 'pending';
      query.expiresAt = { $lte: new Date() };
    } else if (status) {
      query.status = status;
    }

    // If staff wants to see only their matches
    if (matchedBy || (req.user && req.user.role === 'staff')) {
      const staffIdToFilter = matchedBy || req.userId;
      query.staffId = staffIdToFilter.toString();
    }

    // If user is security, filter by their campus (via found items)
    if (req.user && req.user.role === 'security' && req.user.campus) {
      // Find all found items in security's campus
      const foundItemsInCampus = await FoundItem.find({ campus: req.user.campus }).select('foundId');
      const foundItemIds = foundItemsInCampus.map(item => item.foundId);
      query.foundItemId = { $in: foundItemIds };
    }

    // Date range filter for completed matches
    if (status === 'completed' && (fromDate || toDate)) {
      query.completedAt = {};
      if (fromDate) {
        query.completedAt.$gte = new Date(fromDate);
      }
      if (toDate) {
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);
        query.completedAt.$lte = endDate;
      }
    }

    const skip = (page - 1) * limit;

    // Sort: completedAt DESC for completed, createdAt DESC for others
    const sortField = status === 'completed' ? { completedAt: -1 } : { createdAt: -1 };

    const matches = await MatchingRequest.find(query)
      .sort(sortField)
      .skip(skip)
      .limit(parseInt(limit));

    // Populate related data
    const matchesWithDetails = await Promise.all(
      matches.map(async (match) => {
        const foundItem = await FoundItem.findOne({ foundId: match.foundItemId });
        const lostItem = match.lostItemId 
          ? await LostItem.findOne({ reportId: match.lostItemId })
          : null;
        const student = await User.findById(match.studentId);
        const staff = await User.findById(match.staffId);

        return {
          ...match.toObject(),
          foundItem: foundItem ? {
            foundId: foundItem.foundId,
            itemName: foundItem.itemName,
            description: foundItem.description,
            category: foundItem.category,
            color: foundItem.color,
            images: foundItem.images,
            campus: foundItem.campus
          } : null,
          lostItem: lostItem ? {
            reportId: lostItem.reportId,
            itemName: lostItem.itemName,
            description: lostItem.description,
            category: lostItem.category,
            color: lostItem.color,
            images: lostItem.images,
            campus: lostItem.campus
          } : null,
          student: student ? {
            userId: student.userId,
            name: student.name,
            email: student.email,
            phone: student.phone
          } : null,
          staff: staff ? {
            userId: staff.userId,
            name: staff.name
          } : null
        };
      })
    );

    const total = await MatchingRequest.countDocuments(query);

    res.status(200).json({
      success: true,
      data: matchesWithDetails,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: { code: 'INTERNAL_ERROR', message: error.message } 
    });
  }
};

// Student: Xem danh sách pending matches
exports.getPendingMatches = async (req, res) => {
  try {
    const studentId = req.userId;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;

    const matches = await MatchingRequest.find({
      studentId: studentId.toString(),
      status: 'pending'
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const matchesWithDetails = await Promise.all(
      matches.map(async (match) => {
        const foundItem = await FoundItem.findOne({ foundId: match.foundItemId });
        const staff = await User.findById(match.staffId);

        return {
          ...match.toObject(),
          foundItem: foundItem ? {
            foundId: foundItem.foundId,
            itemName: foundItem.itemName,
            description: foundItem.description,
            category: foundItem.category,
            color: foundItem.color,
            images: foundItem.images,
            campus: foundItem.campus,
            dateFound: foundItem.dateFound,
            locationFound: foundItem.locationFound
          } : null,
          staff: staff ? {
            userId: staff.userId,
            name: staff.name
          } : null
        };
      })
    );

    const total = await MatchingRequest.countDocuments({
      studentId: studentId.toString(),
      status: 'pending'
    });

    res.status(200).json({
      success: true,
      data: matchesWithDetails,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: { code: 'INTERNAL_ERROR', message: error.message } 
    });
  }
};

// Student: Confirm match
exports.confirmMatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { notes } = req.body;
    const studentId = req.userId;

    const matching = await MatchingRequest.findOne({ requestId: matchId });

    if (!matching) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Matching request not found' }
      });
    }

    if (matching.studentId.toString() !== studentId.toString()) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You can only confirm your own matches' }
      });
    }

    if (matching.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATUS', message: 'Match is not in pending status' }
      });
    }

    matching.status = 'confirmed';
    matching.studentResponse = 'confirmed';
    matching.studentResponseNote = notes || '';
    matching.confirmedAt = new Date();
    await matching.save();

    // Update found item status
    await FoundItem.updateOne(
      { foundId: matching.foundItemId },
      { status: 'matched', matchedWithLostId: matching.lostItemId, matchedAt: new Date() }
    );

    // Update lost item status if exists
    if (matching.lostItemId) {
      await LostItem.updateOne(
        { reportId: matching.lostItemId },
        { status: 'matched', matchedWithFoundId: matching.foundItemId, matchedAt: new Date() }
      );
    }

    res.status(200).json({
      success: true,
      data: matching,
      message: 'Match confirmed successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: { code: 'INTERNAL_ERROR', message: error.message } 
    });
  }
};

// Student: Reject match
exports.rejectMatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { reason } = req.body;
    const studentId = req.userId;

    const matching = await MatchingRequest.findOne({ requestId: matchId });

    if (!matching) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Matching request not found' }
      });
    }

    if (matching.studentId.toString() !== studentId.toString()) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You can only reject your own matches' }
      });
    }

    if (matching.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATUS', message: 'Match is not in pending status' }
      });
    }

    matching.status = 'rejected';
    matching.studentResponse = 'rejected';
    matching.studentResponseNote = reason || '';
    await matching.save();

    res.status(200).json({
      success: true,
      data: matching,
      message: 'Match rejected successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: { code: 'INTERNAL_ERROR', message: error.message } 
    });
  }
};

// Security: Xem danh sách confirmed matches
exports.getConfirmedMatches = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const user = req.user;

    const query = { status: 'confirmed' };

    // Filter by campus if security officer
    if (user.role === 'security' && user.campus) {
      // We need to get matches where found item is in the same campus
      const foundItems = await FoundItem.find({ 
        campus: user.campus
      }).select('foundId');
      const foundIds = foundItems.map(item => item.foundId);
      query.foundItemId = { $in: foundIds };
    }

    const skip = (page - 1) * limit;

    const matches = await MatchingRequest.find(query)
      .sort({ confirmedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const matchesWithDetails = await Promise.all(
      matches.map(async (match) => {
        const foundItem = await FoundItem.findOne({ foundId: match.foundItemId });
        const lostItem = match.lostItemId 
          ? await LostItem.findOne({ reportId: match.lostItemId })
          : null;
        const student = await User.findById(match.studentId);

        return {
          ...match.toObject(),
          foundItem: foundItem ? {
            foundId: foundItem.foundId,
            itemName: foundItem.itemName,
            description: foundItem.description,
            category: foundItem.category,
            color: foundItem.color,
            images: foundItem.images,
            campus: foundItem.campus,
            dateFound: foundItem.dateFound,
            locationFound: foundItem.locationFound,
            warehouseLocation: foundItem.warehouseLocation
          } : null,
          lostItem: lostItem ? {
            reportId: lostItem.reportId,
            itemName: lostItem.itemName,
            description: lostItem.description,
            category: lostItem.category,
            color: lostItem.color
          } : null,
          student: student ? {
            userId: student.userId,
            name: student.name,
            email: student.email,
            phone: student.phone
          } : null
        };
      })
    );

    const total = await MatchingRequest.countDocuments(query);

    res.status(200).json({
      success: true,
      data: matchesWithDetails,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: { code: 'INTERNAL_ERROR', message: error.message } 
    });
  }
};

// Staff/Security: Resolve match (mark as completed/returned)
exports.resolveMatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { status, notes } = req.body;

    const matching = await MatchingRequest.findOne({ requestId: matchId });

    if (!matching) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Matching request not found' }
      });
    }

    if (matching.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATUS', message: 'Match must be confirmed before resolving' }
      });
    }

    matching.status = status || 'completed';
    matching.completedBy = req.userId;
    matching.completedAt = new Date();
    matching.completionNotes = notes || matching.notes;
    matching.resolvedAt = new Date();
    await matching.save();

    // Update found item status
    await FoundItem.updateOne(
      { foundId: matching.foundItemId },
      { 
        status: 'returned',
        'returnedToStudent.studentId': matching.studentId,
        'returnedToStudent.returnedDate': new Date(),
        'returnedToStudent.returnedBy': req.userId
      }
    );

    // Update lost item status if exists
    if (matching.lostItemId) {
      await LostItem.updateOne(
        { reportId: matching.lostItemId },
        { status: 'returned', returnedAt: new Date() }
      );
    }

    res.status(200).json({
      success: true,
      data: matching,
      message: 'Match resolved successfully'
    });
  } catch (error) {
    res.status(500).json({ 
        success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message } 
      });
  }
};

