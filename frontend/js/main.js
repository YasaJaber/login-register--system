/**
 * Main Application Page Controller
 * Handles user authentication state and dashboard interface
 * @author Yasa Jaber
 */

/**
 * Initialize page content based on user authentication state
 */
document.addEventListener("DOMContentLoaded", function () {
  // Retrieve user authentication data from local storage
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Display authenticated user dashboard if logged in
  if (user) {
    const container = document.querySelector(".form-container");

    // Generate user avatar from first letter of name
    const firstLetter = user.name ? user.name.charAt(0).toUpperCase() : "U";

    // Create user dashboard with profile info and actions
    const welcomeElement = document.createElement("div");
    welcomeElement.className = "welcome";
    welcomeElement.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <div style="width: 80px; height: 80px; border-radius: 50%; background-color: #4cc9f0; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; font-size: 32px; color: white; font-weight: bold; box-shadow: 0 4px 20px rgba(76, 201, 240, 0.3);">
                    ${firstLetter}
                </div>
                <h2 style="color: #f72585; margin-bottom: 5px; font-size: 28px;">أهلاً ${user.name}!</h2>
                <p style="color: #b5179e; margin-bottom: 20px;">${user.email}</p>
                <div style="display: flex; justify-content: center; gap: 15px;">
                    <a href="profile.html" class="btn" style="background-color: #4cc9f0; color: white; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: bold;">الملف الشخصي</a>
                    <button id="logoutButton" class="btn" style="background-color: #f72585; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer;">تسجيل الخروج</button>
                </div>
            </div>
        `;

    // Replace container content with user dashboard
    container.innerHTML = "";
    container.appendChild(welcomeElement);

    /**
     * Handle user logout process
     * Removes authentication data and refreshes page
     */
    document
      .getElementById("logoutButton")
      .addEventListener("click", function () {
        // Clear authentication data
        localStorage.removeItem("user");
        // Reload the page
        window.location.reload();
      });
  }
});
