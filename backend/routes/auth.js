const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/User");

// Get the base URL for redirects (default to localhost in development)
const BASE_URL = process.env.BASE_URL || "http://localhost:3001";
console.log("Auth routes using BASE_URL:", BASE_URL);

// Google Authentication Routes
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

// Google callback route
router.get("/google/callback", (req, res, next) => {
  // Get the state parameter to determine if this was a register or login attempt
  console.log("Google callback received with full query:", req.query);

  const isRegisterMode = req.query.state === "register";
  const targetPage = isRegisterMode ? "register.html" : "login.html";

  console.log("Google callback - Request state:", req.query.state);
  console.log("Google callback - Register mode:", isRegisterMode);
  console.log("Google callback - Target page:", targetPage);

  // Create custom authentication handler
  passport.authenticate("google", { session: false }, (err, user, info) => {
    // Handle error
    if (err) {
      console.error("Google auth error:", err);
      return res.redirect(
        `${BASE_URL}/${targetPage}?error=${encodeURIComponent(err.message)}`
      );
    }

    // Handle authentication failure
    if (!user) {
      const errorMsg =
        info && info.message ? info.message : "authentication_failed";
      console.log(
        `Google auth failed with message: ${errorMsg}, redirecting to ${targetPage}`
      );
      return res.redirect(
        `${BASE_URL}/${targetPage}?error=${encodeURIComponent(errorMsg)}`
      );
    }

    console.log("Google auth successful - user:", user.email);

    // Authentication successful
    req.user = user;
    handleSuccessfulAuth(req, res, "google");
  })(req, res, next);
});

// Facebook Authentication Routes
router.get(
  "/facebook",
  passport.authenticate("facebook", {
    scope: ["email", "public_profile"],
  })
);

// Facebook callback route
router.get("/facebook/callback", (req, res, next) => {
  // Get the state parameter to determine if this was a register or login attempt
  const isRegisterMode = req.query.state === "register";
  const targetPage = isRegisterMode ? "register.html" : "login.html";

  console.log("Facebook callback - Request state:", req.query.state);
  console.log("Facebook callback - Register mode:", isRegisterMode);
  console.log("Facebook callback - Target page:", targetPage);

  // Create custom authentication handler
  passport.authenticate("facebook", { session: false }, (err, user, info) => {
    // Handle error
    if (err) {
      console.error("Facebook auth error:", err);
      return res.redirect(
        `${BASE_URL}/${targetPage}?error=${encodeURIComponent(err.message)}`
      );
    }

    // Handle authentication failure
    if (!user) {
      const errorMsg =
        info && info.message ? info.message : "authentication_failed";
      console.log(
        `Facebook auth failed with message: ${errorMsg}, redirecting to ${targetPage}`
      );
      return res.redirect(
        `${BASE_URL}/${targetPage}?error=${encodeURIComponent(errorMsg)}`
      );
    }

    console.log("Facebook auth successful - user:", user.email);

    // Authentication successful
    req.user = user;
    handleSuccessfulAuth(req, res, "facebook");
  })(req, res, next);
});

// Common function to handle successful authentication
function handleSuccessfulAuth(req, res, provider) {
  if (!req.user) {
    console.error("Authentication failed: No user data received");
    return res.redirect(`${BASE_URL}/login.html?error=auth_failed`);
  }

  try {
    // Get user data
    const user = req.user;
    const token = user.token || "";
    const isNewUser = user.isNewUser || false;

    // Log successful authentication
    console.log(
      `Successful ${provider} authentication for user: ${user.email}`
    );

    // Create a frontend redirect URL with all necessary params
    // This will redirect directly to the login page with all user data
    let redirectUrl = `${BASE_URL}/login.html?`;
    redirectUrl += `provider=${provider}`;
    redirectUrl += `&id=${user._id || user.id}`;
    redirectUrl += `&token=${token}`;
    redirectUrl += `&name=${encodeURIComponent(user.name || "")}`;
    redirectUrl += `&email=${encodeURIComponent(user.email || "")}`;
    redirectUrl += `&isNewUser=${isNewUser}`;

    // Redirect to frontend login page with success parameters
    console.log(`Redirecting ${provider} auth to: ${redirectUrl}`);
    res.redirect(redirectUrl);
  } catch (error) {
    console.error("Error in handleSuccessfulAuth:", error);
    res.redirect(`${BASE_URL}/login.html?error=auth_failed`);
  }
}

// Auth success endpoint to handle frontend processing
router.get("/auth-success", (req, res) => {
  // This is for the frontend to consume
  res.send(`
    <html>
      <head>
        <title>Authentication Successful</title>
        <script>
          window.opener.postMessage(${JSON.stringify({
            success: true,
            provider: req.query.provider,
            id: req.query.id,
            token: req.query.token,
            name: req.query.name,
            email: req.query.email,
            isNewUser: req.query.isNewUser === "true",
          })}, "*");
          window.close();
        </script>
      </head>
      <body>
        <h2>Authentication Successful</h2>
        <p>You can close this window now.</p>
      </body>
    </html>
  `);
});

// Check if email exists (for validation during social login)
router.post("/check-email", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });
    const exists = !!user;
    const provider = user ? user.provider : null;

    return res.json({
      success: true,
      exists,
      provider,
      message: exists
        ? `This email is already registered${
            provider ? ` with ${provider}` : ""
          }`
        : "Email is available",
    });
  } catch (error) {
    console.error("Error checking email:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
