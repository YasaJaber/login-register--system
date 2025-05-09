const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const User = require("../models/User");
const JWT = require("jsonwebtoken");

// Get the base URL (default to localhost in development)
const BASE_URL = process.env.BASE_URL || "http://localhost:3001";

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Helper function to generate JWT token
const generateToken = (user) => {
  const JWT_SECRET =
    process.env.JWT_SECRET || "fallback_jwt_secret_for_social_auth";
  const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

  return JWT.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID:
        process.env.GOOGLE_CLIENT_ID ||
        "836260911585-4jlia4fhpn5bb66ufnb8sfuho1c5mv17.apps.googleusercontent.com",
      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET ||
        "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",
      callbackURL: `${BASE_URL}/api/auth/google/callback`,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // Extract profile data
        console.log("Google profile data:", profile);
        const email =
          profile.emails && profile.emails[0] ? profile.emails[0].value : null;

        if (!email) {
          return done(
            new Error("Google authentication failed: No email provided"),
            null
          );
        }

        // Check if we're in register mode or login mode
        // This comes from the custom state parameter or the URI
        const isRegisterMode =
          req.query.state === "register" ||
          req.path.includes("register") ||
          req.get("Referer")?.includes("register");
        console.log(
          "Auth mode detected:",
          isRegisterMode ? "Register" : "Login"
        );

        // Check if user exists
        let user = await User.findOne({ email: email });
        let isNewUser = false;

        // Validate based on mode (login vs register)
        if (user) {
          // User exists - check if they're trying to register
          if (isRegisterMode) {
            console.log(
              "User already exists but trying to register with Google"
            );
            return done(null, false, {
              message:
                "This email is already registered. Please login instead.",
            });
          }

          // User exists and is trying to login - update their details
          user.socialId = profile.id;
          user.provider = "google";
          user.lastLogin = new Date();
          console.log("Existing user logging in with Google:", user.email);
        } else {
          // User doesn't exist - check if they're trying to login
          if (!isRegisterMode) {
            console.log("User doesn't exist but trying to login with Google");
            return done(null, false, {
              message: "Account not found. Please register first.",
            });
          }

          // User doesn't exist and is trying to register - create new account
          isNewUser = true;
          user = new User({
            name: profile.displayName || "Google User",
            email: email,
            password: `google-${Math.random().toString(36).substring(2, 12)}`, // Random password
            socialId: profile.id,
            provider: "google",
            recoveryCode: Math.floor(
              100000 + Math.random() * 900000
            ).toString(),
            createdAt: new Date(),
            lastLogin: new Date(),
          });
          console.log("New user created from Google auth:", email);
        }

        // Save user
        await user.save();

        // Generate auth token
        const token = generateToken(user);

        // Add token and isNew flag to the user object
        user.token = token;
        user.isNewUser = isNewUser;

        return done(null, user);
      } catch (error) {
        console.error("Error in Google authentication strategy:", error);
        return done(error, null);
      }
    }
  )
);

// Facebook OAuth Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID || "702595068914731",
      clientSecret:
        process.env.FACEBOOK_APP_SECRET || "d5505fd165eda4c9e904096295954ee7",
      callbackURL: `${BASE_URL}/api/auth/facebook/callback`,
      profileFields: ["id", "emails", "name", "displayName"],
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // Extract profile data
        console.log("Facebook profile data:", profile);

        // Debug the request info to see what we're getting
        console.log("Facebook auth - Request state:", req.query.state);
        console.log("Facebook auth - Request path:", req.path);
        console.log("Facebook auth - Request referer:", req.get("Referer"));

        const email =
          profile.emails && profile.emails[0]
            ? profile.emails[0].value
            : `fb_${profile.id}@placeholder.com`;

        console.log("Facebook auth - User email:", email);

        // Check if we're in register mode or login mode
        // This comes from the custom state parameter or the URI
        const isRegisterMode =
          req.query.state === "register" ||
          req.path.includes("register") ||
          req.get("Referer")?.includes("register");
        console.log(
          "Facebook auth - Mode detected:",
          isRegisterMode ? "Register" : "Login"
        );

        // Check if user exists - using both email and socialId checks
        let user = await User.findOne({
          $or: [
            { email: email },
            { socialId: profile.id, provider: "facebook" },
          ],
        });

        console.log("Facebook auth - User exists:", !!user);
        if (user) {
          console.log(
            "Facebook auth - Existing user:",
            user.email,
            user.provider
          );
        }

        let isNewUser = false;

        // Validate based on mode (login vs register)
        if (user) {
          // User exists - check if they're trying to register
          if (isRegisterMode) {
            console.log(
              "VALIDATION ERROR: User already exists but trying to register with Facebook"
            );
            return done(null, false, {
              message:
                "This email is already registered. Please login instead.",
            });
          }

          // User exists and is trying to login - update their details
          user.socialId = profile.id;
          user.provider = "facebook";
          user.lastLogin = new Date();
          console.log("Existing user logging in with Facebook:", user.email);
        } else {
          // User doesn't exist - check if they're trying to login
          if (!isRegisterMode) {
            console.log(
              "VALIDATION ERROR: User doesn't exist but trying to login with Facebook"
            );
            return done(null, false, {
              message: "Account not found. Please register first.",
            });
          }

          // User doesn't exist and is trying to register - create new account
          isNewUser = true;
          user = new User({
            name: profile.displayName || "Facebook User",
            email: email,
            password: `facebook-${Math.random().toString(36).substring(2, 12)}`, // Random password
            socialId: profile.id,
            provider: "facebook",
            recoveryCode: Math.floor(
              100000 + Math.random() * 900000
            ).toString(),
            createdAt: new Date(),
            lastLogin: new Date(),
          });
          console.log("New user created from Facebook auth:", email);
        }

        // Save user
        await user.save();

        // Generate auth token
        const token = generateToken(user);

        // Add token and isNew flag to the user object
        user.token = token;
        user.isNewUser = isNewUser;

        return done(null, user);
      } catch (error) {
        console.error("Error in Facebook authentication strategy:", error);
        return done(error, null);
      }
    }
  )
);

module.exports = passport;
