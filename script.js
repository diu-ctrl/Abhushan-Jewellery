/* =============================================================
   ABHUSHAN – Fine Gold Jewellery · Ahmedabad, Gujarat, India
   Main JavaScript
   ============================================================= */

(function () {
  'use strict';

  /* ============================================================
     HEADER: Scroll behaviour
     ============================================================ */
  const header = document.getElementById('site-header');

  function onScroll() {
    const hero = document.getElementById('hero-slider');
    const threshold = hero ? hero.offsetHeight - 80 : window.innerHeight - 80;
    if (window.scrollY >= threshold) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ============================================================
     MOBILE MENU
     ============================================================ */
  const hamburger   = document.getElementById('hamburger-btn');
  const mobileMenu  = document.getElementById('mobile-menu');
  const overlayBg   = document.getElementById('overlay-bg');

  function openMobileMenu() {
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('open');
    mobileMenu.style.display = 'flex';
    overlayBg.classList.add('active');
    header.classList.add('menu-open');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
    header.classList.remove('menu-open');
    document.body.style.overflow = '';
    setTimeout(() => {
      if (!mobileMenu.classList.contains('open')) {
        // leave display as flex, CSS handles visibility
      }
    }, 300);
  }

  hamburger.addEventListener('click', () => {
    if (hamburger.classList.contains('open')) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  /* ============================================================
     OVERLAY CLOSING
     ============================================================ */
  overlayBg.addEventListener('click', () => {
    closeMobileMenu();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMobileMenu();
    }
  });

  /* ============================================================
     HERO SLIDER
     ============================================================ */
  const slides   = document.querySelectorAll('.hero-slide');
  const dots     = document.querySelectorAll('.slider-dot');
  let currentSlide = 0;
  let sliderInterval;

  function goToSlide(index) {
    if (slides.length <= 1) return;
    slides[currentSlide].classList.remove('active');
    if (dots[currentSlide]) dots[currentSlide].classList.remove('active');
    currentSlide = (index + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    if (dots[currentSlide]) dots[currentSlide].classList.add('active');
  }

  function nextSlide() { goToSlide(currentSlide + 1); }

  function startAutoplay() {
    if (slides.length <= 1) return;
    sliderInterval = setInterval(nextSlide, 5000);
  }

  function resetAutoplay() {
    if (slides.length <= 1) return;
    clearInterval(sliderInterval);
    startAutoplay();
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      goToSlide(i);
      resetAutoplay();
    });
  });

  // Swipe support for hero
  let touchStartX = 0;
  const heroSlider = document.getElementById('hero-slider');
  if (heroSlider) {
    heroSlider.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    heroSlider.addEventListener('touchend', (e) => {
      if (slides.length <= 1) return;
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        goToSlide(diff > 0 ? currentSlide + 1 : currentSlide - 1);
        resetAutoplay();
      }
    });
  }

  startAutoplay();

  /* ============================================================
     PRODUCT CAROUSEL (generic)
     ============================================================ */
  function initCarousel(trackId, prevId, nextId) {
    const track  = document.getElementById(trackId);
    const prev   = document.getElementById(prevId);
    const next   = document.getElementById(nextId);
    if (!track || !prev || !next) return;

    const cards       = track.querySelectorAll('.product-card');
    let currentIndex  = 0;
    let visibleCount  = getVisibleCount();

    function getVisibleCount() {
      if (window.innerWidth <= 768) return 1;
      if (window.innerWidth <= 1024) return 2;
      return 3;
    }

    function getMaxIndex() {
      visibleCount = getVisibleCount();
      return Math.max(0, cards.length - visibleCount);
    }

    function updateTrack() {
      const cardWidth = cards[0] ? cards[0].offsetWidth : 0;
      const gap = 24; // --space-lg
      const offset = currentIndex * (cardWidth + gap);
      track.style.transform = `translateX(-${offset}px)`;
      prev.disabled = currentIndex === 0;
      next.disabled = currentIndex >= getMaxIndex();
    }

    prev.addEventListener('click', () => {
      currentIndex = Math.max(0, currentIndex - 1);
      updateTrack();
    });

    next.addEventListener('click', () => {
      currentIndex = Math.min(getMaxIndex(), currentIndex + 1);
      updateTrack();
    });

    window.addEventListener('resize', () => {
      currentIndex = Math.min(currentIndex, getMaxIndex());
      updateTrack();
    });

    // Init
    prev.disabled = true;
    updateTrack();
  }

  initCarousel('picked-track', 'picked-prev', 'picked-next');
  initCarousel('new-track', 'new-prev', 'new-next');





  function showToast(msg) {
    const existing = document.querySelector('.abhushan-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'abhushan-toast';
    toast.textContent = msg;
    toast.style.cssText = `
      position: fixed;
      bottom: 32px;
      left: 50%;
      transform: translateX(-50%) translateY(12px);
      background: #1a1714;
      color: #ffffff;
      padding: 14px 28px;
      font-family: 'Jost', sans-serif;
      font-size: 13px;
      letter-spacing: 0.05em;
      z-index: 999;
      opacity: 0;
      transition: all 0.35s ease;
      white-space: nowrap;
      pointer-events: none;
    `;
    document.body.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(12px)';
      setTimeout(() => toast.remove(), 350);
    }, 2800);
  }

  /* ============================================================
     APPOINTMENT BOOKING FORM
     ============================================================ */
  const bookingDateInput = document.getElementById('booking-date');
  if (bookingDateInput) {
    const today = new Date().toISOString().split('T')[0];
    bookingDateInput.setAttribute('min', today);
  }

  const bookingForm = document.getElementById('booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('booking-name').value;
      const email = document.getElementById('booking-email').value;
      const phone = document.getElementById('booking-phone').value;
      const date = document.getElementById('booking-date').value;
      const time = document.getElementById('booking-time').value;
      const service = document.getElementById('booking-service').value;
      const notes = document.getElementById('booking-notes').value || '';
      
      // Generate unique booking reference ID e.g., AB-1943
      const randNum = Math.floor(1000 + Math.random() * 9000);
      const bookingId = 'AB-' + randNum;
      
      // Store in localStorage
      const newBooking = {
        id: bookingId,
        name: name,
        email: email,
        phone: phone,
        date: date,
        time: time,
        service: service,
        notes: notes,
        status: 'Pending',
        created_at: new Date().toISOString()
      };
      
      let appointments = [];
      try {
        const existing = localStorage.getItem('abhushan_appointments');
        if (existing) {
          appointments = JSON.parse(existing);
        }
      } catch (err) {
        console.error('Error reading localStorage appointments:', err);
      }
      
      appointments.push(newBooking);
      localStorage.setItem('abhushan_appointments', JSON.stringify(appointments));
      
      // Show confirmation toast
      showToast(`Success! Booking ${bookingId} requested. We will contact you soon. ✦`);
      
      // Reset form
      bookingForm.reset();
      if (bookingDateInput) {
        bookingDateInput.value = '';
      }
    });
  }

  /* ============================================================
     ADMIN PORTAL PASSCODE MODAL & AUTHENTICATION
     ============================================================ */
  const adminTrigger = document.getElementById('admin-trigger');
  const adminModal = document.getElementById('admin-modal-overlay');
  const adminModalClose = document.getElementById('admin-modal-close');
  const adminLoginForm = document.getElementById('admin-login-form');
  const adminPasswordInput = document.getElementById('admin-password-input');
  const adminLoginError = document.getElementById('admin-login-error');

  if (adminTrigger && adminModal) {
    adminTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      adminModal.classList.add('active');
      adminPasswordInput.value = '';
      adminLoginError.textContent = '';
      setTimeout(() => adminPasswordInput.focus(), 150);
    });
  }

  if (adminModalClose && adminModal) {
    adminModalClose.addEventListener('click', () => {
      adminModal.classList.remove('active');
    });
  }

  // Close modal if clicked outside
  if (adminModal) {
    adminModal.addEventListener('click', (e) => {
      if (e.target === adminModal) {
        adminModal.classList.remove('active');
      }
    });
  }

  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const enteredPassword = adminPasswordInput.value.trim();
      
      // Validate password (both 'admin123' and 'abhushan2026' are accepted)
      if (enteredPassword === 'admin123' || enteredPassword === 'abhushan2026') {
        sessionStorage.setItem('abhushan_admin_authenticated', 'true');
        adminModal.classList.remove('active');
        showToast('Authentication successful. Redirecting... ✦');
        setTimeout(() => {
          window.location.href = 'admin.html';
        }, 800);
      } else {
        adminLoginError.textContent = 'Incorrect passcode. Please try again.';
        adminPasswordInput.value = '';
        adminPasswordInput.focus();
      }
    });
  }

  /* ============================================================
     FADE-IN-UP SCROLL ANIMATIONS
     ============================================================ */
  const animEls = document.querySelectorAll(
    '.section-title, .product-card, .category-grid-item, .editorial-full-content, ' +
    '.split-text-col, .story-text-col, .story-value, .booking-card, ' +
    '.booking-heading, .booking-sub, .footer-col, .editorial-eyebrow, ' +
    '.hero-content'
  );

  animEls.forEach(el => el.classList.add('fade-in-up'));

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  animEls.forEach(el => io.observe(el));

  /* ============================================================
     STAGGERED ANIMATION for grids
     ============================================================ */
  document.querySelectorAll('.product-card').forEach((card, i) => {
    card.style.transitionDelay = `${i * 0.06}s`;
  });
  document.querySelectorAll('.category-grid-item').forEach((item, i) => {
    item.style.transitionDelay = `${i * 0.07}s`;
  });
  document.querySelectorAll('.story-value').forEach((val, i) => {
    val.style.transitionDelay = `${i * 0.1}s`;
  });

  /* ============================================================
     ANNOUNCEMENT BAR: Pause on hover
     ============================================================ */
  const tickerTrack = document.querySelector('.ticker-track');
  if (tickerTrack) {
    tickerTrack.addEventListener('mouseenter', () => {
      tickerTrack.style.animationPlayState = 'paused';
    });
    tickerTrack.addEventListener('mouseleave', () => {
      tickerTrack.style.animationPlayState = 'running';
    });
  }



  // Main Nav Links Toast
  document.querySelectorAll('.site-header .nav-link:not(#account-link), .mobile-nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      showToast(`Exploring the ${link.textContent} collection — coming soon! ✦`);
      closeMobileMenu();
    });
  });

  /* ============================================================
     SMOOTH image placeholders → real images swap
     (When you drop real images into the folder, the script below
      will auto-detect and swap them in. Map filenames here.)
     ============================================================ */
  const imageMap = [
    // { selector: '.hero-placeholder-1', src: 'images/hero1.jpg', alt: 'Heritage Edit' },
    // { selector: '.hero-placeholder-2', src: 'images/hero2.jpg', alt: 'Bridal' },
  ];

  imageMap.forEach(({ selector, src, alt }) => {
    const el = document.querySelector(selector);
    if (!el) return;
    const img = new Image();
    img.onload = () => {
      img.alt = alt;
      img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;';
      el.style.border = 'none';
      el.appendChild(img);
    };
    img.src = src;
  });

  /* ============================================================
     LOGO click scroll to top
     ============================================================ */
  document.getElementById('logo-link').addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ============================================================
     LOGO LETTER-BY-LETTER CURSIVE ANIMATION
     ============================================================ */
  const logoTextEl = document.querySelector('.logo-text');
  if (logoTextEl) {
    const originalText = logoTextEl.textContent.trim();
    logoTextEl.innerHTML = '';
    [...originalText].forEach((char, idx) => {
      const charSpan = document.createElement('span');
      charSpan.textContent = char === ' ' ? '\u00A0' : char;
      charSpan.className = 'logo-letter';
      charSpan.style.animationDelay = `${idx * 0.09}s`;
      logoTextEl.appendChild(charSpan);
    });
  }

  /* ============================================================
     COMING SOON TOAST NOTIFICATION
     ============================================================ */
  function showComingSoonToast(pageName) {
    let toast = document.getElementById('luxury-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'luxury-toast';
      toast.className = 'luxury-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = `The "${pageName}" page is coming soon.`;
    toast.classList.add('show');
    
    if (toast.timeoutId) {
      clearTimeout(toast.timeoutId);
    }
    
    toast.timeoutId = setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-coming-soon]');
    if (link) {
      e.preventDefault();
      let pageName = link.getAttribute('data-coming-soon-title') || link.textContent.trim();
      if (!pageName || pageName === 'meow!') {
        const img = link.querySelector('img');
        if (img && img.alt) {
          pageName = img.alt;
        } else {
          pageName = 'collection';
        }
      }
      showComingSoonToast(pageName);
    }
  });

  /* ============================================================
     SMOOTH SCROLL FOR BOOKING SECTION LINKS
     ============================================================ */
  document.querySelectorAll('a[href="#booking-section"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.getElementById('booking-section');
      if (target) {
        // Close mobile menu if it is open
        if (typeof closeMobileMenu === 'function') {
          closeMobileMenu();
        }
        target.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });

  /* ============================================================
     LIVE CHAT WIDGET LOGIC
     ============================================================ */
  function isConsultantOnline() {
    const now = new Date();
    // Convert to IST (UTC + 5:30)
    const utcHour = now.getUTCHours();
    const utcMinute = now.getUTCMinutes();
    let istHour = utcHour + 5;
    let istMinute = utcMinute + 30;
    if (istMinute >= 60) {
      istHour += 1;
      istMinute -= 60;
    }
    istHour = istHour % 24;
    
    // Online from 10:00 AM to 7:00 PM IST
    return istHour >= 10 && istHour < 19;
  }

  function renderPreChatForm() {
    return `
      <form class="chat-form" id="chat-online-form">
        <div class="chat-form-field">
          <label for="chat-name">Name</label>
          <input type="text" id="chat-name" class="chat-input" placeholder="Your name" required />
        </div>
        <div class="chat-form-field">
          <label for="chat-email">Email</label>
          <input type="email" id="chat-email" class="chat-input" placeholder="Your email address" required />
        </div>
        <div class="chat-form-field">
          <label for="chat-help">What can we help you with?</label>
          <select id="chat-help" class="chat-select" required>
            <option value="" disabled selected>Select an option</option>
            <option value="Product Inquiry">Product Inquiry</option>
            <option value="Custom Design">Custom Design</option>
            <option value="Welded Forever Appointment">Welded Forever Appointment</option>
            <option value="Order Status">Order Status</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <button type="submit" class="chat-submit-btn">Start Chat</button>
      </form>
    `;
  }

  function renderOnlineSuccess() {
    return `
      <div class="chat-success-state">
        <svg class="chat-success-icon" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" fill="none">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h4 class="chat-success-title">Thank You</h4>
        <p class="chat-success-desc">A consultant will join shortly. In the meantime, here are some quick links:</p>
        
        <div class="chat-quick-links-title">Quick Links</div>
        <div class="chat-quick-links-list">
          <button class="chat-quick-link-btn" id="link-chat-book">Book a Studio Appointment</button>
          <button class="chat-quick-link-btn" id="link-chat-browse">Browse Collections</button>
          <button class="chat-quick-link-btn" id="link-chat-tryon">Virtual Try-On</button>
        </div>
      </div>
    `;
  }

  function renderOfflineForm() {
    return `
      <form class="chat-form" id="chat-offline-form-el">
        <p class="chat-offline-desc">We're currently offline. Leave a message and we'll respond within 24 hours.</p>
        <div class="chat-form-field">
          <label for="chat-off-name">Name</label>
          <input type="text" id="chat-off-name" class="chat-input" placeholder="Your name" required />
        </div>
        <div class="chat-form-field">
          <label for="chat-off-email">Email</label>
          <input type="email" id="chat-off-email" class="chat-input" placeholder="Your email address" required />
        </div>
        <div class="chat-form-field">
          <label for="chat-off-msg">Message</label>
          <textarea id="chat-off-msg" class="chat-textarea" placeholder="How can we help you?" rows="3" required></textarea>
        </div>
        <button type="submit" class="chat-submit-btn">Send Message</button>
      </form>
    `;
  }

  function renderOfflineSuccess() {
    return `
      <div class="chat-success-state">
        <svg class="chat-success-icon" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" fill="none">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-2.25-1.5a2 2 0 00-2.22 0l-2.25 1.5M12 22.25V19" />
        </svg>
        <h4 class="chat-success-title">Message Sent</h4>
        <p class="chat-success-desc">Thank you. We have received your message and will respond within 24 hours.</p>
        
        <div class="chat-quick-links-title">Quick Links</div>
        <div class="chat-quick-links-list">
          <button class="chat-quick-link-btn" id="link-chat-book">Book a Studio Appointment</button>
          <button class="chat-quick-link-btn" id="link-chat-browse">Browse Collections</button>
          <button class="chat-quick-link-btn" id="link-chat-tryon">Virtual Try-On</button>
        </div>
      </div>
    `;
  }

  function setupQuickLinkListeners() {
    const btnBook = document.getElementById('link-chat-book');
    const btnBrowse = document.getElementById('link-chat-browse');
    const btnTryOn = document.getElementById('link-chat-tryon');
    
    if (btnBook) {
      btnBook.addEventListener('click', () => {
        const panel = document.getElementById('chat-panel');
        if (panel) {
          panel.classList.remove('open');
          localStorage.setItem('abhushan_chat_open', 'false');
        }
        const target = document.getElementById('booking-section');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.location.href = 'index.html#booking-section';
        }
      });
    }
    
    if (btnBrowse) {
      btnBrowse.addEventListener('click', () => {
        const panel = document.getElementById('chat-panel');
        if (panel) {
          panel.classList.remove('open');
          localStorage.setItem('abhushan_chat_open', 'false');
        }
        const target = document.getElementById('section-category-grid');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.location.href = 'index.html#section-category-grid';
        }
      });
    }
    
    if (btnTryOn) {
      btnTryOn.addEventListener('click', () => {
        if (typeof showComingSoonToast === 'function') {
          showComingSoonToast('Virtual Try-On');
        } else {
          alert('Virtual Try-On feature is coming soon.');
        }
      });
    }
  }

  function setupFormListeners() {
    const onlineForm = document.getElementById('chat-online-form');
    const offlineForm = document.getElementById('chat-offline-form-el');
    
    if (onlineForm) {
      onlineForm.addEventListener('submit', (e) => {
        e.preventDefault();
        localStorage.setItem('abhushan_chat_submitted', 'true');
        const body = document.getElementById('chat-panel-body');
        if (body) {
          body.innerHTML = renderOnlineSuccess();
          setupQuickLinkListeners();
        }
      });
    }
    
    if (offlineForm) {
      offlineForm.addEventListener('submit', (e) => {
        e.preventDefault();
        localStorage.setItem('abhushan_chat_offline_submitted', 'true');
        const body = document.getElementById('chat-panel-body');
        if (body) {
          body.innerHTML = renderOfflineSuccess();
          setupQuickLinkListeners();
        }
      });
    }
    
    setupQuickLinkListeners();
  }

  function injectChatWidget() {
    if (document.getElementById('chat-widget-container')) return;

    const container = document.createElement('div');
    container.id = 'chat-widget-container';
    
    const online = isConsultantOnline();
    const isSubmitted = localStorage.getItem('abhushan_chat_submitted') === 'true';
    const isOfflineSubmitted = localStorage.getItem('abhushan_chat_offline_submitted') === 'true';
    
    let bodyContent = '';
    if (online) {
      bodyContent = isSubmitted ? renderOnlineSuccess() : renderPreChatForm();
    } else {
      bodyContent = isOfflineSubmitted ? renderOfflineSuccess() : renderOfflineForm();
    }
    
    const chatIconSvg = `
      <svg viewBox="0 0 24 24">
        <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
      </svg>
    `;
    
    container.innerHTML = `
      <button class="chat-widget-trigger pulse-active" id="chat-trigger-btn" aria-label="Open Chat with Abhushan">
        ${chatIconSvg}
      </button>
      <div class="chat-widget-panel" id="chat-panel">
        <div class="chat-panel-header">
          <div class="chat-header-info">
            <h3 class="chat-panel-title">Chat with Abhushan</h3>
            <p class="chat-panel-subtitle">Our jewelry consultants are here to help</p>
          </div>
          <button class="chat-panel-close-btn" id="chat-close-btn" aria-label="Close Chat">&times;</button>
        </div>
        <div class="chat-panel-body" id="chat-panel-body">
          ${bodyContent}
        </div>
      </div>
    `;
    
    document.body.appendChild(container);
    
    const triggerBtn = document.getElementById('chat-trigger-btn');
    const panel = document.getElementById('chat-panel');
    const closeBtn = document.getElementById('chat-close-btn');
    
    if (localStorage.getItem('abhushan_chat_open') === 'true') {
      if (panel) panel.classList.add('open');
      if (triggerBtn) triggerBtn.classList.remove('pulse-active');
    }
    
    if (triggerBtn && panel) {
      triggerBtn.addEventListener('click', () => {
        panel.classList.toggle('open');
        triggerBtn.classList.remove('pulse-active');
        const isOpen = panel.classList.contains('open');
        localStorage.setItem('abhushan_chat_open', isOpen ? 'true' : 'false');
      });
    }
    
    if (closeBtn && panel) {
      closeBtn.addEventListener('click', () => {
        panel.classList.remove('open');
        localStorage.setItem('abhushan_chat_open', 'false');
      });
    }
    
    setupFormListeners();
  }

  /* ============================================================
     SEARCH FUNCTIONALITY LOGIC
     ============================================================ */
  const searchCatalog = [
    {
      name: "Threadbare Ring",
      price: "₹3,999",
      category: "Rings",
      image: "images/_Product Cards/prod_ring1.png",
      url: "product-threadbare-ring.html",
      keywords: ["ring", "threadbare", "thin", "band", "minimalist", "18k", "gold", "stacking"]
    },
    {
      name: "Hammered Hoop Earring",
      price: "₹5,299",
      category: "Earrings",
      image: "images/_Product Cards/prod_earring1.png",
      url: "product-hammered-hoop.html",
      keywords: ["earring", "hammered", "hoop", "circular", "18k", "gold"]
    },
    {
      name: "Greco Lariat",
      price: "₹32,999",
      category: "Necklaces",
      image: "images/_Product Cards/prod_necklace1.png",
      url: "product-greco-lariat.html",
      keywords: ["necklace", "lariat", "greco", "chain", "pendant", "22k", "gold", "emerald"]
    },
    {
      name: "Sweet Nothing Bracelet",
      price: "₹11,299",
      category: "Bracelets",
      image: "images/_Product Cards/prod_bracelet1.png",
      url: "product-sweet-nothing.html",
      keywords: ["bracelet", "sweet", "nothing", "chain", "thin", "18k", "gold"]
    },
    {
      name: "Tomboy Ring",
      price: "₹21,999",
      category: "Rings",
      image: "images/_Product Cards/prod_ring2.png",
      url: "product-tomboy-ring.html",
      keywords: ["ring", "tomboy", "bold", "matte", "brushed", "18k", "gold"]
    }
  ];

  function injectSearchWidget() {
    if (document.getElementById('search-overlay')) return;

    // 1. Inject trigger icon in nav-top-right
    const navTopRight = document.querySelector('.nav-top-right');
    if (navTopRight) {
      const searchTrigger = document.createElement('button');
      searchTrigger.id = 'search-trigger-btn-header';
      searchTrigger.className = 'nav-action-btn-tiffany';
      searchTrigger.setAttribute('aria-label', 'Search Catalog');
      searchTrigger.innerHTML = `
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      `;
      navTopRight.appendChild(searchTrigger);
    }

    // 2. Inject overlay markup in document.body
    const overlay = document.createElement('div');
    overlay.id = 'search-overlay';
    overlay.className = 'search-overlay-tiffany';
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('role', 'dialog');
    overlay.innerHTML = `
      <div class="search-overlay-inner-tiffany">
        <div class="search-overlay-header-tiffany">
          <div class="search-input-wrap-tiffany">
            <svg class="search-input-icon-tiffany" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="search" id="search-input-field" class="search-input-field-tiffany" placeholder="Search for rings, necklaces, collections..." autocomplete="off" />
          </div>
          <button class="search-overlay-close-btn" id="search-overlay-close-btn" aria-label="Close search">&times;</button>
        </div>
        <div class="search-overlay-body-tiffany">
          <!-- Popular Searches Section -->
          <div class="popular-searches-section-tiffany" id="popular-searches">
            <h4 class="search-section-title-tiffany">Popular Searches</h4>
            <div class="popular-tags-tiffany">
              <button type="button" class="popular-tag-pill-tiffany" data-query="Emerald Rings">Emerald Rings</button>
              <button type="button" class="popular-tag-pill-tiffany" data-query="Welded Forever">Welded Forever</button>
              <button type="button" class="popular-tag-pill-tiffany" data-query="Bridal Sets">Bridal Sets</button>
              <button type="button" class="popular-tag-pill-tiffany" data-query="Gold Chains">Gold Chains</button>
              <button type="button" class="popular-tag-pill-tiffany" data-query="Custom Lockets">Custom Lockets</button>
            </div>
          </div>
          <!-- Search Results Dropdown -->
          <div class="search-results-section-tiffany" id="search-results" style="display: none;">
            <h4 class="search-section-title-tiffany">Search Results</h4>
            <div class="search-results-list-tiffany" id="search-results-list">
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // 3. Bind event listeners
    const triggerBtn = document.getElementById('search-trigger-btn-header');
    const closeBtn = document.getElementById('search-overlay-close-btn');
    const inputField = document.getElementById('search-input-field');
    const resultsContainer = document.getElementById('search-results');
    const resultsList = document.getElementById('search-results-list');
    const popularSection = document.getElementById('popular-searches');

    function openSearch() {
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        if (inputField) inputField.focus();
      }, 100);
    }

    function closeSearch() {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
      if (inputField) {
        inputField.value = '';
      }
      if (resultsContainer) resultsContainer.style.display = 'none';
      if (popularSection) popularSection.style.display = 'flex';
    }

    if (triggerBtn) {
      triggerBtn.addEventListener('click', openSearch);
    }
    if (closeBtn) {
      closeBtn.addEventListener('click', closeSearch);
    }

    // Escape Key Close
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('open')) {
        closeSearch();
      }
    });

    // Debounced search logic
    let searchDebounceTimer;
    if (inputField) {
      inputField.addEventListener('input', (e) => {
        clearTimeout(searchDebounceTimer);
        const query = e.target.value.trim().toLowerCase();
        searchDebounceTimer = setTimeout(() => {
          performQuerySearch(query);
        }, 300);
      });
    }

    // Popular pills clicks
    document.querySelectorAll('.popular-tag-pill-tiffany').forEach(pill => {
      pill.addEventListener('click', () => {
        const query = pill.getAttribute('data-query');
        if (inputField) {
          inputField.value = query;
          performQuerySearch(query.toLowerCase());
        }
      });
    });

    function performQuerySearch(query) {
      if (query.length === 0) {
        if (resultsContainer) resultsContainer.style.display = 'none';
        if (popularSection) popularSection.style.display = 'flex';
        return;
      }

      if (popularSection) popularSection.style.display = 'none';
      if (resultsContainer) resultsContainer.style.display = 'flex';

      // Match products in catalog
      const matches = searchCatalog.filter(p => {
        return (
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.keywords.some(k => k.includes(query))
        );
      });

      renderSearchResults(matches);
    }

    function renderSearchResults(matches) {
      if (!resultsList) return;
      resultsList.innerHTML = '';

      if (matches.length === 0) {
        resultsList.innerHTML = `
          <div class="search-no-results-tiffany">
            No results found. Try "rings", "gold", or "wedding".
          </div>
        `;
        return;
      }

      matches.forEach(m => {
        const item = document.createElement('a');
        item.href = m.url;
        item.className = 'search-result-item-tiffany';
        item.innerHTML = `
          <img class="search-result-thumb-tiffany" src="${m.image}" alt="${m.name}" />
          <div class="search-result-info-tiffany">
            <span class="search-result-category-tiffany">${m.category}</span>
            <span class="search-result-name-tiffany">${m.name}</span>
            <span class="search-result-price-tiffany">${m.price}</span>
          </div>
        `;
        item.addEventListener('click', () => {
          closeSearch();
        });
        resultsList.appendChild(item);
      });
    }
  }

  function initApp() {
    injectChatWidget();
    injectSearchWidget();
  }

  if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initApp);
    } else {
      initApp();
    }
  }

  console.log('%c✦ ABHUSHAN · Ahmedabad, Gujarat, India ✦', 'color:#C08B5D;font-family:Georgia,serif;font-size:14px;');

})();

