// Social Media Authentication Module
// Provides OAuth functionality for Google and Facebook login

import {
  GOOGLE_CLIENT_ID,
  GOOGLE_REDIRECT_URI,
  GOOGLE_SCOPE,
  FACEBOOK_APP_ID,
  FACEBOOK_REDIRECT_URI,
  FACEBOOK_SCOPE,
} from "./oauth-config.js";

import { API_URL } from "./config.js";

// Main handler for Google authentication
function handleGoogleAuth(isLogin = true) {
  showMessage("Connecting to Google...", "warning");
  console.log(`Initiating Google ${isLogin ? "login" : "signup"}`);

  // Open OAuth popup window
  const width = 500;
  const height = 600;
  const left = (window.screen.width - width) / 2;
  const top = (window.screen.height - height) / 2;

  // Create the popup window
  const popup = window.open(
    `${API_URL}/api/auth/google`,
    "googleAuthPopup",
    `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
  );

  // Setup message listener for when auth is complete
  setupAuthMessageListener(popup, isLogin);
}

// Main handler for Facebook authentication
function handleFacebookAuth(isLogin = true) {
  showMessage("Connecting to Facebook...", "warning");
  console.log(`Initiating Facebook ${isLogin ? "login" : "signup"}`);

  // Open OAuth popup window
  const width = 500;
  const height = 600;
  const left = (window.screen.width - width) / 2;
  const top = (window.screen.height - height) / 2;

  // Create the popup window
  const popup = window.open(
    `${API_URL}/api/auth/facebook`,
    "facebookAuthPopup",
    `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
  );

  // Setup message listener for when auth is complete
  setupAuthMessageListener(popup, isLogin);
}

// Listens for messages from the popup window
function setupAuthMessageListener(popup, isLogin) {
  // Set up popup monitor to detect if it's closed
  const checkPopupClosed = setInterval(() => {
    if (!popup || popup.closed) {
      clearInterval(checkPopupClosed);

      // Only show error if we didn't receive auth data
      if (!window.authComplete) {
        showMessage(
          "Authentication window was closed. Please try again.",
          "error"
        );
      }
    }
  }, 1000);

  // Set up message listener for communication from popup
  window.addEventListener("message", async function authMessageListener(event) {
    // Check if message contains authentication data
    if (event.data && event.data.success) {
      // Mark auth as complete to prevent error message
      window.authComplete = true;

      // Clear popup monitor
      clearInterval(checkPopupClosed);

      // Remove this event listener since auth is complete
      window.removeEventListener("message", authMessageListener);

      // Process the received authentication data
      await handleSuccessfulAuth(event.data, isLogin);
    }
  });
}

// Process successful authentication
async function handleSuccessfulAuth(authData, isLogin) {
  try {
    console.log("Auth successful:", authData);

    // Extract user data from the auth response
    const userData = {
      id: authData.id,
      name: authData.name,
      email: authData.email,
      provider: authData.provider,
      token: authData.token,
      isNewUser: authData.isNewUser,
      lastLogin: new Date().toISOString(),
    };

    // Show appropriate message based on new vs existing user
    if (userData.isNewUser) {
      showMessage(
        `Account successfully created with ${userData.provider}!`,
        "success"
      );
    } else {
      showMessage(
        `Successfully signed in with ${userData.provider}!`,
        "success"
      );
    }

    // Store user data in localStorage
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("authToken", userData.token);

    // Redirect after a short delay
    setTimeout(() => {
      window.location.href = "profile.html";
    }, 1500);
  } catch (error) {
    console.error("Error processing authentication:", error);
    showMessage(
      "Authentication successful, but there was an error processing your information.",
      "error"
    );
  }
}

// Show messages to user
function showMessage(message, type) {
  const messageElement = document.getElementById("message");
  if (messageElement) {
    messageElement.textContent = message;
    messageElement.className = `message ${type}`;
    messageElement.style.display = "block";
  }
}

// Initialize social login buttons when document is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Login page buttons
  const googleLoginBtn = document.getElementById("googleLogin");
  const facebookLoginBtn = document.getElementById("facebookLogin");

  // Register page buttons
  const googleSignupBtn = document.getElementById("googleSignup");
  const facebookSignupBtn = document.getElementById("facebookSignup");

  // Add event listeners for login page
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener("click", function (e) {
      e.preventDefault();
      handleGoogleAuth(true);
    });
  }

  if (facebookLoginBtn) {
    facebookLoginBtn.addEventListener("click", function (e) {
      e.preventDefault();
      handleFacebookAuth(true);
    });
  }

  // Add event listeners for register page
  if (googleSignupBtn) {
    googleSignupBtn.addEventListener("click", function (e) {
      e.preventDefault();
      handleGoogleAuth(false);
    });
  }

  if (facebookSignupBtn) {
    facebookSignupBtn.addEventListener("click", function (e) {
      e.preventDefault();
      handleFacebookAuth(false);
    });
  }

  // Process URL params if they exist (for redirects from OAuth)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("success") && urlParams.has("provider")) {
    const isLogin = window.location.pathname.includes("login");
    const authData = {
      success: urlParams.get("success") === "true",
      provider: urlParams.get("provider"),
      id: urlParams.get("id"),
      name: urlParams.get("name"),
      email: urlParams.get("email"),
      token: urlParams.get("token"),
    };

    if (authData.success) {
      handleSuccessfulAuth(authData, isLogin);
    }
  }
});

// Export the functions for use in other files
export { handleGoogleAuth, handleFacebookAuth };
