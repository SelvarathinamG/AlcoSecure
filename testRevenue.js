// Test revenue calculation
require('dotenv').config();
const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');
const Vendor = require('./models/Vendor'); // Load Vendor model

const testRevenue = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Get all today's transactions
    const todayTrans = await Transaction.find({
      timestamp: { $gte: todayStart }
    }).select('vendor status totalPrice timestamp');

    console.log('📊 Today\'s Transactions:', todayTrans.length);
    todayTrans.forEach(t => {
      console.log(`  - Vendor: ${t.vendor} | ${t.status} | ₹${t.totalPrice || 0} | ${new Date(t.timestamp).toLocaleString()}`);
    });

    // Test aggregation
    const result = await Transaction.aggregate([
      {
        $match: {
          timestamp: { $gte: todayStart },
          status: 'approved'
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalPrice' },
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('\n💰 Aggregation Result:', JSON.stringify(result, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

testRevenue();
