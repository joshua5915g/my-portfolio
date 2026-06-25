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

  let pageLoaded = false;

  function initPreloader() {
    const preloader = document.querySelector(".preloader");
    const counterElement = document.querySelector(".preloader-counter");
    const preloaderText = document.querySelector(".preloader-text");

    let count = 0;
    let target = 100;

    // Animate counter
    let counterInterval = setInterval(() => {
      if (pageLoaded) {
        count += 5; // Fast forward to completion when loaded
      } else if (count < 85) {
        count += 1; // Normal speed while loading, caps at 85% until load event
      }

      if (count >= target) {
        count = target;
        clearInterval(counterInterval);

        // All animations complete, now fade out preloader (snappy transitions)
        const tl = gsap.timeline();
        tl.to(preloaderText, {
          y: -50,
          opacity: 0,
          duration: 0.4,
          ease: "power2.inOut",
        })
          .to(
            counterElement,
            {
              y: -50,
              opacity: 0,
              duration: 0.4,
              ease: "power2.inOut",
            },
            "-=0.3"
          )
          .to(preloader, {
            yPercent: -100,
            duration: 0.8,
            ease: "power3.inOut",
            onComplete: () => {
              preloader.style.display = "none";
              document.body.style.overflow = "visible"; // Allow scrolling
              initHeroAnimations(); // Start hero animations after preloader
            },
          });
      }

      counterElement.textContent = `${count}%`;
    }, 10); // Shorter interval (10ms) for smoother count-up
  }

  // --- 2. LOCOMOTIVE SCROLL INITIALIZATION ---

  let locoScroll;

  function initSmoothScroll() {
    const scrollContainer = document.querySelector("[data-scroll-container]");
    if (!scrollContainer) return;

    locoScroll = new LocomotiveScroll({
      el: scrollContainer,
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
      pinType: scrollContainer.style.transform
        ? "transform"
        : "fixed",
    });

    // Dynamic height calculation on container element resizing
    const resizeObserver = new ResizeObserver(() => {
      if (locoScroll) {
        locoScroll.update();
        ScrollTrigger.refresh();
      }
    });
    resizeObserver.observe(scrollContainer);

    // Anchor Link Smooth Scroll Interceptor
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        if (href.startsWith("#")) {
          e.preventDefault();
          if (href === "#" || href === "#top") {
            locoScroll.scrollTo(0);
          } else {
            // Close mobile menu if active
            const hamburger = document.querySelector(".hamburger-menu");
            const navLinks = document.querySelector(".nav-links");
            if (hamburger && navLinks) {
              hamburger.classList.remove("active");
              navLinks.classList.remove("active");
            }
            // Scroll directly using selector string
            locoScroll.scrollTo(href);
          }
        }
      });
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
    const speed = 0.75; // Snappy tracking (75% distance covered per frame)

    function updateCursor() {
      currentX += (mouseX - currentX) * speed;
      currentY += (mouseY - currentY) * speed;
      cursor.style.transform = `translate(${currentX}px, ${currentY}px)`;
      requestAnimationFrame(updateCursor);
    }

    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
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
  
  // --- 10. AI CHATBOT WIDGET LOGIC ---

  function initChatbot() {
    const trigger = document.getElementById("chatbotTrigger");
    const box = document.getElementById("chatbotBox");
    const tooltip = document.getElementById("chatbotTooltip");
    const closeBtn = document.getElementById("chatbotCloseBtn");
    const settingsBtn = document.getElementById("chatbotSettingsBtn");
    const settings = document.getElementById("chatbotSettings");
    const apiKeyInput = document.getElementById("chatbotApiKeyInput");
    const saveKeyBtn = document.getElementById("chatbotSaveKeyBtn");
    const keyStatus = document.getElementById("chatbotKeyStatus");
    const messages = document.getElementById("chatbotMessages");
    const input = document.getElementById("chatbotInput");
    const sendBtn = document.getElementById("chatbotSendBtn");
    const suggestions = document.querySelectorAll(".suggestion-chip");
    const notificationDot = document.querySelector(".chatbot-notification-dot");

    // Load key from storage on startup
    let geminiApiKey = sessionStorage.getItem("chatbot_gemini_key") || "";
    if (geminiApiKey) {
      apiKeyInput.value = geminiApiKey;
      keyStatus.textContent = "Gemini Live Mode Active.";
    }

    // Toggle Chat Panel
    trigger.addEventListener("click", () => {
      box.classList.toggle("active");
      if (box.classList.contains("active")) {
        box.setAttribute("aria-hidden", "false");
        if (notificationDot) {
          notificationDot.style.display = "none"; // Hide notification dot
        }
        if (tooltip) {
          tooltip.classList.remove("active"); // Permanently hide the tooltip hint
        }
        // Auto focus input on desktops
        setTimeout(() => input.focus(), 300);
      } else {
        box.setAttribute("aria-hidden", "true");
      }
    });

    // Close Panel
    closeBtn.addEventListener("click", () => {
      box.classList.remove("active");
      box.setAttribute("aria-hidden", "true");
    });

    // Auto-open chatbot tooltip hint after page load with a delay (3 seconds after preloader finishes)
    setTimeout(() => {
      if (tooltip && !box.classList.contains("active")) {
        tooltip.classList.add("active");
      }
    }, 3000);

    // Toggle Settings Panel
    settingsBtn.addEventListener("click", () => {
      settings.classList.toggle("active");
    });

    // Save Gemini Key
    saveKeyBtn.addEventListener("click", () => {
      const value = apiKeyInput.value.trim();
      if (value) {
        sessionStorage.setItem("chatbot_gemini_key", value);
        geminiApiKey = value;
        keyStatus.textContent = "Gemini Live Mode Active.";
        addBotMessage("Developer mode enabled. I am now connected live to Gemini!");
      } else {
        sessionStorage.removeItem("chatbot_gemini_key");
        geminiApiKey = "";
        keyStatus.textContent = "Using offline knowledge base.";
        addBotMessage("Gemini key cleared. Switched back to offline knowledge base.");
      }
      settings.classList.remove("active");
    });

    // Send Message on Enter
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        sendMessage();
      }
    });

    sendBtn.addEventListener("click", sendMessage);

    // Click Suggestion Chips
    suggestions.forEach(chip => {
      chip.addEventListener("click", () => {
        const query = chip.dataset.query;
        if (query) {
          addUserMessage(query);
          generateResponse(query);
        }
      });
    });

    function sendMessage() {
      const query = input.value.trim();
      if (!query) return;

      addUserMessage(query);
      input.value = "";
      generateResponse(query);
    }

    function addUserMessage(text) {
      const messageDiv = document.createElement("div");
      messageDiv.className = "chat-message user";
      messageDiv.innerHTML = `<div class="message-bubble">${escapeHTML(text)}</div>`;
      messages.appendChild(messageDiv);
      scrollToBottom();
    }

    function addBotMessage(text) {
      const messageDiv = document.createElement("div");
      messageDiv.className = "chat-message bot";
      messageDiv.innerHTML = `<div class="message-bubble">${text}</div>`;
      messages.appendChild(messageDiv);
      scrollToBottom();
    }

    function showTypingIndicator() {
      const indicatorDiv = document.createElement("div");
      indicatorDiv.className = "chat-message bot typing-container";
      indicatorDiv.innerHTML = `
        <div class="message-bubble typing-indicator">
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
        </div>
      `;
      messages.appendChild(indicatorDiv);
      scrollToBottom();
      return indicatorDiv;
    }

    function scrollToBottom() {
      messages.scrollTop = messages.scrollHeight;
    }

    function escapeHTML(str) {
      return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
      );
    }

    // Generate Response
    async function generateResponse(userQuery) {
      const indicator = showTypingIndicator();

      // Delay to simulate human-like response parsing
      setTimeout(async () => {
        // Remove typing indicator
        if (indicator && indicator.parentNode) {
          indicator.parentNode.removeChild(indicator);
        }

        if (geminiApiKey) {
          // Live Gemini Request
          try {
            const response = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  contents: [
                    {
                      role: "user",
                      parts: [{ text: userQuery }]
                    }
                  ],
                  systemInstruction: {
                    parts: [{ text: "You are a professional AI Assistant for Joshua Jose's portfolio website. Act friendly, professional, and knowledgeable about Joshua Jose. Keep answers concise, in bullet points or short paragraphs. Joshua's background: 20-year-old from Kerala, India, completed Plus Two CS, runs e-services digital communications business, church piano player, certified by IBM (AI Developer) and Oracle (OCI Foundations), interested in cybersecurity, built 'The Walls Will Fall' AI film, a React Personal Finance Tracker, and the Next.js WattWise solar intelligence platform. If asked about unrelated topics, politely redirect back to Joshua's portfolio." }]
                  }
                })
              }
            );

            if (!response.ok) {
              throw new Error("API call failed");
            }

            const data = await response.json();
            const text = data.candidates[0].content.parts[0].text;
            addBotMessage(formatMarkdown(text));
          } catch (error) {
            console.error(error);
            addBotMessage("Oops! I failed to reach Gemini. Please verify your API Key or connection in ⚙️ settings. Falling back to offline knowledge base...");
            respondOffline(userQuery);
          }
        } else {
          // Offline rule-based matching
          respondOffline(userQuery);
        }
      }, 1000);
    }

    function respondOffline(query) {
      const cleanQuery = query.toLowerCase().trim();
      let reply = "";

      if (cleanQuery.includes("hello") || cleanQuery.includes("hi") || cleanQuery.includes("hey") || cleanQuery.includes("who are you") || cleanQuery.includes("about") || cleanQuery.includes("joshua") || cleanQuery.includes("josh")) {
        reply = "I am Joshua's personal AI assistant! I can help you learn more about his Computer Science background, e-service business, portfolio projects, certifications, or piano playing. Ask me anything!";
      } else if (cleanQuery.includes("project") || cleanQuery.includes("experiment") || cleanQuery.includes("work") || cleanQuery.includes("portfolio") || cleanQuery.includes("veo") || cleanQuery.includes("suno") || cleanQuery.includes("miracle") || cleanQuery.includes("walls") || cleanQuery.includes("finance") || cleanQuery.includes("wattwise") || cleanQuery.includes("solar")) {
        reply = "Joshua has worked on four major projects:<br><br>1. **'The Walls Will Fall' (2025)**: A cinematic generative AI film using Veo 3, Suno AI, and Microsoft Editor.<br>2. **'The True Red Sea Miracle' (2026)**: Pushing prolonged physics-defying generative environments.<br>3. **'Personal Finance Tracker' (2026)**: A complete React and Node.js web application for budget management.<br>4. **'WattWise' (2026)**: An AI-powered solar energy forecasting and ROI optimization platform.<br><br>Scroll to the **Projects** section to view them!";
      } else if (cleanQuery.includes("skill") || cleanQuery.includes("coding") || cleanQuery.includes("python") || cleanQuery.includes("html") || cleanQuery.includes("programming") || cleanQuery.includes("experience") || cleanQuery.includes("language")) {
        reply = "Joshua is fluent in Computer Science fundamentals, programming logic, basic Python, and Web Development (HTML/CSS/JS). He also excels in applied AI workflows, prompt design, and managing his e-service digital communications business handling client data and transactions.";
      } else if (cleanQuery.includes("certification") || cleanQuery.includes("credential") || cleanQuery.includes("achievement") || cleanQuery.includes("course") || cleanQuery.includes("oracle") || cleanQuery.includes("ibm") || cleanQuery.includes("intel")) {
        reply = "Joshua holds several high-level credentials:<br><br>- **IBM AI Developer Professional Certificate**: 10 completed courses including Software Engineering, Python, Flask, and Generative AI Applications.<br>- **Oracle Cloud**: Certified AI Foundations Associate (2025).<br>- **Generative AI MASTER MIND**: AI Fundamentals and Deep Learning.<br>- **Intel Corporation**: AI Appreciate and AI Aware Badges.<br><br>Click on items in the **Achievements** section to see details!";
      } else if (cleanQuery.includes("contact") || cleanQuery.includes("hire") || cleanQuery.includes("email") || cleanQuery.includes("social") || cleanQuery.includes("linkedin") || cleanQuery.includes("github") || cleanQuery.includes("x") || cleanQuery.includes("twitter")) {
        reply = "You can easily connect with Joshua!<br><br>- **LinkedIn**: <a href='https://www.linkedin.com/in/joshua-jose-466975371/' target='_blank' rel='noopener noreferrer'>View Profile</a><br>- **GitHub**: <a href='https://github.com/joshua5915g' target='_blank' rel='noopener noreferrer'>joshua5915g</a><br>- **X**: <a href='https://x.com/Profess57176192' target='_blank' rel='noopener noreferrer'>@Profess57176192</a><br><br>You can also find direct social links at the **Contact** section at the bottom of the page.";
      } else if (cleanQuery.includes("piano") || cleanQuery.includes("music") || cleanQuery.includes("church") || cleanQuery.includes("hobby") || cleanQuery.includes("kerala") || cleanQuery.includes("india") || cleanQuery.includes("fact")) {
        reply = "Fun Fact: Joshua is a 20-year-old from Kerala, India. When he is not coding or managing digital operations, he is the piano player at his local church! He has a strong interest in understanding computing foundations, cybersecurity, and stripping away system abstractions.";
      } else if (cleanQuery.includes("cybersecurity") || cleanQuery.includes("security") || cleanQuery.includes("future")) {
        reply = "Joshua is passionate about cybersecurity and computing systems. Having run an e-service business handling client data, he has seen firsthand how critical secure, robust, and well-architected systems are, which drives his desire to study cybersecurity in university.";
      } else {
        reply = "That's an interesting question! While my offline knowledge base is specifically configured for Joshua's skills, projects, certifications, and background, you can ask me things like 'What certifications do you have?' or 'Tell me about the piano playing'. Or, toggle the ⚙️ settings to paste a Google Gemini API Key for a live, open-ended conversation!";
      }

      addBotMessage(reply);
    }

    function formatMarkdown(text) {
      return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    }
  }

  // --- INITIALIZE ALL FUNCTIONS ---

  // Start preloader animation immediately upon script execution
  initPreloader();

  function handlePageLoad() {
      if (pageLoaded) return; // Ensure it only runs once
      pageLoaded = true; // Signal the preloader that the page is fully loaded
      
      initSmoothScroll();
      initCursorFollower();
      initMobileNav();
      initScrollAnimations();
      initAccordion(); // Keep fallback accordion capability
      initCertificatePopup();
      initChatbot(); // Initialize chatbot widget

      // --- FIX FOR MISSING CONTENT ---
      // This forces the scroll library to re-calculate the page height
      // after all your content is loaded.
      setTimeout(() => {
          if (locoScroll) {
              locoScroll.update();
          }
      }, 500); // 500ms delay to be safe
      // --- END OF FIX ---
  }

  // Robust check for window 'load' (safeguards against fast cached loads)
  if (document.readyState === 'complete') {
      handlePageLoad();
  } else {
      window.addEventListener('load', handlePageLoad);
  }

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