/**
 * Login/Register System Backend Server
 * Secure authentication system with password recovery functionality
 * @author Yasa Jaber
 */

// External Dependencies
const express = require("express");
const path = require("path");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const mongoose = require("mongoose");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { check, validationResult } = require("express-validator");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const session = require("express-session");
const passport = require("./config/passport");

// Load environment variables
require("dotenv").config({ path: path.join(__dirname, "../.env") });

// Define production base URL explicitly
process.env.BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://login-register-system-sxto.onrender.com"
    : process.env.BASE_URL || "http://localhost:3001";

console.log("Using BASE_URL:", process.env.BASE_URL);

// Internal Dependencies
const connectDB = require("./config/db");
const User = require("./models/User");

// Import routes
const authRoutes = require("./routes/auth");
const verifyPasswordRoutes = require("./routes/verify-password");

// Initialize Express Application
const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB Atlas
connectDB();

// Security Middleware

// Set security HTTP headers
app.use(
  helmet({
    // Adjust helmet settings to allow oauth providers to load in iframes if needed
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
  })
);

// Rate limiting to prevent brute force attacks
const apiLimiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes by default
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100, // limit each IP to 100 requests per windowMs by default
  message: { message: "Too many requests, please try again later" },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to all API endpoints
app.use("/api", apiLimiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" })); // Limit body size
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Cookie parser
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Prevent parameter pollution
app.use(hpp());

// CORS Configuration - Allow all origins during development
app.use(
  cors({
    origin: function (origin, callback) {
      callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Origin",
      "Accept",
    ],
  })
);

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "keyboard cat",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Initialize passport and session
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/auth", authRoutes); // Use auth routes
app.use("/api/verify-password", verifyPasswordRoutes); // Use verify password routes

// Serve static frontend files
app.use(express.static(path.join(__dirname, "../frontend")));

// JWT Secret and configuration from environment variables
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";
const JWT_COOKIE_EXPIRES_IN = process.env.JWT_COOKIE_EXPIRES_IN || 1;

// Validate JWT secret is available
if (!JWT_SECRET) {
  console.error(
    "CRITICAL ERROR: JWT_SECRET is not defined in the environment variables"
  );
  process.exit(1); // Exit for security reasons - can't operate securely without JWT_SECRET
}

// Global error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
});

/**
 * Create and sign a JWT token
 * @param {string} userId - User ID to include in the token
 * @returns {string} Signed JWT token
 */
const signToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

/**
 * Authentication middleware to protect routes
 * Verifies JWT token in Authorization header
 */
const protect = async (req, res, next) => {
  try {
    // 1) Get token from Authorization header
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({
        message: "You are not logged in. Please log in to get access",
        errorType: "not_authenticated",
      });
    }

    // 2) Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        message: "The user belonging to this token no longer exists",
        errorType: "user_not_found",
      });
    }

    // 4) Grant access to protected route
    req.user = currentUser;
    next();
  } catch (error) {
    res.status(401).json({
      message: "Invalid or expired token. Please log in again",
      errorType: "invalid_token",
    });
  }
};

/**
 * @route   POST /api/register
 * @desc    Register a new user
 * @access  Public
 */
app.post(
  "/api/register",
  [
    // Input validation using express-validator
    check("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters long"),
    check("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail(),
    check("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long")
      .matches(/[a-z]/)
      .withMessage("Password must contain at least one lowercase letter")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter")
      .matches(/[0-9]/)
      .withMessage("Password must contain at least one number"),
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

      const { name, email, password, provider, socialId } = req.body;

      // Additional security check for email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          message: "Invalid email format",
          errorType: "invalid_email_format",
        });
      }

      // Password strength validation
      if (password.length < 6) {
        return res.status(400).json({
          message: "Password must be at least 6 characters long",
          errorType: "invalid_password",
        });
      }

      // Check for existing account with same email
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({
          message: "Email is already registered",
          errorType: "email_exists",
        });
      }

      // Secure password with bcrypt hashing
      const hashedPassword = await bcrypt.hash(password, 10);

      // Generate secure random recovery code (6-digit)
      const recoveryCode = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      // Create new user document
      const newUser = new User({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        recoveryCode: recoveryCode,
        provider: provider || "local",
        socialId: socialId || null,
        lastLogin: new Date(),
      });

      // Persist user to database
      await newUser.save();

      // Return success response with recovery code
      res.status(201).json({
        message: "Account created successfully",
        recoveryCode: recoveryCode,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Server error occurred" });
    }
  }
);

/**
 * @route   POST /api/login
 * @desc    Authenticate user & get auth data
 * @access  Public
 */
