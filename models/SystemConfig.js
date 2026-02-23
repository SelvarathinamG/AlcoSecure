/**
 * System Configuration Model
 * Stores system-wide settings like daily alcohol limit
 */

const mongoose = require('mongoose');

const systemConfigSchema = new mongoose.Schema({
  configKey: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  configValue: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Static method to get or create daily limit
systemConfigSchema.statics.getDailyLimit = async function() {
  let config = await this.findOne({ configKey: 'dailyAlcoholLimit' });
  
  if (!config) {
    config = await this.create({
      configKey: 'dailyAlcoholLimit',
      configValue: parseFloat(process.env.DEFAULT_DAILY_LIMIT) || 60,
      description: 'Maximum grams of pure alcohol allowed per user per 20 hours'
    });
  }
  
  return config.configValue;
};

// Static method to update daily limit
systemConfigSchema.statics.updateDailyLimit = async function(newLimit, adminId) {
  const config = await this.findOneAndUpdate(
    { configKey: 'dailyAlcoholLimit' },
    { 
      configValue: newLimit,
      updatedBy: adminId,
      updatedAt: Date.now()
    },
    { new: true, upsert: true }
  );
  
  return config;
};

module.exports = mongoose.model('SystemConfig', systemConfigSchema);
