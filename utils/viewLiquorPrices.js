// Quick script to view liquor types and their prices
require('dotenv').config();
const mongoose = require('mongoose');
const LiquorType = require('../models/LiquorType');

const viewLiquorTypes = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const liquors = await LiquorType.find({ isActive: true }).sort({ category: 1, name: 1 });

    console.log('╔═══════════════════════════════════════════════════════════════════╗');
    console.log('║                    LIQUOR TYPES & PRICING                         ║');
    console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

    const grouped = {};
    liquors.forEach(liquor => {
      if (!grouped[liquor.category]) {
        grouped[liquor.category] = [];
      }
      grouped[liquor.category].push(liquor);
    });

    for (const [category, items] of Object.entries(grouped)) {
      console.log(`\n📦 ${category.toUpperCase()}`);
      console.log('─'.repeat(70));
      items.forEach(liquor => {
        console.log(`   ${liquor.name.padEnd(30)} ${liquor.alcoholPercentage}%  ₹${liquor.pricePerUnit}/${liquor.unit}`);
      });
    }

    console.log('\n' + '─'.repeat(70));
    console.log(`Total Liquor Types: ${liquors.length}\n`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

viewLiquorTypes();
