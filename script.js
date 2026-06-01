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
    mobileMenu.classList.add('open');
    mobileMenu.style.display = 'flex';
    overlayBg.classList.add('active');
    header.classList.add('menu-open');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    hamburger.classList.remove('open');
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

  console.log('%c✦ ABHUSHAN · Ahmedabad, Gujarat, India ✦', 'color:#C08B5D;font-family:Georgia,serif;font-size:14px;');

})();
