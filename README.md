# AlcoSecure - QR-Based Alcohol Purchase Monitoring System

![Project Status](https://img.shields.io/badge/status-production--ready-green)
![Node.js](https://img.shields.io/badge/node.js-v18+-blue)
![MongoDB](https://img.shields.io/badge/mongodb-v6+-green)
![License](https://img.shields.io/badge/license-MIT-blue)

A comprehensive, production-ready web application that tracks and regulates alcohol purchases using QR-code-based identity verification and scientific alcohol consumption monitoring.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Usage Guide](#usage-guide)
- [Core Business Logic](#core-business-logic)
- [Security Features](#security-features)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

AlcoSecure is a responsible drinking initiative that uses technology to monitor and regulate alcohol consumption. By tracking pure alcohol intake using scientific formulas and enforcing daily limits, we promote healthier drinking habits while protecting user privacy.

### Key Highlights

- **QR-Code Identity System**: Each user receives a unique QR code for secure purchases
- **Scientific Tracking**: Uses the formula `Pure Alcohol (grams) = Volume (ml) × Alcohol % × 0.789`
- **20-Hour Regulation**: Automatic consumption limits with reset functionality after 20 hours
- **Real-time Monitoring**: Instant approval/rejection based on consumption limits
- **Multi-Role System**: Separate interfaces for users, vendors, and administrators
- **Privacy-First**: Aadhaar stored as SHA-256 hash for maximum security

## ✨ Features

### For Users
- ✅ Secure registration with Aadhaar verification
- ✅ Unique QR code generation for identity
- ✅ Real-time consumption tracking
- ✅ Transaction history with detailed breakdowns
- ✅ Daily limit monitoring with visual progress
- ✅ Download QR code functionality

### For Vendors
- ✅ QR code scanning (camera or manual entry)
- ✅ Real-time user consumption lookup
- ✅ Purchase processing with instant approval/rejection
- ✅ Transaction history and statistics
- ✅ Multiple liquor type support

### For Administrators
- ✅ System-wide dashboard with analytics
- ✅ User and vendor management
- ✅ Liquor type configuration (CRUD operations)
- ✅ Daily limit configuration
- ✅ Comprehensive transaction reports
- ✅ User/vendor activation/deactivation

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: bcryptjs
- **QR Generation**: qrcode
- **Scheduling**: node-cron
- **Validation**: express-validator

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Custom styles with Bootstrap 5
- **JavaScript**: Vanilla ES6+
- **QR Scanning**: html5-qrcode library
- **UI Framework**: Bootstrap 5.3.2
- **Icons**: Font Awesome 6.4.2

## 📁 Project Structure

```
AlcoSecure/
├── config/
│   └── database.js              # MongoDB connection configuration
├── models/
│   ├── User.js                  # User schema and methods
│   ├── Vendor.js                # Vendor schema and methods
│   ├── Admin.js                 # Admin schema and methods
│   ├── LiquorType.js            # Liquor type schema
│   ├── SystemConfig.js          # System configuration schema
│   └── Transaction.js           # Transaction schema
├── middleware/
│   ├── auth.js                  # JWT authentication middleware
│   ├── errorHandler.js          # Global error handler
│   └── validators.js            # Input validation middleware
├── routes/
│   ├── auth.js                  # Authentication routes
│   ├── users.js                 # User routes
│   ├── vendors.js               # Vendor routes
│   └── admin.js                 # Admin routes
├── utils/
│   ├── jwtToken.js              # JWT token utilities
│   ├── qrCode.js                # QR code generation
│   ├── alcoholCalculator.js    # Pure alcohol calculation
│   ├── aadhaarHash.js           # Aadhaar hashing
│   ├── cronJobs.js              # Daily reset cron jobs
│   └── seedData.js              # Database seeding script
├── public/
│   ├── index.html               # Landing page
│   ├── user-dashboard.html      # User dashboard
│   ├── vendor-dashboard.html    # Vendor dashboard
│   ├── admin-dashboard.html     # Admin dashboard
│   ├── css/
│   │   └── styles.css           # Custom styles
│   └── js/
│       ├── main.js              # Landing page JS
│       ├── user-dashboard.js    # User dashboard JS
│       ├── vendor-dashboard.js  # Vendor dashboard JS
│       └── admin-dashboard.js   # Admin dashboard JS
├── server.js                    # Main application entry point
├── package.json                 # Dependencies and scripts
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
└── README.md                    # This file
```

## 📦 Installation

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **MongoDB**: v6.0 or higher (locally or MongoDB Atlas)
- **npm**: v9.0.0 or higher

### Step 1: Clone or Extract the Project

```bash
cd AlcoSecure
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages:
- express
- mongoose
- bcryptjs
- jsonwebtoken
- dotenv
- cors
- qrcode
- node-cron
- express-validator

### Step 3: MongoDB Setup

**Option A: Local MongoDB**
```bash
# Make sure MongoDB is running
mongod
```

**Option B: MongoDB Atlas**
1. Create account at https://www.mongodb.com/atlas
2. Create a cluster
3. Get connection string

## ⚙️ Configuration

### Create Environment File

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

### Edit `.env` File

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/alcosecure
# Or for Atlas: mongodb+srv://username:password@cluster.mongodb.net/alcosecure

# JWT Secret Key (CHANGE THIS!)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_asd89f7asdf89

# Server Port
PORT=5000

# Node Environment
NODE_ENV=development

# Default Daily Alcohol Limit (in grams)
DEFAULT_DAILY_LIMIT=60

# JWT Expiration
JWT_EXPIRE=7d

# Bcrypt Salt Rounds
BCRYPT_ROUNDS=10
```

**⚠️ IMPORTANT**: Change the `JWT_SECRET` to a random, secure string in production!

## 🚀 Running the Application

### Step 1: Seed the Database (First Time Only)

This creates the default admin account and sample liquor types:

```bash
npm run seed
```

**Default Admin Credentials:**
- Email: `admin@alcosecure.com`
- Password: `admin123`

**⚠️ Change the admin password immediately after first login in production!**

### Step 2: Start the Server

**Development Mode (with auto-reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

### Step 3: Access the Application

Open your browser and navigate to:

```
http://localhost:5000
```

## 📖 Usage Guide

### For Users

1. **Register**: Click "User Login/Register" → Register tab
   - Enter name, email, password, and 12-digit Aadhaar
   - Get unique User ID and QR code

2. **View QR Code**: Dashboard → My QR Code
   - Show this to vendors when purchasing
   - Download for offline use

3. **Check Consumption**: Dashboard shows:
   - Today's consumption
   - Remaining limit
   - Visual progress bar
   - Transaction history

### For Vendors

1. **Register**: Click "Vendor Login" → Register
   - Enter business details and license number

2. **Scan & Process Purchase**:
   - Click "Scan QR Code"
   - Allow camera access or enter User ID manually
   - View user's current consumption
   - Select liquor type and volume
   - System auto-approves or rejects

3. **View Transactions**: See all purchase attempts

### For Administrators

1. **Login**: Use default credentials (see above)

2. **Manage System**:
   - View dashboard statistics
   - Manage users and vendors
   - Add/edit liquor types
   - Set daily alcohol limits
   - View all transactions

## 🧮 Core Business Logic

### Pure Alcohol Calculation

```javascript
Pure Alcohol (grams) = Volume (ml) × Alcohol Percentage × 0.789
```

**Example:**
- Beer: 330ml × 5% × 0.789 = **13.02g**
- Wine: 150ml × 12% × 0.789 = **14.20g**
- Whisky: 60ml × 40% × 0.789 = **18.94g**

### Daily Limit Enforcement

```javascript
if (consumed_today + new_purchase > daily_limit) {
    → REJECT purchase
    → Show remaining allowance
} else {
    → APPROVE purchase
    → Update consumed_today
}
```

### 20-Hour Reset

- Cron job runs every hour
- Checks users whose `lastResetDate` > 20 hours ago
- Resets `consumedToday` to 0
- Updates `lastResetDate` to current time

## 🔒 Security Features

1. **Password Hashing**: bcrypt with 10 salt rounds
2. **Aadhaar Protection**: SHA-256 hashing (never stored in plain text)
3. **JWT Authentication**: Secure token-based auth
4. **Role-Based Access**: Separate permissions for user/vendor/admin
5. **Input Validation**: express-validator on all inputs
6. **CORS Protection**: Configurable CORS policies
7. **Error Handling**: Centralized error management

## 📡 API Documentation

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for complete API reference.

**Quick Reference:**

### Authentication Endpoints
```
POST /api/auth/user/register      - Register new user
POST /api/auth/user/login         - User login
POST /api/auth/vendor/register    - Register vendor
POST /api/auth/vendor/login       - Vendor login
POST /api/auth/admin/login        - Admin login
```

### User Endpoints
```
GET  /api/users/profile           - Get user profile
GET  /api/users/qrcode            - Get user QR code
GET  /api/users/consumption       - Get consumption status
GET  /api/users/transactions      - Get transaction history
```

### Vendor Endpoints
```
POST /api/vendors/scan            - Scan user QR code
POST /api/vendors/purchase        - Process purchase
GET  /api/vendors/transactions    - Get transactions
GET  /api/vendors/liquor-types    - Get liquor types
```

### Admin Endpoints
```
GET  /api/admin/dashboard         - Get dashboard stats
GET  /api/admin/users             - Get all users
GET  /api/admin/vendors           - Get all vendors
POST /api/admin/liquor-types      - Create liquor type
PUT  /api/admin/config/daily-limit - Update daily limit
```

## 🧪 Testing


selva
### Manual Testing Workflow

1. **Seed Database**: `npm run seed`
2. **Start Server**: `npm run dev`
3. **Register Test User**:
   - Name: Test User
   - Email: test@test.com
   - Password: test123
   - Aadhaar: 123456789012
4. **Register Test Vendor**:
   - Login as vendor
   - Complete registration
5. **Test Purchase Flow**:
   - Vendor scans user QR
   - Select beer (330ml, 5%)
   - Should approve if under limit

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: Could not connect to MongoDB
```
**Solution**: Ensure MongoDB is running and MONGODB_URI is correct in `.env`

### Port Already in Use
```
Error: Port 5000 already in use
```
**Solution**: Change PORT in `.env` or kill the process using port 5000

### QR Scanner Not Working
```
Unable to access camera
```
**Solution**: 
- Check browser permissions
- Use HTTPS in production
- Use manual User ID entry as fallback

## 📊 Sample Data

After running `npm run seed`, you'll have:

**Admin Account:**
- Email: admin@alcosecure.com
- Password: admin123

**Sample Liquor Types:**
- Kingfisher Beer (5%)
- Red Wine (12%)
- Royal Challenge Whisky (42.8%)
- Absolut Vodka (40%)
- Old Monk Rum (42.8%)
- And more...

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=very_long_random_secure_string
PORT=5000
```

### Deployment Platforms

**Recommended:**
- Backend: Heroku, Railway, Render, DigitalOcean
- Database: MongoDB Atlas
- Frontend: Same server (served by Express)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- World Health Organization for alcohol consumption guidelines
- Bootstrap team for the UI framework
- MongoDB team for the database
- Express.js community

## 📞 Support

For support, email support@alcosecure.com or open an issue in the repository.

## 🗺️ Roadmap

- [ ] SMS notifications for purchases
- [ ] Advanced analytics dashboard
- [ ] Export reports to PDF/Excel
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Email verification
- [ ] Password reset functionality

---

**Made with ❤️ for responsible drinking**

**Remember: Drink responsibly, Stay healthy!**