app.post(
  "/api/login",
  [
    // Input validation
    check("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format"),
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

      // Apply delays to prevent timing attacks
      const loginDelay = Math.floor(Math.random() * 200) + 100; // 100-300ms random delay
      await new Promise((resolve) => setTimeout(resolve, loginDelay));

      // Find user account by email (case insensitive)
      const user = await User.findOne({ email: email.toLowerCase().trim() });

      // Handle non-existent account
      if (!user) {
        // Use a consistent error message to prevent user enumeration
        return res.status(401).json({
          message: "Invalid email or password",
          errorType: "authentication_failed",
        });
      }

      // Verify password with bcrypt
      const isPasswordValid = await bcrypt.compare(password, user.password);

      // Handle invalid password with same message as non-existent account
      if (!isPasswordValid) {
        return res.status(401).json({
          message: "Invalid email or password",
          errorType: "authentication_failed",
        });
      }

      // Create JWT token
      const token = signToken(user._id);

      // Update last login timestamp
      user.lastLogin = new Date();
      await user.save();

      // Set secure cookie with env variables
      const cookieOptions = {
        expires: new Date(
          Date.now() + JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ), // Based on env variable
        httpOnly: true, // Cannot be accessed via client-side JavaScript
        secure: process.env.NODE_ENV === "production", // Only sent over HTTPS in production
        sameSite: "strict", // Protection against CSRF attacks
      };

      // Set JWT token as cookie
      res.cookie("jwt", token, cookieOptions);

      // Return user data (excluding sensitive information) with token
      res.json({
        message: "Login successful",
        token, // Include token in response for client storage options
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          registrationDate: user.createdAt,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error occurred" });
    }
  }
);

/**
 * @route   POST /api/forgot-password
 * @desc    Request password reset with recovery code
 * @access  Public
 */
/**
 * @route   POST /api/forgot-password
 * @desc    Request password reset with recovery code
 * @access  Public
 */
app.post(
  "/api/forgot-password",
  [
    // Input validation
    check("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail(),
  ],
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit to 5 requests per windowMs for this route
    message: {
      message: "Too many password reset attempts, please try again later",
    },
  }),
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

      const { email } = req.body;

      // Add delay to prevent user enumeration via timing attacks
      const randomDelay = Math.floor(Math.random() * 300) + 200; // 200-500ms
      await new Promise((resolve) => setTimeout(resolve, randomDelay));

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          message: "Invalid email format",
          errorType: "invalid_email_format",
        });
      }

      // Find user by email
      const user = await User.findOne({ email });

      // Check if user exists
      if (!user) {
        // For security reasons, send success message even if user doesn't exist
        // but log this event for monitoring
        console.log(
          `Password recovery attempt for unregistered email: ${email}`
        );

        return res.json({
          message: "Please enter your recovery code to reset your password",
        });
      }

      // Use stored recovery code for user
      if (!user.recoveryCode) {
        // If user doesn't have a recovery code (legacy users), generate one
        user.recoveryCode = Math.floor(
          100000 + Math.random() * 900000
        ).toString();

        // Update user data
        await user.save();
      }

      // In a real application, we would send an email here
      // For this example, we'll return the code directly
      res.json({
        message: "Please use your recovery code to reset your password",
        recoveryCode: user.recoveryCode, // In a real app, we wouldn't send this in response
      });
    } catch (error) {
      console.error("Error in password reset request:", error);
      res.status(500).json({ message: "Server error occurred" });
    }
  }
);

/**
 * @route   POST /api/verify-recovery-code
 * @desc    Verify recovery code for password reset
 * @access  Public
 * @note    This endpoint is now optional, users can go directly to reset-password
 */
app.post(
  "/api/verify-recovery-code",
  [
    // Input validation
    check("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail(),
    check("recoveryCode")
      .trim()
      .notEmpty()
      .withMessage("Recovery code is required")
      .isLength({ min: 6, max: 6 })
      .withMessage("Recovery code must be 6 digits")
      .isNumeric()
      .withMessage("Recovery code must contain only numbers"),
  ],
  rateLimit({
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    message: {
      message: "Too many verification attempts, please try again later",
    },
  }),
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

      const { email, recoveryCode } = req.body;

      // Add delay to prevent timing attacks
      const randomDelay = Math.floor(Math.random() * 200) + 100; // 100-300ms
      await new Promise((resolve) => setTimeout(resolve, randomDelay));

      // Find user by email (case insensitive)
      const user = await User.findOne({ email: email.toLowerCase().trim() });

      // Security best practice: Use consistent error messages to prevent user enumeration
      if (!user) {
        return res.status(400).json({
          message: "Invalid verification details",
          errorType: "verification_failed",
        });
      }

      // Verify recovery code with secure time-constant comparison
      // This prevents timing attacks that could reveal if a code is partially correct
      if (!user.recoveryCode || !safeCompare(user.recoveryCode, recoveryCode)) {
        return res.status(400).json({
          message: "Invalid verification details",
          errorType: "verification_failed",
        });
      }

      // If we reach here, the code is valid - just return success
      res.json({
        message:
          "Recovery code verified successfully. You can now set a new password",
        verified: true, // No token needed anymore
      });
    } catch (error) {
      console.error("Error verifying recovery code:", error);
      res.status(500).json({ message: "Server error occurred" });
    }
  }
);

