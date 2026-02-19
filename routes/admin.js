/**
 * Admin Routes
 * Handles administrative operations
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Admin = require('../models/Admin');
const LiquorType = require('../models/LiquorType');
const Transaction = require('../models/Transaction');
const SystemConfig = require('../models/SystemConfig');
const { protect, authorize } = require('../middleware/auth');
const { validateLiquorType, validateDailyLimit } = require('../middleware/validators');

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get admin dashboard statistics
 * @access  Private (Admin)
 */
router.get('/dashboard', protect, authorize('admin'), async (req, res, next) => {
  try {
    // Count totals
    const totalUsers = await User.countDocuments();
    const totalVendors = await Vendor.countDocuments();
    const totalTransactions = await Transaction.countDocuments();
    const totalLiquorTypes = await LiquorType.countDocuments();

    // Get today's stats
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayTransactions = await Transaction.countDocuments({
      timestamp: { $gte: todayStart }
    });

    const todayApproved = await Transaction.countDocuments({
      timestamp: { $gte: todayStart },
      status: 'approved'
    });

    const todayRejected = await Transaction.countDocuments({
      timestamp: { $gte: todayStart },
      status: 'rejected'
    });

    // Get recent transactions
    const recentTransactions = await Transaction.find()
      .populate('user', 'name userId')
      .populate('vendor', 'shopName')
      .populate('liquorType', 'name')
      .sort({ timestamp: -1 })
      .limit(10);

    // Get daily limit
    const dailyLimit = await SystemConfig.getDailyLimit();

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalVendors,
          totalTransactions,
          totalLiquorTypes,
          dailyLimit
        },
        today: {
          transactions: todayTransactions,
          approved: todayApproved,
          rejected: todayRejected,
          approvalRate: todayTransactions > 0 
            ? ((todayApproved / todayTransactions) * 100).toFixed(2) 
            : 0
        },
        recentTransactions
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Private (Admin)
 */
router.get('/users', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { userId: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password -aadhaarHash')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/admin/vendors
 * @desc    Get all vendors
 * @access  Private (Admin)
 */
router.get('/vendors', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { shopName: { $regex: search, $options: 'i' } },
        { licenseNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const vendors = await Vendor.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Vendor.countDocuments(query);

    res.status(200).json({
      success: true,
      data: vendors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/admin/transactions
 * @desc    Get all transactions
 * @access  Private (Admin)
 */
router.get('/transactions', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, userId } = req.query;

    const query = {};
    if (status) query.status = status;
    if (userId) {
      const user = await User.findOne({ userId });
      if (user) query.user = user._id;
    }

    const transactions = await Transaction.find(query)
      .populate('user', 'name userId')
      .populate('vendor', 'shopName name')
      .populate('liquorType', 'name alcoholPercentage category')
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Transaction.countDocuments(query);

    res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/admin/liquor-types
 * @desc    Get all liquor types
 * @access  Private (Admin)
 */
router.get('/liquor-types', protect, authorize('admin'), async (req, res, next) => {
  try {
    const liquorTypes = await LiquorType.find().sort('name');

    res.status(200).json({
      success: true,
      count: liquorTypes.length,
      data: liquorTypes
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/admin/liquor-types
 * @desc    Create new liquor type
 * @access  Private (Admin)
 */
router.post('/liquor-types', protect, authorize('admin'), validateLiquorType, async (req, res, next) => {
  try {
    const { name, alcoholPercentage, category, description } = req.body;

    const liquorType = await LiquorType.create({
      name,
      alcoholPercentage,
      category,
      description
    });

    res.status(201).json({
      success: true,
      data: liquorType
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/admin/liquor-types/:id
 * @desc    Update liquor type
 * @access  Private (Admin)
 */
router.put('/liquor-types/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { name, alcoholPercentage, category, description, isActive } = req.body;

    const liquorType = await LiquorType.findByIdAndUpdate(
      req.params.id,
      { name, alcoholPercentage, category, description, isActive },
      { new: true, runValidators: true }
    );

    if (!liquorType) {
      return res.status(404).json({
        success: false,
        message: 'Liquor type not found'
      });
    }

    res.status(200).json({
      success: true,
      data: liquorType
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/admin/liquor-types/:id
 * @desc    Delete liquor type
 * @access  Private (Admin)
 */
router.delete('/liquor-types/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const liquorType = await LiquorType.findByIdAndDelete(req.params.id);

    if (!liquorType) {
      return res.status(404).json({
        success: false,
        message: 'Liquor type not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Liquor type deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/admin/config/daily-limit
 * @desc    Get daily alcohol limit
 * @access  Private (Admin)
 */
router.get('/config/daily-limit', protect, authorize('admin'), async (req, res, next) => {
  try {
    const dailyLimit = await SystemConfig.getDailyLimit();

    res.status(200).json({
      success: true,
      data: { dailyLimit }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/admin/config/daily-limit
 * @desc    Update daily alcohol limit
 * @access  Private (Admin)
 */
router.put('/config/daily-limit', protect, authorize('admin'), validateDailyLimit, async (req, res, next) => {
  try {
    const { dailyLimit } = req.body;

    await SystemConfig.updateDailyLimit(dailyLimit, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Daily limit updated successfully',
      data: { dailyLimit }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/admin/users/:id/toggle-status
 * @desc    Activate/Deactivate user
 * @access  Private (Admin)
 */
router.put('/users/:id/toggle-status', protect, authorize('admin'), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { isActive: user.isActive }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/admin/vendors/:id/toggle-status
 * @desc    Activate/Deactivate vendor
 * @access  Private (Admin)
 */
router.put('/vendors/:id/toggle-status', protect, authorize('admin'), async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    vendor.isActive = !vendor.isActive;
    await vendor.save();

    res.status(200).json({
      success: true,
      message: `Vendor ${vendor.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { isActive: vendor.isActive }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
