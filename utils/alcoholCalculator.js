/**
 * Alcohol Calculation Utilities
 * Core business logic for calculating pure alcohol content
 */

/**
 * Calculate pure alcohol in grams
 * Formula: Volume (ml) × Alcohol % × 0.789
 * 
 * @param {number} volumeMl - Volume of alcohol in milliliters
 * @param {number} alcoholPercentage - Alcohol percentage (0-100)
 * @returns {number} Pure alcohol in grams (rounded to 2 decimal places)
 */
const calculatePureAlcohol = (volumeMl, alcoholPercentage) => {
  const ALCOHOL_DENSITY = 0.789; // g/ml at room temperature
  const pureAlcohol = volumeMl * (alcoholPercentage / 100) * ALCOHOL_DENSITY;
  return Math.round(pureAlcohol * 100) / 100; // Round to 2 decimal places
};

/**
 * Check if purchase is within daily limit
 * 
 * @param {number} consumedToday - Already consumed alcohol in grams
 * @param {number} newAlcoholGrams - New purchase amount in grams
 * @param {number} dailyLimit - Maximum allowed per day in grams
 * @returns {object} { allowed: boolean, remaining: number, reason: string }
 */
const checkDailyLimit = (consumedToday, newAlcoholGrams, dailyLimit) => {
  const totalAfterPurchase = consumedToday + newAlcoholGrams;
  const remaining = dailyLimit - consumedToday;

  if (totalAfterPurchase > dailyLimit) {
    return {
      allowed: false,
      remaining: Math.max(0, remaining),
      reason: `Purchase would exceed daily limit. You have ${remaining.toFixed(2)}g remaining out of ${dailyLimit}g daily limit.`
    };
  }

  return {
    allowed: true,
    remaining: dailyLimit - totalAfterPurchase,
    reason: null
  };
};

/**
 * Check if 20 hours have passed since last reset
 * 
 * @param {Date} lastResetDate - Last reset date
 * @returns {boolean} True if 20 hours have passed
 */
const shouldResetConsumption = (lastResetDate) => {
  const now = new Date();
  const hoursSinceReset = (now - new Date(lastResetDate)) / (1000 * 60 * 60);
  return hoursSinceReset >= 20;
};

module.exports = {
  calculatePureAlcohol,
  checkDailyLimit,
  shouldResetConsumption
};