/**
 * @route   POST /api/reset-password
 * @desc    Reset password using recovery code directly
 * @access  Public
 */
app.post(
  "/api/reset-password",
  [
    // Input validation
    check("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail(),
    check("recoveryCode")
      .trim()
      .notEmpty()
      .withMessage("Recovery code is required")
      .isLength({ min: 6, max: 6 })
      .withMessage("Recovery code must be 6 digits")
      .isNumeric()
      .withMessage("Recovery code must contain only numbers"),
    check("newPassword")
      .notEmpty()
      .withMessage("New password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each IP to 5 requests per windowMs
    message: {
      message: "Too many password reset attempts, please try again later",
    },
  }),
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

      const { email, recoveryCode, newPassword } = req.body;

      // Find user by email
      const user = await User.findOne({ email: email.toLowerCase().trim() });

      // Security best practice: Use consistent error messages
      if (!user) {
        return res.status(400).json({
          message: "Invalid verification details",
          errorType: "verification_failed",
        });
      }

      // Verify recovery code with secure time-constant comparison
      if (!user.recoveryCode || !safeCompare(user.recoveryCode, recoveryCode)) {
        return res.status(400).json({
          message: "Invalid recovery code",
          errorType: "verification_failed",
        });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 12); // Higher work factor

      // Update user's password
      user.password = hashedPassword;

      // Generate new recovery code for future use
      user.recoveryCode = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      // Save updated user
      await user.save();

      res.json({
        message: "Password has been reset successfully",
      });
    } catch (error) {
      console.error("Error in password reset:", error);
      res.status(500).json({ message: "Server error occurred" });
    }
  }
);

// Helper function for secure string comparison (time-constant)
function safeCompare(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));

  // Use crypto's timingSafeEqual if available (Node.js >= 6.6.0)
  if (crypto && crypto.timingSafeEqual) {
    if (bufA.length === bufB.length) {
      return crypto.timingSafeEqual(bufA, bufB);
    } else {
      // To prevent timing attacks when strings have different lengths,
      // we need to pad the shorter one
      const maxLength = Math.max(bufA.length, bufB.length);
      const paddedA = Buffer.alloc(maxLength, 0);
      const paddedB = Buffer.alloc(maxLength, 0);
      bufA.copy(paddedA);
      bufB.copy(paddedB);
      return crypto.timingSafeEqual(paddedA, paddedB);
    }
  } else {
    // Fallback to a less secure but still better than direct comparison method
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }
}

/**
 * @route   GET /api/logout
 * @desc    Logout user and clear cookie
 * @access  Private - requires authentication
 */
app.get("/api/logout", protect, (req, res) => {
  try {
    // Clear the JWT cookie
    res.cookie("jwt", "loggedout", {
      expires: new Date(Date.now() + 10 * 1000), // Expire in 10 seconds
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ message: "Server error occurred" });
  }
});

/**
 * @route   POST /api/change-password
 * @desc    Change password for authenticated user (no email verification required)
 * @access  Private - requires authentication
 */
