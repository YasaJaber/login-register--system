// Footer Loader - Add to all pages to automatically insert the footer
document.addEventListener("DOMContentLoaded", function () {
  // Remove any existing footer styles that might override our styles
  document.querySelectorAll('style').forEach(styleElement => {
    if (styleElement.textContent.includes('.footer')) {
      // Replace background and border properties while keeping other styles
      styleElement.textContent = styleElement.textContent.replace(
        /\.footer\s*{[^}]*background[^;]*;/g, 
        '.footer { background: none !important;'
      );
      styleElement.textContent = styleElement.textContent.replace(
        /\.footer\s*{[^}]*backdrop-filter[^;]*;/g, 
        '.footer { backdrop-filter: none !important;'
      );
      styleElement.textContent = styleElement.textContent.replace(
        /\.footer\s*{[^}]*-webkit-backdrop-filter[^;]*;/g, 
        '.footer { -webkit-backdrop-filter: none !important;'
      );
      styleElement.textContent = styleElement.textContent.replace(
        /\.footer\s*{[^}]*border-top[^;]*;/g, 
        '.footer { border: none !important;'
      );
    }
  });
  // Create CSS styles for the footer
  const footerStyles = document.createElement("style");
  footerStyles.textContent = `
        /* Custom Footer Styles */
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            padding: 15px 20px;
            text-align: center;
            z-index: 100;
            background: none !important;
            border: none !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
        }

        .footer p {
            margin: 0;
            font-size: 14px;
            color: white;
            text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }

        .developer-name {
            position: relative;
            display: inline-block;
            font-weight: 700;
            font-size: 18px;
            background: linear-gradient(45deg, #f72585, #4361ee, #4cc9f0);
            background-size: 200% 200%;
            animation: gradientNameAnimation 7s ease infinite;
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            padding: 0 5px;
            margin: 0 5px;
            transition: all 0.3s ease;
            text-shadow: none;
        }

        .developer-name:before {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 0;
            height: 2px;
            background: linear-gradient(45deg, #f72585, #4361ee, #4cc9f0);
            transition: width 0.4s ease;
        }

        .developer-name:hover:before {
            width: 100%;
        }

        .developer-name:hover {
            transform: translateY(-2px);
            text-shadow: 0 5px 15px rgba(76, 201, 240, 0.4);
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
