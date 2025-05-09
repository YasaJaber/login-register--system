/**
 * MongoDB Database Configuration
 * Handles connection to MongoDB Atlas cloud database
 */

const mongoose = require("mongoose");

/**
 * Establishes connection to MongoDB database
 * @returns {Promise} MongoDB connection promise
 */
const connectDB = async () => {
  try {
    // Get MongoDB URI from environment variables
    const mongoURI = process.env.MONGO_URI;
    
    if (!mongoURI) {
      throw new Error("MongoDB connection string (MONGO_URI) is not defined in .env file");
    }

    const conn = await mongoose.connect(mongoURI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1); // Exit application on database connection failure
  }
};

module.exports = connectDB;
