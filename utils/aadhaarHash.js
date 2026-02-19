/**
 * Aadhaar Hashing Utility
 * For secure storage of Aadhaar numbers
 */

const crypto = require('crypto');

/**
 * Hash Aadhaar number using SHA-256
 * @param {string} aadhaar - 12-digit Aadhaar number
 * @returns {string} Hashed Aadhaar
 */
const hashAadhaar = (aadhaar) => {
  return crypto
    .createHash('sha256')
    .update(aadhaar.toString())
    .digest('hex');
};

module.exports = {
  hashAadhaar
};
