/**
 * Liquor Type Model
 * Stores different types of alcohol with their alcohol percentage
 */

const mongoose = require('mongoose');

const liquorTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Liquor name is required'],
    unique: true,
    trim: true
  },
  alcoholPercentage: {
    type: Number,
    required: [true, 'Alcohol percentage is required'],
    min: [0, 'Alcohol percentage cannot be negative'],
    max: [100, 'Alcohol percentage cannot exceed 100']
  },
  category: {
    type: String,
    enum: ['Beer', 'Wine', 'Whisky', 'Vodka', 'Rum', 'Brandy', 'Gin', 'Tequila', 'Other'],
    default: 'Other'
  },
  description: {
    type: String,
    trim: true
  },
  pricePerUnit: {
    type: Number,
    default: 0,
    min: [0, 'Price cannot be negative']
  },
  unit: {
    type: String,
    enum: ['ml', 'bottle', 'peg', 'glass'],
    default: 'ml'
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

module.exports = mongoose.model('LiquorType', liquorTypeSchema);
