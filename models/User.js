/**
 * User Model
 * Represents end users who purchase alcohol
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password by default
  },
  aadhaarHash: {
    type: String,
    required: [true, 'Aadhaar is required'],
    unique: true
  },
  userId: {
    type: String,
    unique: true,
    required: true
  },
  qrCode: {
    type: String, // Base64 encoded QR code image
    default: null
  },
  role: {
    type: String,
    enum: ['user'],
    default: 'user'
  },
  consumedToday: {
    type: Number,
    default: 0, // In grams of pure alcohol
    min: 0
  },
  totalSpentToday: {
    type: Number,
    default: 0, // Total money spent today
    min: 0
  },
  lastResetDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate unique user ID
userSchema.statics.generateUserId = async function() {
  const prefix = 'ETH';
  let unique = false;
  let userId;
  
  while (!unique) {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    userId = `${prefix}${randomNum}`;
    const existing = await this.findOne({ userId });
    if (!existing) {
      unique = true;
    }
  }
  
  return userId;
};

module.exports = mongoose.model('User', userSchema);
