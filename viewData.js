// Quick script to view database data
require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const Admin = require('./models/Admin');
const User = require('./models/User');
const Vendor = require('./models/Vendor');
const LiquorType = require('./models/LiquorType');
const SystemConfig = require('./models/SystemConfig');
const Transaction = require('./models/Transaction');

const viewData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // View Admins
    console.log('==================== ADMINS ====================');
    const admins = await Admin.find().select('-password');
    console.log(JSON.stringify(admins, null, 2));
    console.log(`Total Admins: ${admins.length}\n`);

    // View Users
    console.log('==================== USERS ====================');
    const users = await User.find().select('-password -qrCode');
    console.log(JSON.stringify(users, null, 2));
    console.log(`Total Users: ${users.length}\n`);

    // View Vendors
    console.log('==================== VENDORS ====================');
    const vendors = await Vendor.find().select('-password');
    console.log(JSON.stringify(vendors, null, 2));
    console.log(`Total Vendors: ${vendors.length}\n`);

    // View Liquor Types
    console.log('==================== LIQUOR TYPES ====================');
    const liquorTypes = await LiquorType.find();
    console.log(JSON.stringify(liquorTypes, null, 2));
    console.log(`Total Liquor Types: ${liquorTypes.length}\n`);

    // View System Config
    console.log('==================== SYSTEM CONFIG ====================');
    const config = await SystemConfig.find();
    console.log(JSON.stringify(config, null, 2));
    console.log(`Total Configs: ${config.length}\n`);

    // View Transactions
    console.log('==================== TRANSACTIONS ====================');
    const transactions = await Transaction.find()
      .populate('user', 'name email userId')
      .populate('vendor', 'shopName')
      .populate('liquorType', 'name category alcoholPercentage')
      .limit(10)
      .sort({ timestamp: -1 });
    console.log(JSON.stringify(transactions, null, 2));
    console.log(`Total Recent Transactions (showing last 10): ${transactions.length}\n`);

    console.log('✅ Data viewing completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

viewData();
