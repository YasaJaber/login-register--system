// Login page file

// Import API URL from config file
import { API_URL } from "./config.js";

// When the page is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Get the login form
  const loginForm = document.getElementById("loginForm");

  // Ensure the message element exists, create it if not
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
  const passwordInput = document.getElementById("password");

  // Add event when user clicks on input fields to hide error messages
  emailInput.addEventListener("focus", function () {
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

  passwordInput.addEventListener("focus", function () {
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

  // Check if there are saved credentials in localStorage
  const savedCredentials = localStorage.getItem("savedCredentials");
  if (savedCredentials) {
    const { email, password } = JSON.parse(savedCredentials);
    emailInput.value = email;
    passwordInput.value = password;
    document.getElementById("rememberMe").checked = true;
  }

  // Add event when user submits the form
  loginForm.addEventListener("submit", async function (event) {
    // Prevent form from refreshing the page
    event.preventDefault();

    // Remove any error from fields
    emailInput.classList.remove("input-error");
    passwordInput.classList.remove("input-error");

    // Get field values
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const rememberMe = document.getElementById("rememberMe").checked;

    // Validate email
    if (!isValidEmail(email)) {
      emailInput.classList.add("input-error");
      showMessage("Please enter a valid email address", "error");
      emailInput.focus();
      return;
    }

    // Validate password is not empty
    if (password.length < 1) {
      passwordInput.classList.add("input-error");
      showMessage("Please enter your password", "error");
      passwordInput.focus();
      return;
    }

    // Show waiting message to user
    showMessage("Logging in...", "warning");

    try {
      // Send login data to server
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      // Convert server response to JSON
      const data = await response.json();

      if (response.ok) {
        // Show success message
        showMessage(data.message || "Login successful!", "success");

        // Check if there's existing user data with registration date
        const existingUserData = JSON.parse(
          localStorage.getItem("user") || "null"
        );
        const registrationDate = existingUserData?.registrationDate;

        // Merge the new user data with registration date if it exists
        const userData = {
          ...data.user,
          lastLogin: new Date().toISOString(),
          // Preserve registration date if it exists
          registrationDate:
            registrationDate ||
            data.user.registrationDate ||
            new Date().toISOString(),
        };

        // Store updated user data in local storage
        localStorage.setItem("user", JSON.stringify(userData));

        // Store the authentication token separately
        localStorage.setItem("authToken", data.token);

        // Save credentials if remember me is checked
        if (rememberMe) {
          localStorage.setItem(
            "savedCredentials",
            JSON.stringify({ email, password })
          );
        } else {
          localStorage.removeItem("savedCredentials");
        }

        // Go to profile page after two seconds
        setTimeout(() => {
          window.location.href = "profile.html";
        }, 2000);
      } else {
        // Show specific error message based on error type
        if (data.errorType === "email_not_found") {
          // Email not registered
          emailInput.classList.add("input-error");
          showMessage(
            "This email is not registered in our system",
            "error persistent-error"
          );
          emailInput.focus();
        } else if (data.errorType === "invalid_password") {
          // Password is incorrect
          passwordInput.classList.add("input-error");
          showMessage(
            "The password you entered is incorrect",
            "error persistent-error"
          );
          passwordInput.focus();
        } else {
          // Generic error message
          showMessage(
            data.message || "An error occurred during login",
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

  // Function to display messages
  function showMessage(message, type) {
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

    // Ensure the message element is visible
    messageElement.style.display = "block";
    messageElement.textContent = message;
    messageElement.className = "message " + type;

    // Apply styles directly and forcefully
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

    // Log a message to the console to confirm the message is displayed
    console.log("Message displayed:", message, "Type:", type);
  }

  // Setup social login buttons
  const googleLoginBtn = document.getElementById("googleLogin");
  const facebookLoginBtn = document.getElementById("facebookLogin");

  if (googleLoginBtn) {
    googleLoginBtn.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("Google login button clicked");
      if (typeof handleGoogleAuth === "function") {
        handleGoogleAuth(true);
      } else {
        console.error("handleGoogleAuth is not defined");
        showMessage("Error initializing Google authentication", "error");
      }
    });
  }

  if (facebookLoginBtn) {
    facebookLoginBtn.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("Facebook login button clicked");
      if (typeof handleFacebookAuth === "function") {
        handleFacebookAuth(true);
      } else {
        console.error("handleFacebookAuth is not defined");
        showMessage("Error initializing Facebook authentication", "error");
      }
    });
  }
});
