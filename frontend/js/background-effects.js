// Background effects and mouse interaction
document.addEventListener("DOMContentLoaded", function () {
  // Create the glow element that follows the mouse
  const mouseGlow = document.createElement("div");
  mouseGlow.classList.add("mouse-glow");
  document.body.appendChild(mouseGlow);

  // Mouse move event for the glow effect
  document.addEventListener("mousemove", function (e) {
    mouseGlow.style.opacity = "1";
    mouseGlow.style.left = e.clientX + "px";
    mouseGlow.style.top = e.clientY + "px";
  });

  // Create background particles if they don't exist
  if (!document.querySelector(".bg-particles")) {
    const bgParticles = document.createElement("div");
    bgParticles.className = "bg-particles";

    // Add 6 particles
    for (let i = 1; i <= 6; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";
      bgParticles.appendChild(particle);
    }

    document.body.appendChild(bgParticles);
  }

  // Get all particles
  const particles = document.querySelectorAll(".particle");

  // Initialize particles with physics-based movement
  const particleData = [];

  // Divide the screen into sections for better distribution
  const sectionsX = 3; // 3 columns
  const sectionsY = 2; // 2 rows

  particles.forEach((particle, index) => {
    // Calculate which section this particle should go in
    const sectionX = index % sectionsX;
    const sectionY = Math.floor((index % (sectionsX * sectionsY)) / sectionsX);

    // Calculate position range for this section
    const minX = sectionX * (100 / sectionsX) + 5;
    const maxX = (sectionX + 1) * (100 / sectionsX) - 5;
    const minY = sectionY * (100 / sectionsY) + 5;
    const maxY = (sectionY + 1) * (100 / sectionsY) - 5;

    // Start particles at random positions within their assigned section
    const x = minX + Math.random() * (maxX - minX);
    const y = minY + Math.random() * (maxY - minY);

    const speedX = (Math.random() - 0.5) * 0.02;
    const speedY = (Math.random() - 0.5) * 0.02;

    // Set size and random rotation
    const size = Math.random() * 60 + 80; // 80-140px
    const rotation = Math.random() * 360;
    const rotationSpeed = (Math.random() - 0.5) * 0.5;

    // Store particle data
    particleData.push({ x, y, speedX, speedY, rotation, rotationSpeed, size });

    // Set initial position and size
    particle.style.left = x + "vw";
    particle.style.top = y + "vh";
    particle.style.width = size + "px";
    particle.style.height = size + "px";
    particle.style.transform = `rotate(${rotation}deg)`;
    particle.style.position = "fixed"; 
    particle.style.transition = "transform 0.5s ease"; 
  });

  // Animation function to move particles
  function animateParticles() {
    // First update positions
    particles.forEach((particle, index) => {
      const data = particleData[index];

      // Update position
      data.x += data.speedX;
      data.y += data.speedY;
      data.rotation += data.rotationSpeed;

      // Bounce off edges
      if (data.x <= 0 || data.x >= 100) {
        data.speedX = -data.speedX; // Reverse direction
        data.x = Math.max(0, Math.min(100, data.x)); // Keep within bounds
      }

      if (data.y <= 0 || data.y >= 100) {
        data.speedY = -data.speedY; // Reverse direction
        data.y = Math.max(0, Math.min(100, data.y)); // Keep within bounds
      }
    });

    // Check for collisions between particles
    for (let i = 0; i < particleData.length; i++) {
      const particleA = particleData[i];

      for (let j = i + 1; j < particleData.length; j++) {
        const particleB = particleData[j];

        // Calculate distance between centers (using viewport units)
        const dx = particleB.x - particleA.x;
        const dy = particleB.y - particleA.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Calculate minimum distance for collision (based on particle sizes)
        // Converting sizes from pixels to viewport units approximately
        const radiusA = particleA.size / 30; // Approximate conversion to vw units
        const radiusB = particleB.size / 30; // Approximate conversion to vw units
        const minDistance = radiusA + radiusB;

        // تحسين الكشف عن التصادم بإضافة هامش أمان
        const safetyMargin = 0.1; // هامش أمان إضافي
        if (distance < minDistance + safetyMargin) {
          // Calculate collision normal
          const nx = dx / distance;
          const ny = dy / distance;

          // Calculate relative velocity
          const vx = particleB.speedX - particleA.speedX;
          const vy = particleB.speedY - particleA.speedY;

          // Calculate relative velocity along the normal
          const velocityAlongNormal = vx * nx + vy * ny;

          // Don't resolve if velocities are separating
          if (velocityAlongNormal > 0) continue;

          // زيادة قوة الارتداد (restitution) لتحسين تأثير الاصطدام
          const restitution = 0.8; // زيادة من 0.3 إلى 0.8 لارتداد أقوى

          // Calculate impulse scalar
          const impulseScalar = -(1 + restitution) * velocityAlongNormal;

          // Apply impulse to both particles
          particleA.speedX -= impulseScalar * nx;
          particleA.speedY -= impulseScalar * ny;
          particleB.speedX += impulseScalar * nx;
          particleB.speedY += impulseScalar * ny;

          // تحديد السرعة القصوى للكور
          const maxSpeed = 0.05;

          // تطبيق حدود السرعة
          particleA.speedX = Math.max(
            -maxSpeed,
            Math.min(maxSpeed, particleA.speedX)
          );
          particleA.speedY = Math.max(
            -maxSpeed,
            Math.min(maxSpeed, particleA.speedY)
          );
          particleB.speedX = Math.max(
            -maxSpeed,
            Math.min(maxSpeed, particleB.speedX)
          );
          particleB.speedY = Math.max(
            -maxSpeed,
            Math.min(maxSpeed, particleB.speedY)
          );

          // زيادة قوة الفصل بين الكور لمنع تداخلها
          const overlap = minDistance - distance;
          const separationFactor = 1.5; // زيادة معامل الفصل من 0.5 إلى 1.5
          const separationX = overlap * nx * separationFactor;
          const separationY = overlap * ny * separationFactor;

          // تطبيق الفصل بين الكور
          particleA.x -= separationX;
          particleA.y -= separationY;
          particleB.x += separationX;
          particleB.y += separationY;
        }
      }
    }

    // Apply updated positions and rotations
    particles.forEach((particle, index) => {
      const data = particleData[index];
      particle.style.left = data.x + "vw";
      particle.style.top = data.y + "vh";
      particle.style.transform = `rotate(${data.rotation}deg)`;
    });

    // Continue animation
    requestAnimationFrame(animateParticles);
  }

  // Start animation
  animateParticles();

  // Add subtle extra movement to particles on mouse move
  document.addEventListener("mousemove", function (e) {
    const moveX = (e.clientX - window.innerWidth / 2) / 50;
    const moveY = (e.clientY - window.innerHeight / 2) / 50;

    particles.forEach(function (particle, index) {
      // Different movement for each particle for a natural effect
      const factor = (index + 1) * 0.2;
      const currentTransform = getComputedStyle(particle).transform;
      particle.style.transform = `translate(${moveX * factor}px, ${
        moveY * factor
      }px) rotate(${moveX + moveY}deg)`;
    });
  });

  // When mouse leaves, keep the random floating animation
  document.addEventListener("mouseleave", function () {
    mouseGlow.style.opacity = "0";
  });

  // Add CSS animation keyframes for the floating particles
  if (!document.getElementById("particle-animations")) {
    const styleSheet = document.createElement("style");
    styleSheet.id = "particle-animations";
    styleSheet.textContent = `
      @keyframes floatingParticle {
        0% {
          transform: translate(0, 0) rotate(0deg) scale(var(--scale-factor));
        }
        25% {
          transform: translate(calc(var(--random-x) / 3), calc(var(--random-y) / 4)) rotate(45deg) scale(calc(var(--scale-factor) * 1.05));
        }
        50% {
          transform: translate(calc(var(--random-x) / 2), calc(var(--random-y) / 2)) rotate(90deg) scale(var(--scale-factor));
        }
        75% {
          transform: translate(calc(var(--random-x) / 4), calc(var(--random-y) / 3)) rotate(45deg) scale(calc(var(--scale-factor) * 0.95));
        }
        100% {
          transform: translate(var(--random-x), var(--random-y)) rotate(180deg) scale(var(--scale-factor));
        }
      }
    `;
    document.head.appendChild(styleSheet);
  }
});
