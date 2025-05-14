// Social Media Authentication Module using OAuth with Redirect Method
// This approach avoids popup issues by using redirects instead

// Import OAuth configuration and API_URL
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_REDIRECT_URI,
  GOOGLE_SCOPE,
  FACEBOOK_APP_ID,
} from "./oauth-config.js";
import { API_URL } from "./config.js";

// Function to handle Google login/signup with redirect
function handleGoogleAuth(isLogin = true) {
  try {
    // Store login mode in localStorage to remember after redirect
    const authMode = isLogin ? "login" : "register";
    localStorage.setItem("authMode", authMode);
    console.log("Google auth - Setting auth mode:", authMode);

    // Use the fixed redirect URI from oauth-config.js instead of dynamic generation
    const redirectUri = GOOGLE_REDIRECT_URI;
    const scope = encodeURIComponent(GOOGLE_SCOPE);
    const responseType = "code";
    const accessType = "offline";
    const prompt = "select_account"; // Changed from 'consent' to 'select_account' to match backend

    // Add state parameter to indicate login or register mode
    const state = authMode; // Using authMode directly for clarity
    console.log("Google auth - Using state parameter:", state);
    console.log("Google auth - Using redirect URI:", redirectUri);

    // Create the complete OAuth URL
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${scope}&response_type=${responseType}&access_type=${accessType}&prompt=${prompt}&state=${state}`;

    console.log("Google Auth URL:", googleAuthUrl); // Debug log

    // Show loading message to user
    showLoadingMessage("", "Connecting to Google...");

    // Redirect the user to Google login
    setTimeout(() => {
      window.location.href = googleAuthUrl;
    }, 1000); // Small delay to show the message
  } catch (error) {
    console.error("Error initiating Google auth:", error);
    showErrorMessage(
      "Error connecting to Google authentication service. Please try again."
    );
  }
}

// Function to handle Facebook login/signup with redirect
function handleFacebookAuth(isLogin = true) {
  try {
    // Print debug information first
    console.log("Facebook login debug info:");
    console.log("Facebook App ID:", FACEBOOK_APP_ID);
    console.log("Redirect URI:", `${API_URL}/api/auth/facebook/callback`);

    // Store login mode in localStorage to remember after redirect
    const authMode = isLogin ? "login" : "register";
    localStorage.setItem("authMode", authMode);
    console.log("Facebook auth - Setting auth mode:", authMode);

    // Use API_URL instead of window.location.origin to ensure consistency
    const redirectUri = `${API_URL}/api/auth/facebook/callback`;
    const scope = encodeURIComponent("email,public_profile");

    // Add state parameter to indicate login or register mode
    const state = authMode; // Using authMode directly for clarity
    console.log("Facebook auth - Using state parameter:", state);

    // Create the complete OAuth URL
    const facebookAuthUrl = `https://www.facebook.com/v15.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${scope}&response_type=code&state=${state}`;

    console.log("Facebook Auth URL:", facebookAuthUrl); // Debug log

    // Show loading message to user
    showLoadingMessage("", "Connecting to Facebook...");

    // Redirect the user to Facebook login
    setTimeout(() => {
      try {
        window.location.href = facebookAuthUrl;
      } catch (redirectError) {
        console.error("Error during redirect:", redirectError);
        showErrorMessage(
          "Failed to redirect to Facebook. Check console for details."
        );
      }
    }, 1000); // Small delay to show the message
  } catch (error) {
    console.error("Error initiating Facebook auth:", error);
    showErrorMessage(
      "Error connecting to Facebook authentication service. Please try again."
    );
  }
}

// Helper function to show loading message
function showLoadingMessage(arabicMsg, englishMsg) {
  const messageElement = document.getElementById("message");
  if (messageElement) {
    messageElement.innerHTML = `
      <div class="loading-message" style="background: #4361ee; border: none; box-shadow: 0 4px 15px rgba(67, 97, 238, 0.3); max-width: 300px; padding: 12px 15px; margin: 0 auto; border-radius: 8px; display: flex; align-items: center; justify-content: center; gap: 12px;">
        <div class="spinner" style="width: 28px; height: 28px; border: 2px solid rgba(255, 255, 255, 0.2); border-top: 2px solid #ffffff; border-right: 2px solid #ffffff; border-bottom: 2px solid #ffffff; border-left: 2px solid transparent;"></div>
        <p style="margin: 0; font-weight: 500; font-size: 14px; color: white; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">${englishMsg}</p>
      </div>
    `;
    messageElement.className = "message";
    messageElement.style.display = "block";
    messageElement.style.backgroundColor = "transparent";
    messageElement.style.border = "none";
    messageElement.style.boxShadow = "none";
  }
}

