/**
 * Input Validation Middleware
 * Using express-validator
 */

const { body, validationResult } = require('express-validator');

/**
 * Handle validation results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

/**
 * User registration validation
 */
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('aadhaar')
    .trim()
    .matches(/^[0-9]{12}$/)
    .withMessage('Aadhaar must be exactly 12 digits'),
  validate
];

/**
 * Login validation
 */
const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate
];

/**
 * Vendor registration validation
 */
const validateVendorRegistration = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('shopName')
    .trim()
    .notEmpty()
    .withMessage('Shop name is required'),
  body('licenseNumber')
    .trim()
    .notEmpty()
    .withMessage('License number is required'),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),
  body('phone')
    .trim()
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone must be exactly 10 digits'),
  validate
];

/**
 * Liquor type validation
 */
const validateLiquorType = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Liquor name is required'),
  body('alcoholPercentage')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Alcohol percentage must be between 0 and 100'),
  body('category')
    .optional()
    .isIn(['Beer', 'Wine', 'Whisky', 'Vodka', 'Rum', 'Brandy', 'Gin', 'Tequila', 'Other'])
    .withMessage('Invalid category'),
  validate
];

/**
 * Purchase validation
 */
const validatePurchase = [
  body('userId')
    .trim()
    .notEmpty()
    .withMessage('User ID is required'),
  body('liquorTypeId')
    .trim()
    .notEmpty()
    .withMessage('Liquor type is required'),
  body('volumeMl')
    .isFloat({ min: 1 })
    .withMessage('Volume must be at least 1ml'),
  validate
];

/**
 * Daily limit validation
 */
const validateDailyLimit = [
  body('dailyLimit')
    .isFloat({ min: 1 })
    .withMessage('Daily limit must be at least 1 gram'),
  validate
];

module.exports = {
  validateUserRegistration,
  validateLogin,
  validateVendorRegistration,
  validateLiquorType,
  validatePurchase,
  validateDailyLimit
};
