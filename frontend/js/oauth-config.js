// OAuth Configuration for Social Media Authentication
// This file now imports settings from the central config.js file

import { OAUTH_CONFIG, API_URL } from "./config.js";

// Google OAuth Configuration
const GOOGLE_CLIENT_ID =
  OAUTH_CONFIG.google.client_id ||
  "836260911585-4jlia4fhpn5bb66ufnb8sfuho1c5mv17.apps.googleusercontent.com";

// Use absolute redirect URI with API_URL to prevent mismatch errors
const GOOGLE_REDIRECT_URI =
  OAUTH_CONFIG.google.redirect_uri ||
  "http://localhost:3001/api/auth/google/callback";

//  Google access scope with correct format
const GOOGLE_SCOPE =
  OAUTH_CONFIG.google.scope ||
  "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email";

// Facebook OAuth Configuration
const FACEBOOK_APP_ID = OAUTH_CONFIG.facebook.app_id || "702595068914731";

const FACEBOOK_REDIRECT_URI =
  OAUTH_CONFIG.facebook.redirect_uri ||
  "http://localhost:3001/api/auth/facebook/callback";

const FACEBOOK_SCOPE = OAUTH_CONFIG.facebook.scope || "email,public_profile";

// Export configuration
export {
  GOOGLE_CLIENT_ID,
  GOOGLE_REDIRECT_URI,
  GOOGLE_SCOPE,
  FACEBOOK_APP_ID,
  FACEBOOK_REDIRECT_URI,
  FACEBOOK_SCOPE,
};
