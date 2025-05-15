/**
 * Password Verification Route
 * Handles verification of user passwords
 */

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { check, validationResult } = require("express-validator");

/**
 * @route   POST /api/verify-password
 * @desc    Verify user's current password
 * @access  Public
 */
router.post(
  "/",
  [
    // Input validation
    check("email").isEmail().withMessage("Please provide a valid email"),
    check("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      // Check validation results
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: errors.array()[0].msg,
          errorType: "validation_error",
          errors: errors.array(),
        });
      }

      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email: email.toLowerCase() });

      // If user doesn't exist
      if (!user) {
        return res.status(400).json({
          valid: false,
          message: "Invalid credentials",
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(400).json({
          valid: false,
          message: "Invalid credentials",
        });
      }

      // Password is valid
      return res.json({
        valid: true,
        message: "Password verified successfully",
      });
    } catch (error) {
      console.error("Error verifying password:", error);
      res.status(500).json({ message: "Server error occurred" });
    }
  }
);

module.exports = router;
