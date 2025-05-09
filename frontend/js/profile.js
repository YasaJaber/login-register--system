// Profile page JavaScript file

// Import API URL from config file
import { API_URL } from "./config.js";

// When the page is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Check if user is logged in
  const userData = JSON.parse(localStorage.getItem("user") || "null");

  // Create background particles if they don't exist
  if (!document.querySelector(".bg-particles")) {
    const bgParticles = document.createElement("div");
    bgParticles.className = "bg-particles";

    // Add 6 particles as in the CSS
    for (let i = 1; i <= 6; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";
      bgParticles.appendChild(particle);
    }

    document.body.appendChild(bgParticles);
  }

  // Get the profile content container
  const profileContent = document.getElementById("profileContent");

  // If user is not logged in, redirect to login page
  if (!userData) {
    // Create message to inform user
    profileContent.innerHTML = `
            <div class="message error" style="display: block; text-align: center;">
                <h3>Sorry, you must log in first</h3>
                <p>You will be redirected to the login page in a few seconds...</p>
            </div>
        `;

    // Redirect to login page after 3 seconds
    setTimeout(() => {
      window.location.href = "login.html";
    }, 3000);

    return;
  }

  // Get user's first letter of name for avatar
  const firstLetter = userData.name
    ? userData.name.charAt(0).toUpperCase()
    : "U";

  // Format registration date if available
  let registrationDate = "Not available";

  // Debug the registration date
  console.log("Registration date from userData:", userData.registrationDate);

  if (userData.registrationDate) {
    try {
      const date = new Date(userData.registrationDate);
      if (!isNaN(date.getTime())) {
        registrationDate = date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } else {
        console.warn("Registration date is invalid, setting current date");
        // If the date is invalid, set it to current date
        const currentDate = new Date();
        userData.registrationDate = currentDate.toISOString();
        localStorage.setItem("user", JSON.stringify(userData));

        registrationDate = currentDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    } catch (error) {
      console.error("Error formatting registration date:", error);
    }
  } else {
    // If registration date doesn't exist, set it now
    console.warn("Registration date missing, setting current date");
    const currentDate = new Date();
    userData.registrationDate = currentDate.toISOString();
    localStorage.setItem("user", JSON.stringify(userData));

    registrationDate = currentDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Format last updated date if available
  let lastUpdated = "Not modified yet";
  if (userData.lastUpdated) {
    const date = new Date(userData.lastUpdated);
    lastUpdated = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Format last login if available
  let lastLogin = "Now";
  if (userData.lastLogin) {
    const date = new Date(userData.lastLogin);
    lastLogin = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Render user profile with enhanced UI and welcome message
  profileContent.innerHTML = `
        <div class="welcome-banner">
            <div class="welcome-message">
                <h2>Welcome, ${userData.name}! 👋</h2>
                <p>We're glad to see you today</p>
            </div>
        </div>

        <div class="profile-header">
            <div class="profile-avatar">${firstLetter}</div>
            <h1 class="profile-name">${userData.name}</h1>
            <p class="profile-email">${userData.email}</p>
            <div class="account-status"><span class="status-dot"></span> Account Active</div>
            <p class="last-login"><i class="login-icon">🕒</i> Last login: ${lastLogin}</p>
        </div>
        
        <div class="profile-details">
            <h2 style="color: #4cc9f0; margin-bottom: 20px;">Account Information</h2>
            
            <div class="detail-item">
                <div class="detail-label"><i class="detail-icon">👤</i> Name:</div>
                <div class="detail-value">${userData.name}</div>
            </div>
            
            <div class="detail-item">
                <div class="detail-label"><i class="detail-icon">✉️</i> Email:</div>
                <div class="detail-value">${userData.email}</div>
            </div>
            
            <div class="detail-item">
                <div class="detail-label"><i class="detail-icon">📅</i> Registration Date:</div>
                <div class="detail-value">${registrationDate}</div>
            </div>
            
            <div class="detail-item">
                <div class="detail-label"><i class="detail-icon">🔄</i> Last Updated:</div>
                <div class="detail-value">${lastUpdated}</div>
            </div>

            <div class="detail-item">
                <div class="detail-label"><i class="detail-icon">🔐</i> Auth Provider:</div>
                <div class="detail-value">${
                  userData.provider === "local"
                    ? "Manual Registration"
                    : userData.provider === "google"
                    ? "Google Account"
                    : userData.provider === "facebook"
                    ? "Facebook Account"
                    : "Unknown"
                }</div>
            </div>
        </div>
        
        <div class="activity-section">
            <h2 style="color: #4cc9f0; margin-bottom: 20px;">Recent Activity</h2>
            <div class="activity-item">
                <div class="activity-icon">🔑</div>
                <div class="activity-details">
                    <div class="activity-title">Successful Login</div>
                    <div class="activity-time">${lastLogin}</div>
                </div>
            </div>
            <div class="activity-item">
                <div class="activity-icon">📝</div>
                <div class="activity-details">
                    <div class="activity-title">Account Created</div>
                    <div class="activity-time">${registrationDate}</div>
                </div>
            </div>
        </div>
        
        <div class="profile-actions">
            <button id="editProfileBtn" class="btn btn-primary"><i class="btn-icon">✏️</i> Edit Profile</button>
            <button id="logoutBtn" class="btn btn-secondary"><i class="btn-icon">🚪</i> Logout</button>
        </div>
    `;

  // Add custom styles for the enhanced profile
  const styleElement = document.createElement("style");
  styleElement.textContent = `
        .welcome-banner {
            background: linear-gradient(135deg, #4cc9f0, #3a0ca3);
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 30px;
            color: white;
            text-align: center;
            box-shadow: 0 4px 15px rgba(76, 201, 240, 0.3);
        }
        
        .welcome-message h2 {
            font-size: 28px;
            margin-bottom: 5px;
        }
        
        .welcome-message p {
            opacity: 0.9;
            font-size: 16px;
        }
        
        .status-dot {
            display: inline-block;
            width: 10px;
            height: 10px;
            background-color: #4ade80;
            border-radius: 50%;
            margin-right: 6px;
        }
        
        .detail-icon, .btn-icon, .login-icon, .activity-icon {
            display: inline-block;
            margin-right: 8px;
            font-style: normal;
        }
        
        .activity-section {
            background-color: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
        }
        
        .activity-item {
            display: flex;
            align-items: center;
            padding: 12px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .activity-item:last-child {
            border-bottom: none;
        }
        
        .activity-icon {
            width: 40px;
            height: 40px;
            background-color: rgba(76, 201, 240, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            font-size: 18px;
        }
        
        .activity-details {
            flex: 1;
        }
        
        .activity-title {
            font-weight: bold;
            color: white;
        }
        
        .activity-time {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.7);
        }
    `;
  document.head.appendChild(styleElement);

  // Add event listener to logout button
  document.getElementById("logoutBtn").addEventListener("click", function () {
    // Remove user data from local storage
    localStorage.removeItem("user");

    // Show logout message
    profileContent.innerHTML = `
            <div class="message success" style="display: block; text-align: center;">
                <h3>Logged out successfully</h3>
                <p>You will be redirected to the home page in a few seconds...</p>
            </div>
        `;

    // Redirect to home page after 2 seconds
    setTimeout(() => {
      window.location.href = "index.html";
    }, 2000);
  });

  // Add event listener to edit profile button
  document
    .getElementById("editProfileBtn")
    .addEventListener("click", function () {
      // Create edit profile form
      profileContent.innerHTML = `
        <div class="edit-profile-form">
          <h2 style="color: #4cc9f0; margin-bottom: 20px;">Edit Profile</h2>
          
          <div class="form-group">
            <label for="editName">Name:</label>
            <input type="text" id="editName" value="${userData.name}" placeholder="Enter your name" class="profile-input" autocomplete="off" />
          </div>
          
          <div class="form-group">
            <label for="editEmail">Email:</label>
            <input type="email" id="editEmail" value="${userData.email}" placeholder="Enter your email" class="profile-input" autocomplete="off" />
          </div>
          
          <div class="form-group change-password-toggle">
            <button id="changePasswordBtn" class="btn btn-link"><i class="btn-icon">🔐</i> Change Password</button>
          </div>
          
          <div id="passwordFields" style="display: none;">
            <div class="form-group">
              <label for="currentPassword">Current Password:</label>
              <input type="password" id="currentPassword" placeholder="Enter your current password" class="profile-input" />
            </div>
            
            <div class="form-group">
              <label for="newPassword">New Password:</label>
              <input type="password" id="newPassword" placeholder="Enter new password" class="profile-input" />
            </div>
            
            <div class="form-group">
              <label for="confirmNewPassword">Confirm New Password:</label>
              <input type="password" id="confirmNewPassword" placeholder="Confirm new password" class="profile-input" />
            </div>
          </div>
          
          <div id="editProfileMessage" class="message" style="display: none;"></div>
          
          <div class="profile-actions">
            <button id="saveProfileBtn" class="btn btn-primary"><i class="btn-icon">💾</i> Save Changes</button>
            <button id="cancelEditBtn" class="btn btn-secondary"><i class="btn-icon">↩️</i> Cancel</button>
          </div>
        </div>
      `;

      // Add styles for the edit form
      const editStyles = document.createElement("style");
      editStyles.textContent = `
        .edit-profile-form {
          animation: fadeIn 0.3s ease-in-out;
        }
        
        .profile-input {
          width: 100%;
          padding: 12px 15px;
          border-radius: 8px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          background-color: rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 16px;
          transition: all 0.3s ease;
        }
        
        .profile-input:focus {
          border-color: #4cc9f0;
          outline: none;
          box-shadow: 0 0 0 3px rgba(76, 201, 240, 0.3);
          background-color: rgba(255, 255, 255, 0.15);
        }
        
        .profile-input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        label {
          display: block;
          margin-bottom: 8px;
          color: #4cc9f0;
          font-weight: 500;
        }
        
        .btn-link {
          background: none;
          border: none;
          color: #4cc9f0;
          text-decoration: underline;
          cursor: pointer;
          padding: 0;
          font-size: 16px;
          display: inline-flex;
          align-items: center;
          transition: all 0.3s ease;
        }
        
        .btn-link:hover {
          color: #f72585;
          transform: translateY(0);
        }
        
        .change-password-toggle {
          margin-top: 30px;
          margin-bottom: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 20px;
        }
        
        /* Custom scrollbar styling */
        ::-webkit-scrollbar {
          width: 10px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #4cc9f0, #3a0ca3);
          border-radius: 10px;
          border: 2px solid rgba(255, 255, 255, 0.1);
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #4895ef, #560bad);
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `;
      document.head.appendChild(editStyles);

      // Toggle password change fields
      document
        .getElementById("changePasswordBtn")
        .addEventListener("click", function () {
          const passwordFields = document.getElementById("passwordFields");
          if (passwordFields.style.display === "none") {
            passwordFields.style.display = "block";
            this.innerHTML = `<i class="btn-icon">🔒</i> Cancel Password Change`;
          } else {
            passwordFields.style.display = "none";
            this.innerHTML = `<i class="btn-icon">🔐</i> Change Password`;
          }
        });

      // Add event listener to save profile button
      document
        .getElementById("saveProfileBtn")
        .addEventListener("click", async function () {
          const newName = document.getElementById("editName").value.trim();
          const newEmail = document.getElementById("editEmail").value.trim();
          const passwordFields = document.getElementById("passwordFields");
          const isChangingPassword = passwordFields.style.display !== "none";

          // Validate name and email inputs first
          if (newName.length < 3) {
            showEditMessage("Name must be at least 3 characters", "error");
            return;
          }

          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(newEmail)) {
            showEditMessage("Please enter a valid email address", "error");
            return;
          }

          // Check if email is being changed
          const isChangingEmail =
            newEmail.toLowerCase() !== userData.email.toLowerCase();

          if (isChangingEmail) {
            // Email is being changed - check if it already exists in the system
            console.log(
              "Email change detected. Checking if new email already exists."
            );

            try {
              showEditMessage("Checking email availability...", "warning");

              // Call the API to check if email exists
              const response = await fetch(`${API_URL}/api/check-email`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: newEmail }),
              });

              const data = await response.json();

              if (response.ok && data.exists) {
                showEditMessage(
                  "This email is already registered. Please use a different email.",
                  "error"
                );
                return;
              }
            } catch (error) {
              console.error("Error checking email:", error);
              showEditMessage(
                "Unable to verify email availability. Please try again.",
                "error"
              );
              return;
            }
          }

          // Handle password change if needed
          if (isChangingPassword) {
            const currentPassword =
              document.getElementById("currentPassword").value;
            const newPassword = document.getElementById("newPassword").value;
            const confirmNewPassword =
              document.getElementById("confirmNewPassword").value;

            // Check if all fields are provided
            if (!currentPassword || !newPassword || !confirmNewPassword) {
              showEditMessage("Please fill in all password fields", "error");
              return;
            }

            // Verify current password
            try {
              showEditMessage("Verifying current password...", "warning");

              // Verify the current password with the server
              const verifyResponse = await fetch(
                `${API_URL}/api/verify-password`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    email: userData.email,
                    password: currentPassword,
                  }),
                }
              );

              const verifyData = await verifyResponse.json();

              if (!verifyResponse.ok || !verifyData.valid) {
                showEditMessage("Current password is incorrect", "error");
                return;
              }
            } catch (error) {
              console.error("Error verifying password:", error);
              showEditMessage(
                "Unable to verify current password. Please try again.",
                "error"
              );
              return;
            }

            // Validate new password
            if (newPassword.length < 6) {
              showEditMessage(
                "New password must be at least 6 characters long",
                "error"
              );
              return;
            }

            // Validate password confirmation
            if (newPassword !== confirmNewPassword) {
              showEditMessage("New passwords do not match", "error");
              return;
            }

            // Update password on server
            try {
              showEditMessage("Updating password...", "warning");

              const response = await fetch(`${API_URL}/api/update-password`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  email: userData.email,
                  newPassword: newPassword,
                }),
              });

              const data = await response.json();

              if (!response.ok) {
                showEditMessage(
                  data.message || "Failed to update password",
                  "error"
                );
                return;
              }
            } catch (error) {
              console.error("Error updating password:", error);
              showEditMessage(
                "Server error. Unable to update password.",
                "error"
              );
              return;
            }
          }

          // Update user data on the server
          try {
            showEditMessage("Updating profile...", "warning");

            // Debug the user data object
            console.log("User data being sent:", {
              id: userData.id,
              email: userData.email,
              name: userData.name,
              newName: newName,
              newEmail: newEmail,
            });

            // Save profile changes to the server
            const profileResponse = await fetch(
              `${API_URL}/api/update-profile`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                },
                body: JSON.stringify({
                  newName: newName,
                  newEmail: newEmail,
                }),
              }
            );

            const profileData = await profileResponse.json();

            if (!profileResponse.ok) {
              showEditMessage(
                profileData.message || "Failed to update profile",
                "error"
              );
              return;
            }

            // Update local user data
            userData.name = newName;
            userData.email = newEmail;
            userData.lastUpdated =
              profileData.user.lastUpdated || new Date().toISOString();

            // Save updated user data to localStorage
            localStorage.setItem("user", JSON.stringify(userData));

            // Show success message with appropriate text
            if (isChangingPassword) {
              showEditMessage(
                "Profile and password updated successfully!",
                "success"
              );
            } else {
              showEditMessage("Profile updated successfully!", "success");
            }

            setTimeout(() => {
              // Reload the profile content
              window.location.reload();
            }, 1500);
          } catch (error) {
            console.error("Error updating profile:", error);
            showEditMessage("Server error. Unable to update profile.", "error");
          }
        });

      // Add event listener to cancel button
      document
        .getElementById("cancelEditBtn")
        .addEventListener("click", function () {
          // Reload the profile content
          window.location.reload();
        });

      // Function to show messages in the edit form
      function showEditMessage(message, type) {
        const messageElement = document.getElementById("editProfileMessage");
        messageElement.textContent = message;
        messageElement.className = `message ${type}`;
        messageElement.style.display = "block";

        // Auto-scroll to the message
        setTimeout(() => {
          messageElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 100);

        // If it's a warning message, make it disappear after 3 seconds
        if (type === "warning") {
          setTimeout(() => {
            if (messageElement.textContent === message) {
              messageElement.style.display = "none";
            }
          }, 3000);
        }
      }
    });
});
