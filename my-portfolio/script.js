/*
 * SCRIPT.JS
 * * This file handles all client-side interactivity for the portfolio.
 * It uses GSAP for animations and Locomotive Scroll for smooth scrolling.
 * * 1. Preloader Animation
 * 2. Locomotive Scroll Initialization
 * 3. GSAP ScrollTrigger Integration
 * 4. Custom Cursor Follower
 * 5. Mobile Navigation Toggle
 * 6. Hero Text Animation
 * 7. General Scroll-Triggered Animations ("reveal-up")
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

    window.addEventListener("mousemove", (e) => {
      gsap.to(cursor, {
        duration: 0.3,
        x: e.clientX,
        y: e.clientY,
        ease: "power3.out",
      });
    });

    // Hide cursor on body leave
    document.body.addEventListener("mouseleave", () => {
      gsap.to(cursor, {
        duration: 0.3,
        opacity: 0,
      });
    });

    // Show cursor on body enter
    document.body.addEventListener("mouseenter", () => {
      gsap.to(cursor, {
        duration: 0.3,
        opacity: 1,
      });
    });
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

  // --- INITIALIZE ALL FUNCTIONS ---

  window.addEventListener('load', () => {
      initPreloader();
      initSmoothScroll();
      initCursorFollower();
      initMobileNav();
      initScrollAnimations();
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

})();