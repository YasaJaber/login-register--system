// Recovery Code Page JS
import { API_URL, APP_CONFIG } from "./config.js";

document.addEventListener("DOMContentLoaded", function () {
  const recoveryCodeElement = document.getElementById("recoveryCode");
  const messageElement = document.getElementById("message");
  const copyButton = document.getElementById("copyButton");

  // Set support email from config
  const supportLink = document.querySelector(".links a");
  if (supportLink && APP_CONFIG && APP_CONFIG.supportEmail) {
    supportLink.href = `mailto:${APP_CONFIG.supportEmail}`;
  }

  // Function to check if user is logged in - redirect if not
  function checkAuthentication() {
    const userData = localStorage.getItem("user");
    if (!userData) {
      // If no user data, redirect to login
      messageElement.textContent = "Session expired. Redirecting to login...";
      messageElement.classList.add("warning");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);
      return false;
    }
    return true;
  }

  // Function to display recovery code
  function displayRecoveryCode() {
    // Check authentication first
    if (!checkAuthentication()) return;

    // Try to get the recovery code from localStorage
    const recoveryCode = localStorage.getItem("userRecoveryCode");

    if (recoveryCode) {
      recoveryCodeElement.textContent = recoveryCode;

      // Highlight the code with animation
      recoveryCodeElement.style.animation = "fadeIn 0.5s ease-in-out";

      // Clear the recovery code from localStorage after displaying it
      // This is a security measure so it doesn't stay in localStorage
      setTimeout(() => {
        localStorage.removeItem("userRecoveryCode");
      }, 60000); // Remove after 1 minute for security
    } else {
      // If no recovery code is found, show an error
      recoveryCodeElement.textContent = "Recovery code not available";
      messageElement.textContent =
        "There was an error retrieving your recovery code. Please contact support.";
      messageElement.classList.add("error");
      copyButton.disabled = true;
    }
  }

  // Function to copy recovery code to clipboard
  copyButton.addEventListener("click", function () {
    const recoveryCode = recoveryCodeElement.textContent;

    if (recoveryCode && recoveryCode !== "Recovery code not available") {
      // Add visual feedback when copying
      recoveryCodeElement.style.animation = "none";
      setTimeout(() => {
        recoveryCodeElement.style.animation = "fadeIn 0.5s ease-in-out";
      }, 10);

      navigator.clipboard
        .writeText(recoveryCode)
        .then(() => {
          messageElement.textContent = "Recovery code copied to clipboard!";
          messageElement.classList.remove("error");
          messageElement.classList.add("success");

          // Add visual feedback to the button
          copyButton.innerHTML = '<i class="fas fa-check"></i> Copied!';

          // Reset button after 2 seconds
          setTimeout(() => {
            copyButton.innerHTML = '<i class="fas fa-copy"></i> Copy Code';
          }, 2000);

          // Reset message after 3 seconds
          setTimeout(() => {
            messageElement.textContent =
              "Save this code in a secure place. You will need it if you forget your password.";
            messageElement.classList.remove("success");
          }, 3000);
        })
        .catch((err) => {
          messageElement.textContent = "Failed to copy code: " + err;
          messageElement.classList.add("error");
        });
    }
  });

  // Display recovery code when page loads
  displayRecoveryCode();
});
