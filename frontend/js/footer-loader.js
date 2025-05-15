// Footer Loader - Add to all pages to automatically insert the footer
document.addEventListener("DOMContentLoaded", function () {
  // Remove any existing footer styles that might override our styles
  document.querySelectorAll("style").forEach((styleElement) => {
    if (styleElement.textContent.includes(".footer")) {
      // Remove the fixed positioning and other properties that would make the footer fixed
      styleElement.textContent = styleElement.textContent.replace(
        /\.footer\s*{[^}]*position:\s*fixed[^;]*;/g,
        ".footer { position: relative !important;"
      );
      styleElement.textContent = styleElement.textContent.replace(
        /\.footer\s*{[^}]*bottom[^;]*;/g,
        ".footer { "
      );
      styleElement.textContent = styleElement.textContent.replace(
        /\.footer\s*{[^}]*left[^;]*;/g,
        ".footer { "
      );
      // Keep these replacements for background and borders
      styleElement.textContent = styleElement.textContent.replace(
        /\.footer\s*{[^}]*background[^;]*;/g,
        ".footer { background: none !important;"
      );
      styleElement.textContent = styleElement.textContent.replace(
        /\.footer\s*{[^}]*backdrop-filter[^;]*;/g,
        ".footer { backdrop-filter: none !important;"
      );
      styleElement.textContent = styleElement.textContent.replace(
        /\.footer\s*{[^}]*-webkit-backdrop-filter[^;]*;/g,
        ".footer { -webkit-backdrop-filter: none !important;"
      );
      styleElement.textContent = styleElement.textContent.replace(
        /\.footer\s*{[^}]*border-top[^;]*;/g,
        ".footer { border: none !important;"
      );
    }
  });

  // Create CSS styles for the footer with !important flags to ensure they override inline styles
  const footerStyles = document.createElement("style");
  footerStyles.textContent = `
        /* Custom Footer Styles */
        .footer {
            position: relative !important;
            width: 100% !important;
            padding: 15px 20px !important;
            text-align: center !important;
            z-index: 100 !important;
            background: none !important;
            border: none !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            margin-top: 30px !important;
            bottom: auto !important;
            left: auto !important;
        }

        /* Make sure the body has proper structure for footer positioning */
        html, body {
            min-height: 100% !important;
            display: flex !important;
            flex-direction: column !important;
        }
        
        body {
            flex-grow: 1 !important;
        }
        
        /* Main content wrapper if needed */
        .content-wrapper {
            flex: 1 0 auto !important;
        }

        .footer p {
            margin: 0 !important;
            font-size: 14px !important;
            color: white !important;
            text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3) !important;
        }

        .developer-name {
            position: relative !important;
            display: inline-block !important;
            font-weight: 700 !important;
            font-size: 18px !important;
            background: linear-gradient(45deg, #f72585, #4361ee, #4cc9f0) !important;
            background-size: 200% 200% !important;
            animation: gradientNameAnimation 7s ease infinite !important;
            -webkit-background-clip: text !important;
            background-clip: text !important;
            color: transparent !important;
            padding: 0 5px !important;
            margin: 0 5px !important;
            transition: all 0.3s ease !important;
            text-shadow: none !important;
        }

        .developer-name:before {
            content: '' !important;
            position: absolute !important;
            bottom: -2px !important;
            left: 0 !important;
            width: 0 !important;
            height: 2px !important;
            background: linear-gradient(45deg, #f72585, #4361ee, #4cc9f0) !important;
            transition: width 0.4s ease !important;
        }

        .developer-name:hover:before {
            width: 100% !important;
        }

        .developer-name:hover {
            transform: translateY(-2px) !important;
            text-shadow: 0 5px 15px rgba(76, 201, 240, 0.4) !important;
        }

        @keyframes gradientNameAnimation {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        
        /* Sparkle animation for the developer name */
        @keyframes sparkle {
            0% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1.2); opacity: 1; }
            100% { transform: scale(0); opacity: 0; }
        }
        
        .sparkle {
            position: absolute;
            animation: sparkle 1s forwards;
            pointer-events: none;
        }
    `;
  document.head.appendChild(footerStyles);

  // Create footer element if it doesn't already exist
  if (!document.querySelector(".footer")) {
    const footer = document.createElement("footer");
    footer.className = "footer";

    // Fixed year to 2025 as requested
    const year = 2025;

    // Set footer content with animated developer name
    footer.innerHTML = `
            <p>&copy; ${year} All Rights Reserved | Developed by <span class="developer-name">Yasa Jaber</span></p>
        `;

    // Add hover effects for the name
    const devName = footer.querySelector(".developer-name");

    if (devName) {
      devName.addEventListener("mouseover", function () {
        createSparkles(this);
      });
    }

    // Append footer to body
    document.body.appendChild(footer);
  } else {
    // If footer already exists, update its style
    const existingFooter = document.querySelector(".footer");
    existingFooter.style.position = "relative";
    existingFooter.style.bottom = "auto";
    existingFooter.style.left = "auto";
    existingFooter.style.marginTop = "30px";
  }

  // Function to create sparkles around the developer name
  function createSparkles(element) {
    const sparkleCount = 5;
    const sparkleColors = [
      "#4361ee",
      "#f72585",
      "#4cc9f0",
      "#560bad",
      "#7209b7",
    ];

    for (let i = 0; i < sparkleCount; i++) {
      setTimeout(() => {
        const sparkle = document.createElement("span");
        sparkle.className = "sparkle";
        sparkle.innerHTML = "✨";

        // Random position around the name
        const top = -10 + Math.random() * 40; // -10px to 30px
        const left = Math.random() * 100; // 0% to 100%

        // Set sparkle position and styles
        sparkle.style.position = "absolute";
        sparkle.style.top = `${top}px`;
        sparkle.style.left = `${left}%`;
        sparkle.style.color =
          sparkleColors[Math.floor(Math.random() * sparkleColors.length)];
        sparkle.style.fontSize = "12px";
        sparkle.style.textShadow = "0 0 5px rgba(255, 255, 255, 0.8)";

        // Add to element
        element.appendChild(sparkle);

        // Remove after animation completes
        setTimeout(() => {
          if (sparkle.parentNode) {
            sparkle.parentNode.removeChild(sparkle);
          }
        }, 1000);
      }, i * 150);
    }
  }
});
