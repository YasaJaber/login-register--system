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
const isDevelopment =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

console.log("Environment detection: isDevelopment =", isDevelopment);

const API_URL = (() => {
  // Development environment API URL
  const developmentAPI = "http://localhost:3001";

  // Production environment - using Render URL
  const productionAPI = "https://login-register-system-sxto.onrender.com";

  return isDevelopment ? developmentAPI : productionAPI;
})();

// OAuth Configuration - Social Media Authentication
// Social authentication configurations
const OAUTH_CONFIG = {
  google: {
    client_id:
      "836260911585-4jlia4fhpn5bb66ufnb8sfuho1c5mv17.apps.googleusercontent.com",
    // Fixed redirect URI for both environments
    // IMPORTANT: This MUST match exactly what's registered in Google Cloud Console
    redirect_uri:
      "https://login-register-system-sxto.onrender.com/api/auth/google/callback",
    scope:
      "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
  },
  github: {
    client_id: "Ov23li1D4fK0s7GerHnh",
    // Fixed redirect URI for both environments - must match GitHub OAuth App settings
    redirect_uri:
      "https://login-register-system-sxto.onrender.com/api/auth/github/callback",
    scope: "user:email",
  },
};

console.log("OAuth config:", {
  "Google redirect URI": OAUTH_CONFIG.google.redirect_uri,
  "GitHub redirect URI": OAUTH_CONFIG.github.redirect_uri,
});

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
