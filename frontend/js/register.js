/**
 * User Registration Module
 * Handles the registration form submission and validation
 * @author Yasa Jaber
 */

// Import API endpoint configuration
import { API_URL } from "./config.js";

/**
 * Initialize form handling once DOM is fully loaded
 */
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("registerForm");

  // Initialize message container for form feedback
  let messageDiv = document.getElementById("message");
  if (!messageDiv) {
    messageDiv = document.createElement("div");
    messageDiv.id = "message";
    messageDiv.className = "message";
    document.querySelector(".form-container").appendChild(messageDiv);
  }

  // Get input fields
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");

  // Add focus event to each field to hide error messages
  const inputFields = [
    nameInput,
    emailInput,
    passwordInput,
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

  function validateForm(name, email, password, confirmPassword) {
    // Reset all fields
    inputFields.forEach((field) => field.classList.remove("input-error"));

    // Validate name
    if (name.trim().length < 3) {
      nameInput.classList.add("input-error");
      nameInput.focus();
      return "Name must be at least 3 characters";
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      emailInput.classList.add("input-error");
      emailInput.focus();
      return "Please enter a valid email address";
    }

    // Validate password
    if (password.length < 6) {
      passwordInput.classList.add("input-error");
      passwordInput.focus();
      return "Password must be at least 6 characters";
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      confirmPasswordInput.classList.add("input-error");
      confirmPasswordInput.focus();
      return "Passwords do not match";
    }

    return null; // No errors
  }

  // Function to display messages similar to login.js
  function showMessage(message, type, useHTML = false) {
    let messageElement = document.getElementById("message");
    if (!messageElement) {
      messageElement = document.createElement("div");
      messageElement.id = "message";
      document.querySelector(".form-container").appendChild(messageElement);
    }
    messageElement.style.display = "block";

    // Cancel any previous timer
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

    // Apply styles directly and fully
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

    // Add style based on message type
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

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // Show waiting message to the user
    showMessage("Processing registration...", "warning");

    // Validate form data
    const error = validateForm(name, email, password, confirmPassword);
    if (error) {
      showMessage(error, "error persistent-error");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store registration date along with user data
        const userData = {
          name,
          email,
          registrationDate: new Date().toISOString(),
        };

        // Store the user data in localStorage - will be updated at login
        localStorage.setItem("user", JSON.stringify(userData));

        // Store the recovery code in localStorage for the recovery-code page to use
        localStorage.setItem("userRecoveryCode", data.recoveryCode);

        // Show a brief success message before redirecting
        showMessage(
          "Registration successful! Redirecting to recovery code page...",
          "success"
        );

        // Redirect to the recovery code page
        setTimeout(() => {
          window.location.href = "recovery-code.html";
        }, 1500);
      } else {
        if (data.errorType === "email_exists") {
          emailInput.classList.add("input-error");
          showMessage(
            "This email is already registered. Please use a different email or try to login.",
            "error persistent-error"
          );
        } else {
          showMessage(
            data.message || "Registration failed. Please try again.",
            "error persistent-error"
          );
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      showMessage(
        "A network error occurred. Please check your connection and try again.",
        "error persistent-error"
      );
    }
  });

  // Setup social signup buttons
  const googleSignupBtn = document.getElementById("googleSignup");
  const facebookSignupBtn = document.getElementById("facebookSignup");

  if (googleSignupBtn) {
    googleSignupBtn.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("Google signup button clicked");
      if (typeof handleGoogleAuth === "function") {
        handleGoogleAuth(false); // false means it's for signup not login
      } else {
        console.error("handleGoogleAuth is not defined");
        showMessage("Error initializing Google authentication", "error");
      }
    });
  }

  if (facebookSignupBtn) {
    facebookSignupBtn.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("Facebook signup button clicked");
      if (typeof handleFacebookAuth === "function") {
        handleFacebookAuth(false); // false means it's for signup not login
      } else {
        console.error("handleFacebookAuth is not defined");
        showMessage("Error initializing Facebook authentication", "error");
      }
    });
  }
});
