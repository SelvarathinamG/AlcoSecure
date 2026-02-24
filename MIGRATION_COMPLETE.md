# AlcoSecure Database Migration Complete! 🎉

## Migration Summary
All data and configurations from **ethanoltrack** database have been successfully migrated to **alcosecure** database on MongoDB Cluster0.

---

## ✅ What Has Been Migrated

### 1. 🍺 Liquor Types with Pricing (12 Types)

#### Beer
- **Kingfisher Beer** - 5% alcohol - ₹0.15/ml
- **Budweiser** - 5% alcohol - ₹0.18/ml

#### Wine  
- **Red Wine** - 12% alcohol - ₹0.35/ml
- **White Wine** - 11% alcohol - ₹0.32/ml

#### Whisky
- **Royal Challenge Whisky** - 42.8% alcohol - ₹1.2/ml
- **Johnnie Walker Black Label** - 40% alcohol - ₹2.5/ml

#### Vodka
- **Absolut Vodka** - 40% alcohol - ₹1.8/ml
- **Smirnoff Vodka** - 37.5% alcohol - ₹1.5/ml

#### Rum
- **Old Monk Rum** - 42.8% alcohol - ₹0.8/ml
- **Bacardi White Rum** - 37.5% alcohol - ₹1.6/ml

#### Brandy
- **McDowell's Brandy** - 42.8% alcohol - ₹0.9/ml

#### Gin
- **Tanqueray Gin** - 47.3% alcohol - ₹2.0/ml

---

### 2. ⚙️ System Configuration

#### Daily Alcohol Limit
- **Limit**: 60 grams of pure alcohol
- **Window**: 20 hours (not 24 hours!)
- **Calculation**: Volume (ml) × Alcohol % × 0.789 = grams of pure alcohol

#### Reset Configuration
- **Reset Window**: 20 hours
- **Automatic Reset**: Cron job runs every hour to check users
- **Reset Triggers**: If last reset was more than 20 hours ago, consumption resets to 0

---

### 3. 👤 Admin Account

- **Email**: admin@alcosecure.com
- **Password**: admin123
- **Role**: Super Administrator
- **Permissions**: Full system access

⚠️ **IMPORTANT**: Change the default password after first login!

---

### 4. 📇 Aadhaar Verification Data (10 Records)

#### Adults (18+ years) - 7 users
- Arun (27 years) - Can register ✅
- Karthik (26 years) - Can register ✅
- Rahul (29 years) - Can register ✅
- Vijay (29 years) - Can register ✅
- Manoj (26 years) - Can register ✅
- Ramesh (31 years) - Can register ✅
- Prakash (18 years) - Can register ✅

#### Minors (Under 18) - 3 users
- Suresh (13 years) - Blocked with warning ❌
- Ajay (15 years) - Blocked with warning ❌
- Deepak (12 years) - Blocked with warning ❌

---

## 🔧 Available Commands

### Setup & Migration
```bash
npm run setup           # Run complete AlcoSecure setup
npm run seed            # Seed basic data (admin + liquor types)
npm run seed-aadhaar    # Seed Aadhaar verification data
node utils/migratePrices.js      # Update liquor prices
node utils/viewLiquorPrices.js   # View all liquor types & prices
```

### Running the Server
```bash
npm start               # Start production server
npm run dev             # Start development server (auto-reload)
```

---

## 📊 Database Details

- **Cluster**: cluster0
- **Database**: alcosecure
- **Collections**:
  - `admins` - 1 record
  - `liquortypes` - 12 records
  - `systemconfigs` - 2 records
  - `aadhars` - 10 records
  - `users` - (created on registration)
  - `vendors` - (created on vendor registration)
  - `transactions` - (created on purchases)

---

## 🎯 Key Features Migrated

### 1. 20-Hour Consumption Window
- Users can consume up to 60g of pure alcohol
- Window resets automatically after 20 hours (not 24!)
- Cron job checks every hour for users to reset
- Formula: `Volume (ml) × Alcohol % × 0.789`

### 2. Pricing System
- All liquor types have per-ml pricing
- Automatic calculation of total cost
- Transaction tracking with price history

### 3. Age Verification
- Mandatory Aadhaar verification
- Email must match Aadhaar records
- Mobile must match Aadhaar records
- Age calculated from DOB - must be 18+
- Underage users get warning modal popup

### 4. QR Code System
- Unique QR code generated for each user
- Used for vendor scanning
- Links to user consumption data

---

## 🚀 Quick Start Guide

### For Testing

1. **Start the Server**:
   ```bash
   npm start
   ```

2. **Access Application**:
   - URL: http://localhost:5000
   
3. **Test User Registration** (Adult):
   - Email: `arun98@example.com`
   - Mobile: `9876543210`
   - Aadhaar: `482793651204`
   - Password: Any password (6+ chars)
   
4. **Test Age Restriction** (Minor):
   - Email: `suresh95@example.com`
   - Mobile: `9012345678`
   - Aadhaar: `829174563210`
   - Should show warning modal ❌

5. **Admin Login**:
   - Email: `admin@alcosecure.com`
   - Password: `admin123`

---

## 📝 Technical Implementation

### Alcohol Calculation
```javascript
pureAlcoholGrams = volume_ml × (alcoholPercentage / 100) × 0.789
```

### 20-Hour Reset Logic
```javascript
// Runs every hour
const twentyHoursAgo = new Date(now.getTime() - 20 * 60 * 60 * 1000);

// Reset users if last reset > 20 hours ago
User.updateMany(
  { lastResetDate: { $lte: twentyHoursAgo } },
  { $set: { consumedToday: 0, totalSpentToday: 0, lastResetDate: now } }
)
```

### Age Verification
```javascript
age = currentYear - birthYear - (birthMonth/Day hasn't occurred yet ? 1 : 0)
if (age < 18) {
  return error with warning modal
}
```

---

## ✅ Migration Checklist

- [x] Database name changed from `ethanoltrack` to `alcosecure`
- [x] 12 Liquor types with pricing migrated
- [x] 60g daily limit configured
- [x] 20-hour reset window configured
- [x] Admin account created
- [x] 10 Aadhaar records seeded (7 adults + 3 minors)
- [x] Age verification enabled (18+)
- [x] Pricing per ml configured
- [x] Cron job for 20-hour reset active
- [x] QR code generation working
- [x] All deprecated MongoDB options removed

---

## 🔐 Security Features

1. **Password Hashing**: bcrypt with 10 salt rounds
2. **Aadhaar Hashing**: SHA-256 for secure storage
3. **JWT Tokens**: 7-day expiration
4. **Age Verification**: Prevents underage registration
5. **Email/Mobile Verification**: Must match Aadhaar records

---

## 🎉 Everything is Ready!

Your AlcoSecure system is now fully configured with:
- ✅ All liquor types and prices
- ✅ 60g daily limit with 20-hour reset
- ✅ Age verification (18+)
- ✅ Admin account
- ✅ Aadhaar verification system
- ✅ Complete pricing structure

**Server is running at**: http://localhost:5000

Start testing the system! 🚀
