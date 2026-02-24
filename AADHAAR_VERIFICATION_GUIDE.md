# Aadhaar Verification System - Implementation Guide

## Overview
The system now includes Aadhaar verification for user registration with the following validations:
1. Aadhaar number must exist in the database
2. Email must match Aadhaar records
3. Mobile number must match Aadhaar records
4. User must be 18+ years old (calculated from date of birth)

## Test Data Available

### Adults (Can Register ✅)
- **Arun** - Age: 27
  - Aadhaar: `482793651204`
  - Email: `arun98@example.com`
  - Mobile: `9876543210`

- **Karthik** - Age: 26
  - Aadhaar: `593847261509`
  - Email: `karthik99@example.com`
  - Mobile: `9123456780`

- **Rahul** - Age: 29
  - Aadhaar: `671928345612`
  - Email: `rahul97@example.com`
  - Mobile: `9988776655`

- **Vijay** - Age: 29
  - Aadhaar: `734829165043`
  - Email: `vijay96@example.com`
  - Mobile: `9090909090`

- **Manoj** - Age: 26
  - Aadhaar: `918273645019`
  - Email: `manoj00@example.com`
  - Mobile: `9345678901`

- **Ramesh** - Age: 31
  - Aadhaar: `746382915604`
  - Email: `ramesh94@example.com`
  - Mobile: `9789012345`

- **Prakash** - Age: 18
  - Aadhaar: `635472819056`
  - Email: `prakash99@example.com`
  - Mobile: `9890123456`

### Minors (Will Show Warning ❌)
- **Suresh** - Age: 13
  - Aadhaar: `829174563210`
  - Email: `suresh95@example.com`
  - Mobile: `9012345678`

- **Ajay** - Age: 15
  - Aadhaar: `827364519283`
  - Email: `ajay98@example.com`
  - Mobile: `9567890123`

- **Deepak** - Age: 12
  - Aadhaar: `524361908273`
  - Email: `deepak97@example.com`
  - Mobile: `9001234567`

## How to Test

### Testing Successful Registration (Adult):
1. Go to the registration form
2. Fill in:
   - Full Name: `Arun Kumar` (any name)
   - Email: `arun98@example.com` (must match exactly)
   - Mobile Number: `9876543210` (must match exactly)
   - Password: `password123` (any password 6+ chars)
   - Aadhaar Number: `482793651204` (must match exactly)
3. Submit the form
4. ✅ Registration should succeed

### Testing Age Restriction (Minor):
1. Go to the registration form
2. Fill in:
   - Full Name: `Suresh Kumar` (any name)
   - Email: `suresh95@example.com` (must match exactly)
   - Mobile Number: `9012345678` (must match exactly)
   - Password: `password123` (any password)
   - Aadhaar Number: `829174563210` (must match exactly)
3. Submit the form
4. ❌ A warning modal will appear: "You must be at least 18 years old to register"

### Testing Validation Errors:
1. **Wrong Email**: Use correct Aadhaar and mobile, but different email
   - Error: "Email does not match Aadhaar records"

2. **Wrong Mobile**: Use correct Aadhaar and email, but different mobile
   - Error: "Mobile number does not match Aadhaar records"

3. **Non-existent Aadhaar**: Use an Aadhaar number not in the database
   - Error: "Aadhaar number not found in database"

## Files Modified/Created

### New Files:
1. `models/Aadhaar.js` - Aadhaar data model with verification methods
2. `utils/seedAadhaarData.js` - Script to populate dummy Aadhaar data

### Modified Files:
1. `routes/auth.js` - Added Aadhaar verification in registration
2. `public/index.html` - Added mobile number field to registration form
3. `public/js/main.js` - Added mobile field and underage warning modal
4. `middleware/validators.js` - Added mobile number validation
5. `package.json` - Added `seed-aadhaar` script

## Commands

### Re-seed Aadhaar Data (if needed):
```bash
npm run seed-aadhaar
```

### Start the Server:
```bash
npm start
```

or for development with auto-reload:
```bash
npm run dev
```

## Database
- **Cluster**: cluster0
- **Database Name**: alcosecure
- **Collection**: aadhars (stores the dummy Aadhaar data)

## API Response Examples

### Successful Registration:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "name": "Arun",
    "email": "arun98@example.com",
    ...
  }
}
```

### Underage User:
```json
{
  "success": false,
  "message": "You must be at least 18 years old to register",
  "isUnderage": true,
  "age": 13
}
```

### Email Mismatch:
```json
{
  "success": false,
  "message": "Email does not match Aadhaar records"
}
```

### Mobile Mismatch:
```json
{
  "success": false,
  "message": "Mobile number does not match Aadhaar records"
}
```

### Aadhaar Not Found:
```json
{
  "success": false,
  "message": "Aadhaar number not found in database"
}
```
