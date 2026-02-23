// Script to update existing transactions with calculated prices
require('dotenv').config();
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const LiquorType = require('../models/LiquorType');
const User = require('../models/User');

const updateTransactionPrices = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all transactions that have totalPrice = 0
    const transactions = await Transaction.find({ 
      $or: [
        { totalPrice: 0 },
        { totalPrice: { $exists: false } }
      ]
    }).populate('liquorType user');

    console.log(`🔄 Found ${transactions.length} transactions to update\n`);

    let updated = 0;
    let errors = 0;

    for (const transaction of transactions) {
      try {
        if (!transaction.liquorType) {
          console.log(`⚠️  Skipping transaction ${transaction._id} - liquor type not found`);
          errors++;
          continue;
        }

        // Calculate price based on current liquor type price
        const pricePerUnit = transaction.liquorType.pricePerUnit || 0;
        const totalPrice = transaction.volumeMl * pricePerUnit;

        // Update transaction
        await Transaction.updateOne(
          { _id: transaction._id },
          { 
            $set: { 
              pricePerUnit: pricePerUnit,
              totalPrice: totalPrice
            } 
          }
        );

        console.log(`✅ Updated transaction ${transaction._id}: ${transaction.liquorType.name} ${transaction.volumeMl}ml = ₹${totalPrice.toFixed(2)}`);
        updated++;

        // If transaction was approved, update user's totalSpentToday
        if (transaction.status === 'approved' && transaction.user) {
          const user = await User.findById(transaction.user._id);
          if (user) {
            // Only update if the transaction is from today (within 20 hours of user's lastResetDate)
            const hoursSinceReset = (new Date() - new Date(user.lastResetDate)) / (1000 * 60 * 60);
            const transactionAge = (new Date() - new Date(transaction.timestamp)) / (1000 * 60 * 60);
            
            if (transactionAge < 20 && hoursSinceReset < 20) {
              user.totalSpentToday = (user.totalSpentToday || 0) + totalPrice;
              await user.save();
              console.log(`   💰 Updated user ${user.userId} spending: ₹${user.totalSpentToday.toFixed(2)}`);
            }
          }
        }

      } catch (error) {
        console.error(`❌ Error updating transaction ${transaction._id}:`, error.message);
        errors++;
      }
    }

    console.log(`\n✅ Update completed!`);
    console.log(`   Updated: ${updated} transactions`);
    console.log(`   Errors: ${errors} transactions`);
    console.log(`\n📊 Sample updated transactions:\n`);

    // Show some sample transactions
    const samples = await Transaction.find({ totalPrice: { $gt: 0 } })
      .populate('liquorType', 'name')
      .populate('user', 'userId')
      .limit(5)
      .sort({ timestamp: -1 });

    samples.forEach(t => {
      console.log(`   ${t.user?.userId || 'N/A'} - ${t.liquorType?.name || 'N/A'} ${t.volumeMl}ml = ₹${t.totalPrice.toFixed(2)}`);
    });

    console.log('\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

updateTransactionPrices();
