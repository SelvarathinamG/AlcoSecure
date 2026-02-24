/**
 * Seed Aadhaar Data
 * Populates the database with dummy Aadhaar records for testing
 */

const mongoose = require('mongoose');
const Aadhaar = require('../models/Aadhaar');
require('dotenv').config();

const aadhaarData = [
  {
    "aadhaar_no": "482793651204",
    "first_name": "Arun",
    "date_of_birth": "1998-04-12",
    "gender": "Male",
    "email": "arun98@example.com",
    "mobile_number": "9876543210"
  },
  {
    "aadhaar_no": "593847261509",
    "first_name": "Karthik",
    "date_of_birth": "1999-08-21",
    "gender": "Male",
    "email": "karthik99@example.com",
    "mobile_number": "9123456780"
  },
  {
    "aadhaar_no": "671928345612",
    "first_name": "Rahul",
    "date_of_birth": "1997-02-18",
    "gender": "Male",
    "email": "rahul97@example.com",
    "mobile_number": "9988776655"
  },
  {
    "aadhaar_no": "734829165043",
    "first_name": "Vijay",
    "date_of_birth": "1996-11-30",
    "gender": "Male",
    "email": "vijay96@example.com",
    "mobile_number": "9090909090"
  },
  {
    "aadhaar_no": "829174563210",
    "first_name": "Suresh",
    "date_of_birth": "2012-07-14",
    "gender": "Male",
    "email": "suresh95@example.com",
    "mobile_number": "9012345678"
  },
  {
    "aadhaar_no": "918273645019",
    "first_name": "Manoj",
    "date_of_birth": "2000-01-05",
    "gender": "Male",
    "email": "manoj00@example.com",
    "mobile_number": "9345678901"
  },
  {
    "aadhaar_no": "827364519283",
    "first_name": "Ajay",
    "date_of_birth": "2010-09-09",
    "gender": "Male",
    "email": "ajay98@example.com",
    "mobile_number": "9567890123"
  },
  {
    "aadhaar_no": "746382915604",
    "first_name": "Ramesh",
    "date_of_birth": "1994-03-22",
    "gender": "Male",
    "email": "ramesh94@example.com",
    "mobile_number": "9789012345"
  },
  {
    "aadhaar_no": "635472819056",
    "first_name": "Prakash",
    "date_of_birth": "2008-01-11",
    "gender": "Male",
    "email": "prakash99@example.com",
    "mobile_number": "9890123456"
  },
  {
    "aadhaar_no": "524361908273",
    "first_name": "Deepak",
    "date_of_birth": "2013-05-17",
    "gender": "Male",
    "email": "deepak97@example.com",
    "mobile_number": "9001234567"
  }
];

const seedAadhaarData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('✅ Connected to MongoDB');

    // Clear existing Aadhaar data
    await Aadhaar.deleteMany({});
    console.log('🗑️  Cleared existing Aadhaar data');

    // Insert new Aadhaar data
    const inserted = await Aadhaar.insertMany(aadhaarData);
    console.log(`✅ Successfully inserted ${inserted.length} Aadhaar records`);

    // Display summary with age information
    console.log('\n📊 Aadhaar Data Summary:');
    console.log('----------------------------------------');
    for (const record of inserted) {
      const age = record.calculateAge();
      const ageStatus = age >= 18 ? '✅ Adult' : '❌ Minor';
      console.log(`${record.first_name} (${record.aadhaar_no}) - Age: ${age} ${ageStatus}`);
    }
    console.log('----------------------------------------\n');

    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding Aadhaar data:', error.message);
    process.exit(1);
  }
};

seedAadhaarData();