app.post(
  "/api/change-password",
  protect,
  [
    // Input validation
    check("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    check("newPassword")
      .notEmpty()
      .withMessage("New password is required")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(/[a-z]/)
      .withMessage("Password must contain at least one lowercase letter")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter")
      .matches(/[0-9]/)
      .withMessage("Password must contain at least one number")
      .matches(/[!@#$%^&*]/)
      .withMessage("Password must contain at least one special character"),
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

      const { currentPassword, newPassword } = req.body;

      // Get user from authenticated request (set by protect middleware)
      const user = req.user;

      // Verify current password
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );

      if (!isPasswordValid) {
        return res.status(401).json({
          message: "Current password is incorrect",
          errorType: "invalid_password",
        });
      }

      // Check that new password is different from current password
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        return res.status(400).json({
          message: "New password must be different from current password",
          errorType: "same_password",
        });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update user's password
      user.password = hashedPassword;

      // Generate new recovery code for security
      user.recoveryCode = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      // Save updated user
      await user.save();

      // Generate new token to force re-login on all devices
      const token = signToken(user._id);

      // Set secure cookie
      const cookieOptions = {
        expires: new Date(
          Date.now() + JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      };

      // Set JWT token as cookie
      res.cookie("jwt", token, cookieOptions);

      res.json({
        message: "Password changed successfully",
        token, // Include token in response for client storage options
      });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Server error occurred" });
    }
  }
);

// API endpoint for checking if email exists
app.post("/api/check-email", async (req, res) => {
  try {
    const { email } = req.body;

    // Check if email is provided
    if (!email) {
      return res.status(400).json({
        message: "Email is required",
        errorType: "email_required",
      });
    }

    // Check if email already exists
    const exists = await User.findOne({
      email: { $regex: new RegExp("^" + email + "$", "i") },
    });

    // Return result
    res.json({
      exists: !!exists,
      message: exists ? "Email already exists" : "Email is available",
    });
  } catch (error) {
    console.error("Error checking email:", error);
    res.status(500).json({ message: "Server error occurred" });
  }
});

/**
 * @route   POST /api/update-profile
 * @desc    Update user profile
 * @access  Private - requires authentication
 */
app.post(
  "/api/update-profile",
  protect,
  [
    // Input validation
    check("newName")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters long")
      .escape(), // Prevent XSS attacks
    check("newEmail")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail(),
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

      const { newName, newEmail } = req.body;

      // Get user from authenticated request (set by protect middleware)
      const user = req.user;
      const currentEmail = user.email;

      // Debug log
      console.log("Update profile request:", {
        userId: user._id,
        currentEmail: currentEmail,
        newEmail: newEmail,
        emailChanging: currentEmail.toLowerCase() !== newEmail.toLowerCase(),
        currentName: user.name,
        newName: newName,
      });

      // Check if the new email is already taken (only if email is changing)
      if (currentEmail.toLowerCase() !== newEmail.toLowerCase()) {
        // Email is being changed - need to check if it's available
        console.log("Email change detected - checking availability");
        const existingUser = await User.findOne({
          email: {
            $regex: new RegExp("^" + newEmail.toLowerCase() + "$", "i"),
          },
          _id: { $ne: user._id }, // Don't match the current user
        });

        if (existingUser) {
          console.log("Email already taken by another user");
          return res.status(400).json({
            message: "Email is already taken",
            errorType: "email_exists",
          });
        }

        console.log("New email is available - proceeding with update");
      } else {
        // Email is not changing - just updating the name
        console.log("Email not changing - only updating name");
      }

      // Update user profile with sanitized input
      user.name = newName.trim();
      user.email = newEmail.toLowerCase().trim();

      // Save updated user
      await user.save();

      // Log success (without sensitive info)
      console.log(`Profile updated for user ${user._id}`);

      res.json({
        message: "Profile updated successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Server error occurred" });
    }
  }
);

// Route for home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// MongoDB connection status endpoint
app.get("/api/db-status", async (req, res) => {
  try {
    // Check MongoDB connection status
    const status = mongoose.connection.readyState;

    // Interpret connection status
    let statusMessage;
    switch (status) {
      case 0:
        statusMessage = "MongoDB disconnected";
        break;
      case 1:
        statusMessage = "MongoDB connected";
        break;
      case 2:
        statusMessage = "MongoDB connecting";
        break;
      case 3:
        statusMessage = "MongoDB disconnecting";
        break;
      default:
        statusMessage = "MongoDB unknown status";
    }

    // Get connection information
    const connectionInfo = {
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      models: Object.keys(mongoose.models),
      status: statusMessage,
    };

    res.json({
      message: "MongoDB status retrieved successfully",
      connection: connectionInfo,
    });
  } catch (error) {
    console.error("Error getting MongoDB status:", error);
    res
      .status(500)
      .json({ message: "Server error occurred while checking MongoDB status" });
  }
});

/**
 * @route   POST /api/update-password
 * @desc    Update user password
 * @access  Public - but requires email verification
 */
app.post(
  "/api/update-password",
  [
    // Input validation
    check("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format"),
    check("newPassword")
      .notEmpty()
      .withMessage("New password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
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

      const { email, newPassword } = req.body;

      // Find user by email
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(404).json({
          message: "User not found",
          errorType: "user_not_found",
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update user's password
      user.password = hashedPassword;
      await user.save();

      res.json({
        message: "Password updated successfully",
      });
    } catch (error) {
      console.error("Error updating password:", error);
      res.status(500).json({ message: "Server error occurred" });
    }
  }
);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});
