/**
 * Frontend Configuration
 * Central configuration file for all frontend components
 * @author Yasa Jaber
 */

/**
 * API Endpoint Configuration
 * Automatically determines the correct API URL based on the current environment
 */

// Dynamic API URL detection for development/production environments
const API_URL = (() => {
  // Environment detection based on hostname
  const isDevelopment =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  // Development environment API URL
  const developmentAPI = "http://localhost:3001";

  // Production environment - using Render URL
  const productionAPI = "https://login-register-system-sxto.onrender.com";

  return isDevelopment ? developmentAPI : productionAPI;
})();

// OAuth Configuration - Social Media Authentication
// Social authentication configurations
// Using the actual client IDs from your Google and Facebook developer accounts
const OAUTH_CONFIG = {
  google: {
    client_id:
      "836260911585-4jlia4fhpn5bb66ufnb8sfuho1c5mv17.apps.googleusercontent.com",
    // Dynamic redirect URI based on current environment
    redirect_uri: `${API_URL}/api/auth/google/callback`,
    scope:
      "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
  },
  facebook: {
    app_id: "702595068914731",
    // Dynamic redirect URI based on current environment
    redirect_uri: `${API_URL}/api/auth/facebook/callback`,
    scope: "email,public_profile",
  },
};

// ==========================================
// APPLICATION SETTINGS
// ==========================================

// General application settings
const APP_CONFIG = {
  appName: "Login & Register System",
  defaultLanguage: "en",
  // Change this in one place when going to production
  supportEmail: "yasajaber@gmail.com",
};

// Export all configurations
export { API_URL, OAUTH_CONFIG, APP_CONFIG };
