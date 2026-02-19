/**
 * Seed Database Script
 * Creates initial admin account and sample liquor types
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const LiquorType = require('../models/LiquorType');
const SystemConfig = require('../models/SystemConfig');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Create default admin
    const adminExists = await Admin.findOne({ email: 'admin@ethanoltrack.com' });
    
    if (!adminExists) {
      await Admin.create({
        name: 'System Administrator',
        email: 'admin@ethanoltrack.com',
        password: 'admin123', // Change this in production
        isSuperAdmin: true
      });
      console.log('✅ Default admin created: admin@ethanoltrack.com / admin123');
    } else {
      console.log('ℹ️  Admin already exists');
    }

    // Create sample liquor types
    const sampleLiquorTypes = [
      { name: 'Kingfisher Beer', alcoholPercentage: 5, category: 'Beer', description: 'Premium lager beer' },
      { name: 'Budweiser', alcoholPercentage: 5, category: 'Beer', description: 'American-style lager' },
      { name: 'Red Wine', alcoholPercentage: 12, category: 'Wine', description: 'Classic red wine' },
      { name: 'White Wine', alcoholPercentage: 11, category: 'Wine', description: 'Crisp white wine' },
      { name: 'Royal Challenge Whisky', alcoholPercentage: 42.8, category: 'Whisky', description: 'Indian whisky' },
      { name: 'Johnnie Walker Black Label', alcoholPercentage: 40, category: 'Whisky', description: 'Blended Scotch whisky' },
      { name: 'Absolut Vodka', alcoholPercentage: 40, category: 'Vodka', description: 'Swedish vodka' },
      { name: 'Smirnoff Vodka', alcoholPercentage: 37.5, category: 'Vodka', description: 'Classic vodka' },
      { name: 'Old Monk Rum', alcoholPercentage: 42.8, category: 'Rum', description: 'Dark rum' },
      { name: 'Bacardi White Rum', alcoholPercentage: 37.5, category: 'Rum', description: 'White rum' },
      { name: 'McDowell\'s Brandy', alcoholPercentage: 42.8, category: 'Brandy', description: 'Indian brandy' },
      { name: 'Tanqueray Gin', alcoholPercentage: 47.3, category: 'Gin', description: 'London dry gin' },
    ];

    for (const liquor of sampleLiquorTypes) {
      const exists = await LiquorType.findOne({ name: liquor.name });
      if (!exists) {
        await LiquorType.create(liquor);
        console.log(`✅ Created liquor type: ${liquor.name}`);
      }
    }

    // Set default daily limit
    const dailyLimitConfig = await SystemConfig.findOne({ configKey: 'dailyAlcoholLimit' });
    if (!dailyLimitConfig) {
      await SystemConfig.create({
        configKey: 'dailyAlcoholLimit',
        configValue: 60,
        description: 'Maximum grams of pure alcohol allowed per user per 24 hours'
      });
      console.log('✅ Default daily limit set to 60g');
    }

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('   Admin: admin@ethanoltrack.com / admin123');
    console.log('\n⚠️  Remember to change the default admin password in production!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
