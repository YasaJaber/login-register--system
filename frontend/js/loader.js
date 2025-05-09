// Simple code loader with <.../> syntax
document.addEventListener("DOMContentLoaded", function () {
  // Create loader container and styles
  createLoaderStyles();
  createLoader();

  // Show loader and hide content
  showLoader();

  // Hide loader after content loads (with minimum display time)
  const minDisplayTime = 2000; // Minimum time to show loader (for effect)
  const startTime = Date.now();

  window.addEventListener("load", function () {
    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(0, minDisplayTime - elapsedTime);

    // Ensure loader displays for at least minDisplayTime
    setTimeout(function () {
      hideLoader();
    }, remainingTime);
  });

  // Fallback - hide loader after maximum time in case of slow loading resources
  setTimeout(function () {
    hideLoader();
  }, 5000);
});

// Create the loader element and inject it into the document
function createLoader() {
  const loaderContainer = document.createElement("div");
  loaderContainer.id = "code-loader-container";

  // Create simple code syntax loader
  loaderContainer.innerHTML = `
    <div class="code-loader">
      <div class="loader-syntax">
        <span class="bracket">&lt;</span>
        <span class="dots">
          <span class="dot dot1">.</span>
          <span class="dot dot2">.</span>
          <span class="dot dot3">.</span>
        </span>
        <span class="slash">/</span>
        <span class="bracket">&gt;</span>
      </div>
    </div>
  `;

  document.body.insertBefore(loaderContainer, document.body.firstChild);
}

// Create and inject the loader styles
function createLoaderStyles() {
  const styleElement = document.createElement("style");
  styleElement.textContent = `
    #code-loader-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(5px);
      -webkit-backdrop-filter: blur(5px);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      opacity: 1;
      transition: opacity 0.5s ease-out, visibility 0.5s ease-out;
    }
    
    #code-loader-container.hidden {
      opacity: 0;
      visibility: hidden;
    }
    
    .code-loader {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    
    .loader-syntax {
      display: flex;
      align-items: center;
      font-family: 'Courier New', monospace;
      font-size: 60px;
      font-weight: bold;
      color: #f72585;
    }
    
    .bracket {
      color: #4cc9f0;
    }
    
    .dots {
      display: inline-flex;
      margin: 0 2px;
      position: relative;
      top: -18px;
    }
    
    .slash {
      color: #4361ee;
      font-size: 45px;
      transform: translateY(2px);
    }
    
    .dot {
      animation: dotPulse 1.5s infinite;
      opacity: 0;
      font-size: 70px;
      line-height: 0;
      transform: translateY(-5px);
    }
    
    .dot1 {
      animation-delay: 0s;
      color: #4cc9f0;
    }
    
    .dot2 {
      animation-delay: 0.3s;
      color: #f72585;
    }
    
    .dot3 {
      animation-delay: 0.6s;
      color: #4361ee;
    }
    
    @keyframes dotPulse {
      0% { opacity: 0; transform: scale(0.8); }
      50% { opacity: 1; transform: scale(1.2); }
      100% { opacity: 0; transform: scale(0.8); }
    }
  `;

  document.head.appendChild(styleElement);
}

// Show the loader
function showLoader() {
  document.body.style.overflow = "hidden"; // Prevent scrolling while loading
  document.getElementById("code-loader-container").classList.remove("hidden");

  // Delay showing the content until the loader is hidden
  const content = document.querySelector(".container");
  if (content) {
    content.style.opacity = "0";
    content.style.transition = "opacity 0.5s ease-in";
  }
}

// Hide the loader with animation
function hideLoader() {
  const loader = document.getElementById("code-loader-container");
  if (loader) {
    loader.classList.add("hidden");
    document.body.style.overflow = ""; // Restore scrolling

    // Fade in the content
    const content = document.querySelector(".container");
    if (content) {
      content.style.opacity = "1";
    }

    // Remove the loader from DOM after transition completes
    setTimeout(() => {
      if (loader.parentNode) {
        loader.parentNode.removeChild(loader);
      }
    }, 600);
  }
}
