/**
 * Aadhaar Model
 * Stores dummy Aadhaar data for verification
 */

const mongoose = require('mongoose');

const aadhaarSchema = new mongoose.Schema({
  aadhaar_no: {
    type: String,
    required: [true, 'Aadhaar number is required'],
    unique: true,
    length: [12, 'Aadhaar number must be exactly 12 digits'],
    match: [/^[0-9]{12}$/, 'Aadhaar number must contain only digits']
  },
  first_name: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  date_of_birth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['Male', 'Female', 'Other']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  mobile_number: {
    type: String,
    required: [true, 'Mobile number is required'],
    match: [/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits']
  }
}, {
  timestamps: true
});

// Method to calculate age
aadhaarSchema.methods.calculateAge = function() {
  const today = new Date();
  const birthDate = new Date(this.date_of_birth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Static method to verify Aadhaar data
aadhaarSchema.statics.verifyAadhaarData = async function(aadhaarNo, email, mobileNumber) {
  const aadhaarData = await this.findOne({ aadhaar_no: aadhaarNo });
  
  if (!aadhaarData) {
    return {
      valid: false,
      message: 'Aadhaar number not found in database'
    };
  }
  
  // Verify email matches
  if (aadhaarData.email.toLowerCase() !== email.toLowerCase()) {
    return {
      valid: false,
      message: 'Email does not match Aadhaar records'
    };
  }
  
  // Verify mobile number matches
  if (aadhaarData.mobile_number !== mobileNumber) {
    return {
      valid: false,
      message: 'Mobile number does not match Aadhaar records'
    };
  }
  
  // Calculate age
  const age = aadhaarData.calculateAge();
  
  if (age < 18) {
    return {
      valid: false,
      message: 'You must be at least 18 years old to register',
      age: age,
      isUnderage: true
    };
  }
  
  return {
    valid: true,
    message: 'Aadhaar verification successful',
    data: aadhaarData,
    age: age
  };
};

module.exports = mongoose.model('Aadhaar', aadhaarSchema);
