/**
 * Vendor Routes
 * Handles vendor operations including purchase processing
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const LiquorType = require('../models/LiquorType');
const SystemConfig = require('../models/SystemConfig');
const { protect, authorize } = require('../middleware/auth');
const { validatePurchase } = require('../middleware/validators');
const { calculatePureAlcohol, checkDailyLimit, shouldResetConsumption } = require('../utils/alcoholCalculator');

/**
 * @route   GET /api/vendors/profile
 * @desc    Get vendor profile
 * @access  Private (Vendor)
 */
router.get('/profile', protect, authorize('vendor'), async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: req.user
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/vendors/scan
 * @desc    Scan user QR code and get user info
 * @access  Private (Vendor)
 */
router.post('/scan', protect, authorize('vendor'), async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Find user by userId
    const user = await User.findOne({ userId }).select('-password -aadhaarHash');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        message: 'User account is deactivated'
      });
    }

    // Check if reset is needed
    if (shouldResetConsumption(user.lastResetDate)) {
      user.consumedToday = 0;
      user.lastResetDate = new Date();
      await user.save();
    }

    // Get daily limit
    const dailyLimit = await SystemConfig.getDailyLimit();

    res.status(200).json({
      success: true,
      data: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        consumedToday: user.consumedToday,
        dailyLimit: dailyLimit,
        remaining: Math.max(0, dailyLimit - user.consumedToday),
        lastResetDate: user.lastResetDate
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/vendors/purchase
 * @desc    Process alcohol purchase
 * @access  Private (Vendor)
 */
router.post('/purchase', protect, authorize('vendor'), validatePurchase, async (req, res, next) => {
  try {
    const { userId, liquorTypeId, volumeMl } = req.body;

    // Find user
    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        message: 'User account is deactivated'
      });
    }

    // Find liquor type
    const liquorType = await LiquorType.findById(liquorTypeId);

    if (!liquorType) {
      return res.status(404).json({
        success: false,
        message: 'Liquor type not found'
      });
    }

    if (!liquorType.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This liquor type is currently unavailable'
      });
    }

    // Check if reset is needed
    if (shouldResetConsumption(user.lastResetDate)) {
      user.consumedToday = 0;
      user.lastResetDate = new Date();
      await user.save();
    }

    // Calculate pure alcohol
    const pureAlcoholGrams = calculatePureAlcohol(volumeMl, liquorType.alcoholPercentage);

    // Get daily limit
    const dailyLimit = await SystemConfig.getDailyLimit();

    // Check daily limit
    const limitCheck = checkDailyLimit(user.consumedToday, pureAlcoholGrams, dailyLimit);

    // Create transaction
    const transaction = await Transaction.create({
      user: user._id,
      vendor: req.user._id,
      liquorType: liquorType._id,
      volumeMl: volumeMl,
      alcoholPercentage: liquorType.alcoholPercentage,
      pureAlcoholGrams: pureAlcoholGrams,
      status: limitCheck.allowed ? 'approved' : 'rejected',
      rejectionReason: limitCheck.reason,
      consumedBeforePurchase: user.consumedToday,
      dailyLimitAtPurchase: dailyLimit
    });

    // Update user consumption if approved
    if (limitCheck.allowed) {
      user.consumedToday += pureAlcoholGrams;
      await user.save();
    }

    // Populate transaction details
    await transaction.populate('liquorType', 'name category');
    await transaction.populate('user', 'name userId');

    res.status(200).json({
      success: true,
      data: {
        transaction,
        status: limitCheck.allowed ? 'approved' : 'rejected',
        message: limitCheck.allowed 
          ? 'Purchase approved successfully' 
          : limitCheck.reason,
        details: {
          volumeMl,
          alcoholPercentage: liquorType.alcoholPercentage,
          pureAlcoholGrams,
          previousConsumption: transaction.consumedBeforePurchase,
          newTotalConsumption: limitCheck.allowed ? user.consumedToday : transaction.consumedBeforePurchase,
          dailyLimit,
          remaining: limitCheck.remaining
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/vendors/liquor-types
 * @desc    Get all active liquor types
 * @access  Private (Vendor)
 */
router.get('/liquor-types', protect, authorize('vendor'), async (req, res, next) => {
  try {
    const liquorTypes = await LiquorType.find({ isActive: true }).sort('name');

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
 * @route   GET /api/vendors/transactions
 * @desc    Get vendor's transaction history
 * @access  Private (Vendor)
 */
router.get('/transactions', protect, authorize('vendor'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const query = { vendor: req.user._id };
    if (status) {
      query.status = status;
    }

    const transactions = await Transaction.find(query)
      .populate('user', 'name userId')
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
 * @route   GET /api/vendors/stats
 * @desc    Get vendor statistics
 * @access  Private (Vendor)
 */
router.get('/stats', protect, authorize('vendor'), async (req, res, next) => {
  try {
    // Total transactions
    const totalTransactions = await Transaction.countDocuments({ 
      vendor: req.user._id 
    });

    // Approved transactions
    const approvedTransactions = await Transaction.countDocuments({ 
      vendor: req.user._id,
      status: 'approved'
    });

    // Rejected transactions
    const rejectedTransactions = await Transaction.countDocuments({ 
      vendor: req.user._id,
      status: 'rejected'
    });

    // Today's transactions
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const todayTransactions = await Transaction.countDocuments({
      vendor: req.user._id,
      timestamp: { $gte: todayStart }
    });

    res.status(200).json({
      success: true,
      data: {
        totalTransactions,
        approvedTransactions,
        rejectedTransactions,
        todayTransactions,
        approvalRate: totalTransactions > 0 
          ? ((approvedTransactions / totalTransactions) * 100).toFixed(2) 
          : 0
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
