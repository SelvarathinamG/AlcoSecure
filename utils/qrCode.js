/**
 * QR Code Utilities
 * Functions for generating QR codes
 */

const QRCode = require('qrcode');

/**
 * Generate QR code for user
 * @param {string} userId - User's unique ID
 * @returns {Promise<string>} Base64 encoded QR code image
 */
const generateQRCode = async (userId) => {
  try {
    // Generate QR code as base64 data URL
    const qrCodeDataURL = await QRCode.toDataURL(userId, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

module.exports = {
  generateQRCode
};
