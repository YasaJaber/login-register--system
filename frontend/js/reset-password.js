// Reset password page file

// Import API URL from config file
import { API_URL } from "./config.js";

document.addEventListener("DOMContentLoaded", function () {
  // Get the reset password form
  const resetPasswordForm = document.getElementById("resetPasswordForm");

  // Ensure message element exists, if not create it
  let messageElement = document.getElementById("message");
  if (!messageElement) {
    console.log("Creating message element at page load");
    messageElement = document.createElement("div");
    messageElement.id = "message";
    messageElement.className = "message";
    // Add the element at the end of the form
    document.querySelector(".form-container").appendChild(messageElement);
  }

  // Get input fields
  const emailInput = document.getElementById("email");
  const recoveryCodeInput = document.getElementById("recoveryCode");
  const newPasswordInput = document.getElementById("newPassword");
  const confirmPasswordInput = document.getElementById("confirmPassword");

  // Add event when user clicks on input fields to hide error messages
  const inputFields = [
    emailInput,
    recoveryCodeInput,
    newPasswordInput,
    confirmPasswordInput,
  ];

  inputFields.forEach((field) => {
    field.addEventListener("focus", function () {
      let messageElement = document.getElementById("message");
      if (
        messageElement &&
        !messageElement.classList.contains("persistent-error")
      ) {
        messageElement.textContent = "";
        messageElement.className = "message";
        messageElement.style.display = "none";
      }
      this.classList.remove("input-error");
    });
  });

  // Check if there's information in the URL
  const urlParams = new URLSearchParams(window.location.search);
  const emailFromUrl = urlParams.get("email");
  const codeFromUrl = urlParams.get("code");

  // If we found information in the URL, fill the fields
  if (emailFromUrl) {
    emailInput.value = emailFromUrl;
  }
  if (codeFromUrl) {
    recoveryCodeInput.value = codeFromUrl;
  }

  // Add event when user submits the form
  resetPasswordForm.addEventListener("submit", async function (event) {
    // Prevent form from refreshing the page
    event.preventDefault();

    // Remove any error from fields
    inputFields.forEach((field) => field.classList.remove("input-error"));

    // Get field values
    const email = emailInput.value.trim();
    const recoveryCode = recoveryCodeInput.value.trim();
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // Show waiting message to user
    showMessage("Changing your password...", "warning");

    // Validate email
    if (!isValidEmail(email)) {
      emailInput.classList.add("input-error");
      showMessage(
        "Please enter a valid email address",
        "error persistent-error"
      );
      emailInput.focus();
      return;
    }

    // Validate recovery code exists
    if (recoveryCode.length < 4) {
      recoveryCodeInput.classList.add("input-error");
      showMessage(
        "Please enter a valid recovery code",
        "error persistent-error"
      );
      recoveryCodeInput.focus();
      return;
    }

    // Validate password strength
    if (newPassword.length < 6) {
      newPasswordInput.classList.add("input-error");
      showMessage(
        "Password must be at least 6 characters",
        "error persistent-error"
      );
      newPasswordInput.focus();
      return;
    }

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      // Add red border only to confirm password field
      confirmPasswordInput.classList.add("input-error");
      showMessage("Passwords do not match", "error persistent-error");
      confirmPasswordInput.focus();
      return;
    }

    try {
      // Send password reset request to server
      const response = await fetch(`${API_URL}/api/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, recoveryCode, newPassword }),
      });

      // Convert server response to JSON
      const data = await response.json();

      if (response.ok) {
        // Show success message with HTML
        const successMessage = `
          <div style="text-align: center;">
            <h3 style="color: #28a745; margin-bottom: 15px;">Password Changed Successfully! ✅</h3>
            <p>Your password has been updated. You will be redirected to the login page shortly.</p>
            <p style="margin-top: 20px; font-size: 14px; color: #8d99ae;">Redirecting to login page in 2 seconds...</p>
          </div>
        `;

        showMessage(successMessage, "success", true);

        // Reset the form
        resetPasswordForm.reset();

        // Go to login page after two seconds
        setTimeout(() => {
          window.location.href = "login.html";
        }, 2000);
      } else {
        // Show error message based on error type
        if (data.message && data.message.includes("User not found")) {
          emailInput.classList.add("input-error");
          showMessage(
            "Email address not registered in the system",
            "error persistent-error"
          );
          emailInput.focus();
        } else if (
          data.message &&
          data.message.includes("Invalid recovery code")
        ) {
          recoveryCodeInput.classList.add("input-error");
          showMessage("Recovery code is incorrect", "error persistent-error");
          recoveryCodeInput.focus();
        } else {
          showMessage(
            data.message || "An error occurred while changing the password",
            "error persistent-error"
          );
        }
      }
    } catch (error) {
      // Show general error message
      showMessage(
        "Server connection error, please check your internet connection",
        "error persistent-error"
      );
      console.error("Error:", error);
    }
  });

  // Function to validate email
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Function to show messages in same style as login.js
  function showMessage(message, type, useHTML = false) {
    let messageElement = document.getElementById("message");
    if (!messageElement) {
      messageElement = document.createElement("div");
      messageElement.id = "message";
      document.querySelector(".form-container").appendChild(messageElement);
    }
    messageElement.style.display = "block";

    // Clear any previous timer
    if (window._messageTimer) {
      clearTimeout(window._messageTimer);
    }

    // Add content (HTML or plain text)
    if (useHTML) {
      messageElement.innerHTML = message;
    } else {
      messageElement.textContent = message;
    }

    messageElement.className = "message " + type;

    // Set styles directly
    messageElement.style.opacity = "1";
    messageElement.style.visibility = "visible";
    messageElement.style.height = "auto";
    messageElement.style.maxHeight = "200px";
    messageElement.style.marginBottom = "20px";
    messageElement.style.marginTop = "20px";
    messageElement.style.transform = "translateY(0)";
    messageElement.style.padding = "15px";
    messageElement.style.borderWidth = "2px";
    messageElement.style.fontSize = "18px";
    messageElement.style.fontWeight = "bold";
    messageElement.style.zIndex = "9999";
    messageElement.style.textAlign = "center";
    messageElement.style.borderRadius = "8px";
    messageElement.style.position = "relative";

    // Add styles based on message type
    if (type.includes("error")) {
      messageElement.style.backgroundColor = "rgba(247, 37, 133, 0.2)";
      messageElement.style.color = "#f72585";
      messageElement.style.borderColor = "#f72585";
      messageElement.style.boxShadow = "0 4px 8px rgba(247, 37, 133, 0.3)";
    } else if (type === "success") {
      messageElement.style.backgroundColor = "rgba(76, 201, 240, 0.2)";
      messageElement.style.color = "#4cc9f0";
      messageElement.style.borderColor = "#4cc9f0";
      messageElement.style.boxShadow = "0 4px 8px rgba(76, 201, 240, 0.3)";
    } else if (type === "warning") {
      messageElement.style.backgroundColor = "rgba(247, 127, 0, 0.2)";
      messageElement.style.color = "#f77f00";
      messageElement.style.borderColor = "#f77f00";
      messageElement.style.boxShadow = "0 4px 8px rgba(247, 127, 0, 0.3)";
    }

    // Don't add a close button if it's custom HTML (like the success message)
    if (!useHTML) {
      // Add a close button to the message
      const closeButton = document.createElement("button");
      closeButton.innerHTML = "&times;";
      closeButton.style.position = "absolute";
      closeButton.style.right = "10px";
      closeButton.style.top = "50%";
      closeButton.style.transform = "translateY(-50%)";
      closeButton.style.background = "transparent";
      closeButton.style.border = "none";
      closeButton.style.fontSize = "20px";
      closeButton.style.cursor = "pointer";
      closeButton.style.color = messageElement.style.color;
      closeButton.style.padding = "0 10px";
      closeButton.style.fontWeight = "bold";

      // Add event to the button to close the message
      closeButton.addEventListener("click", function () {
        messageElement.textContent = "";
        messageElement.className = "message";
        messageElement.style.display = "none";
      });

      // Ensure any old close buttons are removed before adding the new one
      const existingCloseButton = messageElement.querySelector("button");
      if (existingCloseButton) {
        messageElement.removeChild(existingCloseButton);
      }

      messageElement.appendChild(closeButton);
    }

    // Log a message to the console to confirm the message is displayed
    console.log("Message displayed:", message, "Type:", type);
  }
});
