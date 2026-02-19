/**
 * Authentication Routes
 * Handles user, vendor, and admin authentication
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Admin = require('../models/Admin');
const { sendTokenResponse } = require('../utils/jwtToken');
const { generateQRCode } = require('../utils/qrCode');
const { hashAadhaar } = require('../utils/aadhaarHash');
const {
  validateUserRegistration,
  validateLogin,
  validateVendorRegistration
} = require('../middleware/validators');

/**
 * @route   POST /api/auth/user/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/user/register', validateUserRegistration, async (req, res, next) => {
  try {
    const { name, email, password, aadhaar } = req.body;

    // Hash Aadhaar for secure storage
    const aadhaarHash = hashAadhaar(aadhaar);

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { aadhaarHash }]
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }
      if (existingUser.aadhaarHash === aadhaarHash) {
        return res.status(400).json({
          success: false,
          message: 'Aadhaar already registered'
        });
      }
    }

    // Generate unique user ID
    const userId = await User.generateUserId();

    // Generate QR code
    const qrCode = await generateQRCode(userId);

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      aadhaarHash,
      userId,
      qrCode
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/user/login
 * @desc    Login user
 * @access  Public
 */
router.post('/user/login', validateLogin, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/vendor/register
 * @desc    Register a new vendor
 * @access  Public (in production, this should be admin-only)
 */
router.post('/vendor/register', validateVendorRegistration, async (req, res, next) => {
  try {
    const { name, email, password, shopName, licenseNumber, address, phone } = req.body;

    // Check if vendor already exists
    const existingVendor = await Vendor.findOne({
      $or: [{ email }, { licenseNumber }]
    });

    if (existingVendor) {
      if (existingVendor.email === email) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }
      if (existingVendor.licenseNumber === licenseNumber) {
        return res.status(400).json({
          success: false,
          message: 'License number already registered'
        });
      }
    }

    // Create vendor
    const vendor = await Vendor.create({
      name,
      email,
      password,
      shopName,
      licenseNumber,
      address,
      phone
    });

    sendTokenResponse(vendor, 201, res);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/vendor/login
 * @desc    Login vendor
 * @access  Public
 */
router.post('/vendor/login', validateLogin, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find vendor and include password
    const vendor = await Vendor.findOne({ email }).select('+password');

    if (!vendor) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordMatch = await vendor.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is active
    if (!vendor.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    sendTokenResponse(vendor, 200, res);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/admin/login
 * @desc    Login admin
 * @access  Public
 */
router.post('/admin/login', validateLogin, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find admin and include password
    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordMatch = await admin.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is active
    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    sendTokenResponse(admin, 200, res);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
