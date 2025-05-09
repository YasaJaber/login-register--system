/**
 * User Model
 * Defines the user schema for MongoDB
 */

const mongoose = require("mongoose");

/**
 * User Schema Definition
 * @typedef {Object} UserSchema
 * @property {string} name - User's display name
 * @property {string} email - User's email address (unique identifier)
 * @property {string} password - Hashed user password
 * @property {string} recoveryCode - Code for account recovery
 * @property {Date} createdAt - Account creation timestamp
 * @property {string} provider - Authentication provider (local, google, facebook)
 * @property {string} socialId - ID from social authentication provider
 * @property {Date} lastLogin - Last login timestamp
 */
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  recoveryCode: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  provider: {
    type: String,
    enum: ["local", "google", "facebook"],
    default: "local",
  },
  socialId: {
    type: String,
    default: null,
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
});

// Export User model
module.exports = mongoose.model("User", UserSchema);
