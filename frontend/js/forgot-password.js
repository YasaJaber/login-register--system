// Forgot password page file

// Import API URL from config file
import { API_URL } from "./config.js";

// When the page is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Get the forgot password form
  const forgotPasswordForm = document.getElementById("forgotPasswordForm");
  // Get the message element
  const messageElement = document.getElementById("message");
  // Get email field
  const emailInput = document.getElementById("email");

  // Instead, we'll only remove visual styling but keep the error message visible
  emailInput.addEventListener("focus", function () {
    // Remove just the visual error styling but KEEP the message
    this.classList.remove("input-error");
  });

  // Get recovery code field
  const recoveryCodeInput = document.getElementById("recoveryCodeInput");

  recoveryCodeInput.addEventListener("focus", function () {
    // Remove just the visual error styling but KEEP the message
    this.classList.remove("input-error");
  });

  // Add event when user submits the form
  forgotPasswordForm.addEventListener("submit", async function (event) {
    // Prevent form from refreshing the page
    event.preventDefault();

    // Remove any error from fields
    emailInput.classList.remove("input-error");
    recoveryCodeInput.classList.remove("input-error");

    // Get email and recovery code values
    const email = emailInput.value.trim();
    const recoveryCode = recoveryCodeInput.value.trim();

    // Validate email
    if (!isValidEmail(email)) {
      emailInput.classList.add("input-error");
      showMessage("Please enter a valid email address", "error");
      emailInput.focus();
      return;
    }

    // Validate recovery code exists and is correct
    if (!recoveryCode || recoveryCode.length < 4) {
      recoveryCodeInput.classList.add("input-error");
      showMessage("Please enter a valid recovery code", "error");
      recoveryCodeInput.focus();
      return;
    }

    // Show waiting message to user
    showMessage("Verifying your information...", "warning");

    try {
      // Send request to server to verify code and email
      const response = await fetch(`${API_URL}/api/verify-recovery-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, recoveryCode }),
      });

      const data = await response.json();

      if (response.ok) {
        // If code is correct, show message that we'll redirect to password reset page
        showMessage("Redirecting to password reset page...", "success");

        // Redirect user to password reset page with email and code
        setTimeout(() => {
          window.location.href = `reset-password.html?email=${encodeURIComponent(
            email
          )}&code=${encodeURIComponent(recoveryCode)}`;
        }, 2000);
      } else {
        // If code or email is incorrect, show clear error message
        if (data.message && data.message.includes("User not found")) {
          showMessage("Email address not found in our system", "error");
          emailInput.classList.add("input-error");
          emailInput.focus();
        } else if (
          data.message &&
          data.message.includes("Invalid recovery code")
        ) {
          showMessage("The recovery code you entered is incorrect", "error");
          recoveryCodeInput.classList.add("input-error");
          recoveryCodeInput.focus();
        } else if (data.message && data.message.includes("Code mismatch")) {
          showMessage(
            "This recovery code does not match with the email provided",
            "error"
          );
          recoveryCodeInput.classList.add("input-error");
          recoveryCodeInput.focus();
        } else {
          showMessage(
            "Please check your email and recovery code and try again",
            "error"
          );
          recoveryCodeInput.classList.add("input-error");
          recoveryCodeInput.focus();
        }
      }
    } catch (error) {
      // Show general error message in case of any problem
      showMessage(
        "Server connection error, please check your internet connection",
        "error"
      );
      console.error("Error:", error);
    }
  });

  // Hide recovery code display element as we don't need it in this page
  const recoveryCodeDisplay = document.getElementById("recoveryCodeDisplay");
  if (recoveryCodeDisplay) {
    recoveryCodeDisplay.style.display = "none";
  }

  // Function to validate email
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Function to display messages
  function showMessage(message, type) {
    // Make sure the element exists
    if (!messageElement) {
      console.error("Message element not found!");
      return;
    }

    // Clear any previous timer
    if (window._messageTimer) {
      clearTimeout(window._messageTimer);
    }

    // Ensure message element is visible
    messageElement.style.display = "block";
    messageElement.textContent = message;
    messageElement.className = "message " + type;

    // Set styles directly
    messageElement.style.opacity = "1";
    messageElement.style.visibility = "visible";
    messageElement.style.height = "auto";
    messageElement.style.maxHeight = "200px";
    messageElement.style.marginBottom = "20px";
    messageElement.style.transform = "translateY(0)";
    messageElement.style.padding = "15px";
    messageElement.style.borderWidth = "2px";

    // Make the message persistent until user interacts with it
    // Timer disabled to keep messages visible
    // window._messageTimer = setTimeout(() => {
    //   messageElement.textContent = "";
    //   messageElement.className = "message";
    // }, 8000);
  }

  // Add button to hide error messages (optional)
  // You can add close button for messages if needed
  const closeButton = document.createElement("button");
  closeButton.innerHTML = "&times;";
  closeButton.className = "close-message";
  closeButton.style.position = "absolute";
  closeButton.style.right = "10px";
  closeButton.style.top = "10px";
  closeButton.style.background = "transparent";
  closeButton.style.border = "none";
  closeButton.style.fontSize = "18px";
  closeButton.style.cursor = "pointer";
  closeButton.style.display = "none";

  messageElement.style.position = "relative";
  messageElement.appendChild(closeButton);

  // Add event to button to hide message
  closeButton.addEventListener("click", function () {
    messageElement.textContent = "";
    messageElement.className = "message";
    closeButton.style.display = "none";
  });

  // Modify showMessage function to show close button
  const originalShowMessage = showMessage;
  showMessage = function (message, type) {
    originalShowMessage(message, type);
    closeButton.style.display = "block";
    messageElement.appendChild(closeButton);
  };
});
