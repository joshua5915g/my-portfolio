/*
 * SCRIPT.JS
 * * This file handles all client-side interactivity for the portfolio.
 * * 1. Preloader Animation
 * 2. Locomotive Scroll Initialization
 * 3. GSAP ScrollTrigger Integration
 * 4. Custom Cursor Follower
 * 5. Mobile Navigation Toggle
 * 6. Hero Text Animation
 * 7. General Scroll-Triggered Animations ("reveal-up")
 * 8. NEW: Accordion for Achievements
 * 9. NEW: Starry Background
 */

(function () {
  // --- 1. PRELOADER ANIMATION ---

  function initPreloader() {
    const preloader = document.querySelector(".preloader");
    const counterElement = document.querySelector(".preloader-counter");
    const preloaderText = document.querySelector(".preloader-text");

    let count = 0;
    let target = 100;

    // Animate counter
    let counterInterval = setInterval(() => {
      if (count >= target) {
        clearInterval(counterInterval);

        // All animations complete, now fade out preloader
        const tl = gsap.timeline();
        tl.to(preloaderText, {
          y: -100,
          opacity: 0,
          duration: 0.8,
          ease: "power2.inOut",
        })
          .to(
            counterElement,
            {
              y: -100,
              opacity: 0,
              duration: 0.8,
              ease: "power2.inOut",
            },
            "-=0.5"
          )
          .to(preloader, {
            yPercent: -100,
            duration: 1.2,
            ease: "power3.inOut",
            onComplete: () => {
              preloader.style.display = "none";
              document.body.style.overflow = "visible"; // Allow scrolling
              initHeroAnimations(); // Start hero animations after preloader
            },
          });
      } else {
        count++;
        counterElement.textContent = `${count}%`;
      }
    }, 20); // Adjust interval for speed
  }

  // --- 2. LOCOMOTIVE SCROLL INITIALIZATION ---

  let locoScroll;

  function initSmoothScroll() {
    locoScroll = new LocomotiveScroll({
      el: document.querySelector("[data-scroll-container]"),
      smooth: true,
      lerp: 0.08, // Controls the "smoothness"
      smartphone: {
        smooth: true, // Enable smooth scroll on mobile
      },
      tablet: {
        smooth: true, // Enable smooth scroll on tablet
      },
    });

    // Update body height
    locoScroll.on("scroll", ScrollTrigger.update);

    // --- 3. GSAP SCROLLTRIGGER INTEGRATION ---

    // Tell ScrollTrigger to use Locomotive's scroll events
    ScrollTrigger.scrollerProxy("[data-scroll-container]", {
      scrollTop(value) {
        return arguments.length
          ? locoScroll.scrollTo(value, 0, 0)
          : locoScroll.scroll.instance.scroll.y;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
      pinType: document.querySelector("[data-scroll-container]").style.transform
        ? "transform"
        : "fixed",
    });

    // Refresh ScrollTrigger and LocomotiveScroll on window resize or updates
    ScrollTrigger.addEventListener("refresh", () => locoScroll.update());
    ScrollTrigger.refresh();
  }

  // --- 4. CUSTOM CURSOR FOLLOWER ---

  function initCursorFollower() {
    const cursor = document.querySelector(".cursor-follower");
    const interactiveElements = document.querySelectorAll("a, button, .btn, .course-item, .project-link, .accordion-button, .nav-links a, .contact-socials a");
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;
    const speed = 0.35; // Used only for the update loop, but mousemove snaps immediately

    function updateCursor() {
      currentX += (mouseX - currentX) * speed;
      currentY += (mouseY - currentY) * speed;
      cursor.style.transform = `translate(${currentX}px, ${currentY}px)`;
      requestAnimationFrame(updateCursor);
    }

    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      currentX = mouseX;
      currentY = mouseY;
      cursor.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
      cursor.style.opacity = "1";
    });

    interactiveElements.forEach((element) => {
      element.addEventListener("mouseenter", () => cursor.classList.add("cursor-hover"));
      element.addEventListener("mouseleave", () => cursor.classList.remove("cursor-hover"));
    });

    document.body.addEventListener("mouseleave", () => {
      cursor.style.opacity = "0";
    });

    document.body.addEventListener("mouseenter", () => {
      cursor.style.opacity = "1";
    });

    updateCursor();
  }

  // --- 5. MOBILE NAVIGATION TOGGLE ---

  function initMobileNav() {
    const hamburger = document.querySelector(".hamburger-menu");
    const navLinks = document.querySelector(".nav-links");
    const navLinksItems = document.querySelectorAll(".nav-links a");

    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      navLinks.classList.toggle("active");
    });

    // Close menu when a link is clicked
    navLinksItems.forEach((link) => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("active");
        navLinks.classList.remove("active");
      });
    });
  }

  // --- 6. HERO TEXT ANIMATION (Called after preloader) ---

  function initHeroAnimations() {
    const heroTimeline = gsap.timeline();

    heroTimeline
      .to(".hero-line", {
        y: 0,
        opacity: 1,
        duration: 1.2,
        stagger: 0.1,
        ease: "power3.out",
      })
      .to(
        ".hero-subtitle",
        {
          opacity: 1,
          duration: 1,
          ease: "power2.out",
        },
        "-=0.8"
      )
      .to(
        ".hero-cta-container",
        {
          opacity: 1,
          duration: 1,
          ease: "power2.out",
        },
        "-=0.6"
      );
  }

  // --- 7. GENERAL SCROLL-TRIGGERED ANIMATIONS ---

  function initScrollAnimations() {
    // Use Locomotive's 'call' event for elements entering viewport
    locoScroll.on("call", (func, dir, obj) => {
      if (func === "reveal") {
        if (dir === "enter") {
          obj.el.classList.add("is-inview");
        }
      }
    });

    // Find all elements with 'reveal-up' and add the data-scroll attribute
    const revealElements = document.querySelectorAll(".reveal-up");
    revealElements.forEach((el) => {
      el.setAttribute("data-scroll", "");
      el.setAttribute("data-scroll-call", "reveal");
      el.setAttribute("data-scroll-repeat", "true");
    });
  }

  // --- 8. NEW: ACCORDION SCRIPT ---
  function initAccordion() {
    const accordionButtons = document.querySelectorAll(".accordion-button");

    accordionButtons.forEach(button => {
      button.addEventListener("click", () => {
        // Toggle the .active class on the button
        button.classList.toggle("active");

        // Find the content panel
        const content = button.nextElementSibling;
        
        // Toggle the .open class on the content
        content.classList.toggle("open");

        // CRITICAL FIX: Update Locomotive Scroll
        // We add a small delay to let the animation finish
        setTimeout(() => {
          if (locoScroll) {
            locoScroll.update();
          }
        }, 500); // 500ms matches the CSS transition
      });
    });
  }

  // --- 9. NEW: COURSE CERTIFICATE POPUP ---
  function initCertificatePopup() {
    const modal = document.getElementById("certificateModal");
    const backdrop = document.getElementById("certificateBackdrop");
    const closeButton = document.getElementById("certificateClose");
    const title = document.getElementById("certificateTitle");
    const provider = document.getElementById("certificateProvider");
    const date = document.getElementById("certificateDate");
    const description = document.getElementById("certificateDescription");
    const action = document.getElementById("certificateAction");
    const titleCard = document.getElementById("certificateTitleCard");
    const providerCard = document.getElementById("certificateProviderCard");
    const dateCard = document.getElementById("certificateDateCard");
    const certificateImage = document.getElementById("certificateImage");
    const certificateThumbnail = document.getElementById("certificateThumbnail");
    const items = document.querySelectorAll(".course-item");

    function openModal(data) {
      title.textContent = data.course || "Certificate Preview";
      provider.textContent = data.provider ? `Provider: ${data.provider}` : "Provider: Online Training";
      date.textContent = data.date ? `Issued: ${data.date}` : "Issued: Present";
      description.textContent = data.description || "This certificate was earned for completing the selected course.";
      titleCard.textContent = data.course || "Credential";
      providerCard.textContent = data.provider || "Verified Achievement";
      dateCard.textContent = data.date || "2025";

      if (data.image) {
        certificateImage.src = data.image;
        certificateImage.alt = `${data.course} certificate image`;
        certificateThumbnail.style.display = "block";
      } else {
        certificateThumbnail.style.display = "none";
      }

      if (data.link && data.link !== "#") {
        action.href = data.link;
        action.style.display = "inline-flex";
      } else if (data.image) {
        action.href = data.image;
        action.style.display = "inline-flex";
      } else {
        action.style.display = "none";
      }

      modal.classList.add("active");
      document.body.classList.add("no-scroll");
    }

    function closeModal() {
      modal.classList.remove("active");
      document.body.classList.remove("no-scroll");
    }

    items.forEach((item) => {
      item.addEventListener("click", () => openModal(item.dataset));
      item.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openModal(item.dataset);
        }
      });
    });

    closeButton.addEventListener("click", closeModal);
    backdrop.addEventListener("click", closeModal);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && modal.classList.contains("active")) {
        closeModal();
      }
    });
  }


  // --- INITIALIZE ALL FUNCTIONS ---

  window.addEventListener('load', () => {
      initPreloader();
      initSmoothScroll();
      initCursorFollower();
      initMobileNav();
      initScrollAnimations();
      initAccordion(); // <-- NEW: We call the accordion function
      initCertificatePopup();
      // initHeroAnimations() is called by the preloader

      // --- FIX FOR MISSING CONTENT ---
      // This forces the scroll library to re-calculate the page height
      // after all your content is loaded.
      setTimeout(() => {
          if (locoScroll) {
              locoScroll.update();
          }
      }, 500); // 500ms delay to be safe
      // --- END OF FIX ---
  });

  /*
  ==================================
    NEW "INSANE" STAR BACKGROUND SCRIPT
    (This is the Vanilla JS version of the React code)
  ==================================
  */
  document.addEventListener("DOMContentLoaded", () => {

    const canvas = document.getElementById("stars-canvas");
    if (!canvas) return; // Exit if canvas isn't found

    const ctx = canvas.getContext("2d");
    if (!ctx) return; // Exit if context can't be created

    // --- Settings (You can change these) ---
    const starDensity = 0.00015;
    const minTwinkleSpeed = 0.5;
    const maxTwinkleSpeed = 1;
    const twinkleProbability = 0.7;
    const allStarsTwinkle = true;
    // ------------------------------------

    let stars = [];
    let animationFrameId;

    function generateStars(width, height) {
      const area = width * height;
      const numStars = Math.floor(area * starDensity);
      const newStars = [];
      for (let i = 0; i < numStars; i++) {
        const shouldTwinkle = allStarsTwinkle || Math.random() < twinkleProbability;
        newStars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 0.05 + 0.5,
          opacity: Math.random() * 0.5 + 0.5,
          twinkleSpeed: shouldTwinkle
            ? minTwinkleSpeed + Math.random() * (maxTwinkleSpeed - minTwinkleSpeed)
            : null,
        });
      }
      return newStars;
    }

    function render() {
      if (!canvas) return; // Add a check
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((star) => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();

        if (star.twinkleSpeed !== null) {
          star.opacity = 0.5 + Math.abs(Math.sin((Date.now() * 0.001) / star.twinkleSpeed) * 0.5);
        }
      });
      animationFrameId = requestAnimationFrame(render);
    }

    function updateStars() {
      if (!canvas) return; // Add a check
      const { width, height } = canvas.getBoundingClientRect();
      
      if (width === 0 || height === 0) return; // Don't run if hidden
      
      canvas.width = width;
      canvas.height = height;
      stars = generateStars(width, height);
      
      // If render isn't running, start it
      if (!animationFrameId) {
        render();
      }
    }

    // Set initial size
    updateStars();

    // Re-run the star generator when the window resizes
    const resizeObserver = new ResizeObserver(updateStars);
    resizeObserver.observe(canvas);
    
    // Also clean up the animation when the page is unloaded
    window.addEventListener("beforeunload", () => {
      cancelAnimationFrame(animationFrameId);
      if (canvas) {
        resizeObserver.unobserve(canvas);
      }
    });

  });

})(); // The original file's closing bracket