// Helper function to show error messages
function showErrorMessage(message) {
  const messageElement = document.getElementById("message");
  if (messageElement) {
    messageElement.textContent = message;
    messageElement.className = "message error";
    messageElement.style.display = "block";
  }
}

// Check for auth success and error parameters in URL
function checkAuthStatus() {
  const urlParams = new URLSearchParams(window.location.search);
  const success = urlParams.get("success");
  const error = urlParams.get("error");
  const provider = urlParams.get("provider");
  const userId = urlParams.get("id");
  const userName = urlParams.get("name");
  const userEmail = urlParams.get("email");
  const token = urlParams.get("token");
  const isNewUser = urlParams.get("isNewUser") === "true";

  console.log("Auth response params:", {
    success,
    error,
    provider,
    userId,
    userEmail,
    isNewUser,
  }); // Debug log

  // Clear parameters from URL for cleaner UX
  if ((success || error || provider) && window.history.replaceState) {
    // Create new URL without the authentication parameters
    const cleanUrl =
      window.location.protocol +
      "//" +
      window.location.host +
      window.location.pathname;

    window.history.replaceState({}, document.title, cleanUrl);
  }

  // Handle auth-success redirect from backend
  if (provider && userId && userName && userEmail) {
    // Get login/signup mode from localStorage
    const authMode = localStorage.getItem("authMode") || "login";
    localStorage.removeItem("authMode"); // Clean up

    // Create user object
    const user = {
      id: userId,
      name: userName,
      email: userEmail,
      provider: provider,
      token: token || "",
      isNewUser: isNewUser,
      lastLogin: new Date().toISOString(),
    };

    console.log("Saving user data:", user); // Debug log

    // Save user to localStorage
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("authToken", token || ""); // Also save token separately for easier access

    // Show success message
    const messageElement = document.getElementById("message");
    if (messageElement) {
      messageElement.textContent = isNewUser
        ? "Account successfully created and logged in!"
        : "Successfully logged in!";
      messageElement.className = "message success";
      messageElement.style.display = "block";
    }

    // Redirect to profile page
    setTimeout(() => {
      window.location.href = "profile.html";
    }, 1500);
  } else if (error) {
    // Show detailed error message
    let errorMessage;

    switch (error) {
      case "google_auth_failed":
        errorMessage = "Google authentication failed. Please try again.";
        break;
      case "facebook_auth_failed":
        errorMessage = "Facebook authentication failed. Please try again.";
        break;
      case "auth_failed":
        errorMessage = "Authentication failed. Please try again.";
        break;
      case "email_exists":
        errorMessage =
          "This email is already registered. Please login instead.";
        break;
      case "account_not_found":
        errorMessage = "Account not found. Please register first.";
        break;
      default:
        errorMessage = `Authentication failed: ${decodeURIComponent(error)}`;
    }

    console.error("Authentication error:", error); // Debug log
    showErrorMessage(errorMessage);
  }
}

// Initialize buttons when document is loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("Social auth module initialized");

  // Check for auth status first (in case we're returning from auth redirect)
  checkAuthStatus();

  // Login page buttons
  const googleLoginBtn = document.getElementById("googleLogin");
  const facebookLoginBtn = document.getElementById("facebookLogin");

  // Register page buttons
  const googleSignupBtn = document.getElementById("googleSignup");
  const facebookSignupBtn = document.getElementById("facebookSignup");

  // Add event listeners for login page
  if (googleLoginBtn) {
    console.log("Google login button found");
    googleLoginBtn.addEventListener("click", function () {
      handleGoogleAuth(true);
    });
  }

  if (facebookLoginBtn) {
    console.log("Facebook login button found");
    facebookLoginBtn.addEventListener("click", function () {
      handleFacebookAuth(true);
    });
  }

  // Add event listeners for register page
  if (googleSignupBtn) {
    console.log("Google signup button found");
    googleSignupBtn.addEventListener("click", function () {
      handleGoogleAuth(false);
    });
  }

  if (facebookSignupBtn) {
    console.log("Facebook signup button found");
    facebookSignupBtn.addEventListener("click", function () {
      handleFacebookAuth(false);
    });
  }
});

// Exporting functions for external use
export { handleGoogleAuth, handleFacebookAuth, checkAuthStatus };
