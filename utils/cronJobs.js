/**
 * Daily Reset Job
 * Cronjob that runs daily to reset user consumption
 */

const cron = require('node-cron');
const User = require('../models/User');

/**
 * Reset consumption for users whose 24 hours have passed
 * Runs every hour to check and reset
 */
const startDailyResetJob = () => {
  // Run every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('🔄 Running daily consumption reset check...');

      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Find users whose last reset was more than 24 hours ago
      const result = await User.updateMany(
        {
          lastResetDate: { $lte: twentyFourHoursAgo },
          consumedToday: { $gt: 0 }
        },
        {
          $set: {
            consumedToday: 0,
            lastResetDate: now
          }
        }
      );

      if (result.modifiedCount > 0) {
        console.log(`✅ Reset consumption for ${result.modifiedCount} users`);
      }
    } catch (error) {
      console.error('❌ Error in daily reset job:', error);
    }
  });

  console.log('✅ Daily reset cron job started');
};

module.exports = {
  startDailyResetJob
};
