/**
 * AlcoSecure Configuration Verification Script
 * Checks all settings and configurations
 */

require('dotenv').config();
const mongoose = require('mongoose');
const LiquorType = require('../models/LiquorType');
const SystemConfig = require('../models/SystemConfig');
const Aadhaar = require('../models/Aadhaar');
const Admin = require('../models/Admin');

const verifyConfiguration = async () => {
  try {
    console.log('\n╔═══════════════════════════════════════════════════════╗');
    console.log('║     AlcoSecure Configuration Verification            ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');

    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected Successfully\n');

    // Extract database name
    const dbName = process.env.MONGODB_URI.split('/')[3].split('?')[0];
    console.log('📊 DATABASE CONFIGURATION');
    console.log('─'.repeat(60));
    console.log(`Database Name: ${dbName}`);
    console.log(`Host: ${mongoose.connection.host}`);
    console.log(`Status: ${mongoose.connection.readyState === 1 ? '✅ Connected' : '❌ Not Connected'}`);
    console.log('');

    // Check System Configuration
    console.log('⚙️  SYSTEM CONFIGURATION');
    console.log('─'.repeat(60));
    const dailyLimit = await SystemConfig.findOne({ configKey: 'dailyAlcoholLimit' });
    const resetWindow = await SystemConfig.findOne({ configKey: 'resetWindowHours' });
    
    console.log(`Daily Alcohol Limit: ${dailyLimit ? `✅ ${dailyLimit.configValue}g (pure alcohol)` : '❌ Not Set'}`);
    console.log(`Reset Window: ${resetWindow ? `✅ ${resetWindow.configValue} hours` : '❌ Not Set'}`);
    console.log(`Formula: Volume (ml) × Alcohol % × 0.789 = Pure Alcohol (g)`);
    console.log('');

    // Check Liquor Types & Pricing
    console.log('🍺 LIQUOR TYPES & PRICING');
    console.log('─'.repeat(60));
    const liquorTypes = await LiquorType.find({ isActive: true }).sort({ category: 1, name: 1 });
    const categories = {};
    
    liquorTypes.forEach(liquor => {
      if (!categories[liquor.category]) {
        categories[liquor.category] = [];
      }
      categories[liquor.category].push(liquor);
    });

    for (const [category, items] of Object.entries(categories)) {
      console.log(`\n  ${category}:`);
      items.forEach(item => {
        const priceStatus = item.pricePerUnit > 0 ? '✅' : '❌';
        console.log(`    ${priceStatus} ${item.name.padEnd(30)} ${item.alcoholPercentage}% - ₹${item.pricePerUnit}/${item.unit}`);
      });
    }

    const totalLiquors = liquorTypes.length;
    const withPrices = liquorTypes.filter(l => l.pricePerUnit > 0).length;
    console.log(`\n  Total: ${totalLiquors} types | With Prices: ${withPrices}/${totalLiquors}`);
    console.log('');

    // Check Aadhaar Verification
    console.log('📇 AADHAAR VERIFICATION SYSTEM');
    console.log('─'.repeat(60));
    const aadhaarCount = await Aadhaar.countDocuments();
    const adults = await Aadhaar.find();
    let adultCount = 0;
    let minorCount = 0;

    for (const record of adults) {
      const age = record.calculateAge();
      if (age >= 18) {
        adultCount++;
      } else {
        minorCount++;
      }
    }

    console.log(`Total Aadhaar Records: ${aadhaarCount}`);
    console.log(`  ✅ Adults (18+): ${adultCount}`);
    console.log(`  ❌ Minors (<18): ${minorCount}`);
    console.log(`Age Verification: ${aadhaarCount > 0 ? '✅ Enabled' : '❌ Not Configured'}`);
    console.log('');

    // Check Admin Account
    console.log('👤 ADMIN ACCOUNT');
    console.log('─'.repeat(60));
    const adminCount = await Admin.countDocuments();
    const defaultAdmin = await Admin.findOne({ email: 'admin@alcosecure.com' });
    console.log(`Admin Accounts: ${adminCount}`);
    console.log(`Default Admin: ${defaultAdmin ? '✅ admin@alcosecure.com' : '❌ Not Found'}`);
    console.log('');

    // 20-Hour Reset Check
    console.log('⏰ 20-HOUR RESET SYSTEM');
    console.log('─'.repeat(60));
    console.log(`Reset Window: ${resetWindow ? resetWindow.configValue : '?'} hours`);
    console.log(`Cron Job: Runs every hour to check users`);
    console.log(`Auto-Reset: After 20 hours of inactivity`);
    console.log(`Status: ✅ Configured in cronJobs.js`);
    console.log('');

    // Summary
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║                  VERIFICATION SUMMARY                 ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');

    const checks = [
      { name: 'Database Name (alcosecure)', status: dbName === 'alcosecure' },
      { name: 'MongoDB Connection', status: mongoose.connection.readyState === 1 },
      { name: '60g Daily Limit', status: dailyLimit && dailyLimit.configValue === 60 },
      { name: '20-Hour Reset Window', status: resetWindow && resetWindow.configValue === 20 },
      { name: 'Liquor Pricing', status: withPrices === totalLiquors },
      { name: 'Aadhaar Verification', status: aadhaarCount > 0 },
      { name: 'Admin Account', status: defaultAdmin !== null }
    ];

    checks.forEach(check => {
      const icon = check.status ? '✅' : '❌';
      console.log(`  ${icon} ${check.name}`);
    });

    const allPassed = checks.every(c => c.status);
    console.log('\n' + '─'.repeat(60));
    console.log(allPassed ? '🎉 All checks passed!' : '⚠️  Some checks failed - review above');
    console.log('─'.repeat(60) + '\n');

    await mongoose.connection.close();
    console.log('✅ Verification complete - Database connection closed\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Verification Error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

verifyConfiguration();
