/**
 * JWT Token Utilities
 * Functions for generating and managing JWT tokens
 */

const jwt = require('jsonwebtoken');

/**
 * Generate JWT token
 * @param {string} id - User/Vendor/Admin ID
 * @param {string} role - User role (user, vendor, admin)
 * @returns {string} JWT token
 */
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

/**
 * Send token response
 * @param {object} user - User object
 * @param {number} statusCode - HTTP status code
 * @param {object} res - Express response object
 */
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id, user.role);

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      ...(user.userId && { userId: user.userId }),
      ...(user.shopName && { shopName: user.shopName })
    }
  });
};

module.exports = {
  generateToken,
  sendTokenResponse
};
