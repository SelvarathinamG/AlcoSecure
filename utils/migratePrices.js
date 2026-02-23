// Migration script to add prices to existing liquor types
require('dotenv').config();
const mongoose = require('mongoose');
const LiquorType = require('../models/LiquorType');

const priceData = {
  'Kingfisher Beer': { pricePerUnit: 0.15, unit: 'ml' },
  'Budweiser': { pricePerUnit: 0.18, unit: 'ml' },
  'Red Wine': { pricePerUnit: 0.35, unit: 'ml' },
  'White Wine': { pricePerUnit: 0.32, unit: 'ml' },
  'Royal Challenge Whisky': { pricePerUnit: 1.2, unit: 'ml' },
  'Johnnie Walker Black Label': { pricePerUnit: 2.5, unit: 'ml' },
  'Absolut Vodka': { pricePerUnit: 1.8, unit: 'ml' },
  'Smirnoff Vodka': { pricePerUnit: 1.5, unit: 'ml' },
  'Old Monk Rum': { pricePerUnit: 0.8, unit: 'ml' },
  'Bacardi White Rum': { pricePerUnit: 1.6, unit: 'ml' },
  'McDowell\'s Brandy': { pricePerUnit: 0.9, unit: 'ml' },
  'Tanqueray Gin': { pricePerUnit: 2.0, unit: 'ml' },
  'veeran': { pricePerUnit: 1.0, unit: 'ml' }
};

const migratePrices = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('🔄 Updating liquor types with prices...\n');

    for (const [name, data] of Object.entries(priceData)) {
      const result = await LiquorType.updateOne(
        { name: name },
        { 
          $set: { 
            pricePerUnit: data.pricePerUnit,
            unit: data.unit 
          } 
        }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✅ Updated ${name}: ₹${data.pricePerUnit}/${data.unit}`);
      } else if (result.matchedCount > 0) {
        console.log(`ℹ️  ${name} already has correct price`);
      } else {
        console.log(`⚠️  ${name} not found in database`);
      }
    }

    console.log('\n✅ Price migration completed!\n');

    // Display all liquor types with their prices
    const liquorTypes = await LiquorType.find().sort('name');
    console.log('\n📊 Current Liquor Types:\n');
    console.log('Name\t\t\t\tAlcohol%\tPrice\t\tUnit');
    console.log('─'.repeat(80));
    
    liquorTypes.forEach(liquor => {
      const name = liquor.name.padEnd(25);
      const percent = `${liquor.alcoholPercentage}%`.padEnd(10);
      const price = `₹${liquor.pricePerUnit || 0}`.padEnd(10);
      console.log(`${name}\t${percent}\t${price}\t${liquor.unit || 'ml'}`);
    });

    console.log('\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

migratePrices();
