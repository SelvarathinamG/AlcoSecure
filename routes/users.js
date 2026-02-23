/**
 * User Routes
 * Handles user-specific operations
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { protect, authorize } = require('../middleware/auth');

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private (User)
 */
router.get('/profile', protect, authorize('user'), async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-aadhaarHash');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/users/qrcode
 * @desc    Get user's QR code
 * @access  Private (User)
 */
router.get('/qrcode', protect, authorize('user'), async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      data: {
        userId: user.userId,
        qrCode: user.qrCode
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/users/consumption
 * @desc    Get current consumption status
 * @access  Private (User)
 */
router.get('/consumption', protect, authorize('user'), async (req, res, next) => {
  try {
    const SystemConfig = require('../models/SystemConfig');
    const user = await User.findById(req.user._id);
    const dailyLimit = await SystemConfig.getDailyLimit();

    res.status(200).json({
      success: true,
      data: {
        consumedToday: user.consumedToday,
        totalSpentToday: user.totalSpentToday,
        dailyLimit: dailyLimit,
        remaining: Math.max(0, dailyLimit - user.consumedToday),
        lastResetDate: user.lastResetDate,
        percentageUsed: ((user.consumedToday / dailyLimit) * 100).toFixed(2)
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/users/transactions
 * @desc    Get user's transaction history
 * @access  Private (User)
 */
router.get('/transactions', protect, authorize('user'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const transactions = await Transaction.find({ user: req.user._id })
      .populate('vendor', 'shopName name')
      .populate('liquorType', 'name alcoholPercentage category')
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Transaction.countDocuments({ user: req.user._id });

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
 * @route   GET /api/users/stats
 * @desc    Get user statistics
 * @access  Private (User)
 */
router.get('/stats', protect, authorize('user'), async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Get total transactions
    const totalTransactions = await Transaction.countDocuments({ 
      user: req.user._id 
    });

    // Get approved transactions
    const approvedTransactions = await Transaction.countDocuments({ 
      user: req.user._id,
      status: 'approved'
    });

    // Get rejected transactions
    const rejectedTransactions = await Transaction.countDocuments({ 
      user: req.user._id,
      status: 'rejected'
    });

    // Get today's transactions
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const todayTransactions = await Transaction.find({
      user: req.user._id,
      timestamp: { $gte: todayStart }
    }).populate('liquorType', 'name');

    res.status(200).json({
      success: true,
      data: {
        totalTransactions,
        approvedTransactions,
        rejectedTransactions,
        todayTransactions: todayTransactions.length,
        consumedToday: user.consumedToday,
        recentTransactions: todayTransactions
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
