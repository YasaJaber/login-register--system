// Database initialization script
// This script will migrate existing users from users.json to MongoDB

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Import User model
const User = require('../models/User');

// MongoDB connection string
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error('MongoDB connection string not found in .env file');
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected for initialization'))
.catch(err => {
  console.error('MongoDB connection error:', err.message);
  process.exit(1);
});

// Function to migrate JSON data to MongoDB
async function migrateDataToMongoDB() {
  try {
    // Path to users.json file
    const dataDir = path.join(__dirname, '../../data');
    const usersFilePath = path.join(dataDir, 'users.json');

    // Check if users.json exists
    if (!fs.existsSync(usersFilePath)) {
      console.log('No users.json file found, skipping migration');
      process.exit(0);
    }

    // Read data from users.json
    const data = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));

    // Skip if no users
    if (!data.users || data.users.length === 0) {
      console.log('No users found in users.json, skipping migration');
      process.exit(0);
    }

    // Count existing users in MongoDB
    const existingCount = await User.countDocuments();
    console.log(`Found ${existingCount} existing users in MongoDB`);

    // Check if data has already been migrated
    if (existingCount >= data.users.length) {
      console.log('Data already migrated to MongoDB');
      process.exit(0);
    }

    // Prepare users for MongoDB
    const usersToMigrate = data.users.map(user => ({
      name: user.name,
      email: user.email,
      password: user.password, // Password is already hashed in users.json
      recoveryCode: user.recoveryCode || Math.floor(100000 + Math.random() * 900000).toString(),
      createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
      provider: user.provider || 'local',
      socialId: user.socialId || null,
      lastLogin: user.lastLogin ? new Date(user.lastLogin) : new Date(),
    }));

    // Insert users into MongoDB
    const result = await User.insertMany(usersToMigrate);
    console.log(`Successfully migrated ${result.length} users to MongoDB`);

    // Rename users.json to users.json.bak to avoid duplicate migrations
    fs.renameSync(usersFilePath, `${usersFilePath}.bak`);
    console.log(`Renamed ${usersFilePath} to ${usersFilePath}.bak`);

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    // Close MongoDB connection
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run migration
migrateDataToMongoDB();