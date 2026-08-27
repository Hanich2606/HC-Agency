/* ==========================================================================
   HC Agency — Main JavaScript
   Scroll animations, navigation, FAQ, form validation
   ========================================================================== */

(function () {
  'use strict';

  // ==========================================================================
  // 1. HEADER SCROLL STATE
  // ==========================================================================

  const header = document.getElementById('header');

  function updateHeaderState() {
    if (!header) return;
    if (window.scrollY > 80) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }
  }

  window.addEventListener('scroll', updateHeaderState, { passive: true });
  updateHeaderState();


  // ==========================================================================
  // 2. MOBILE NAVIGATION
  // ==========================================================================

  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', function () {
      const isOpen = mobileNav.classList.contains('mobile-nav--open');

      if (isOpen) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });

    // Close on link click
    const mobileLinks = mobileNav.querySelectorAll('.mobile-nav__link');
    mobileLinks.forEach(function (link) {
      link.addEventListener('click', closeMobileNav);
    });

    // Close on escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileNav.classList.contains('mobile-nav--open')) {
        closeMobileNav();
      }
    });
  }

  function openMobileNav() {
    mobileNav.classList.add('mobile-nav--open');
    hamburger.classList.add('header__hamburger--active');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('nav-open');
  }

  function closeMobileNav() {
    mobileNav.classList.remove('mobile-nav--open');
    hamburger.classList.remove('header__hamburger--active');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
  }


  // ==========================================================================
  // 3. SCROLL REVEAL ANIMATIONS
  // ==========================================================================

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (!prefersReducedMotion.matches) {
    const revealElements = document.querySelectorAll('.reveal');
    const revealStaggerElements = document.querySelectorAll('.reveal-stagger');

    const revealObserverOptions = {
      root: null,
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.1
    };

    const revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal--visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, revealObserverOptions);

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });

    const staggerObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-stagger--visible');
          staggerObserver.unobserve(entry.target);
        }
      });
    }, revealObserverOptions);

    revealStaggerElements.forEach(function (el) {
      staggerObserver.observe(el);
    });
  } else {
    // If reduced motion, make everything visible immediately
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('reveal--visible');
    });
    document.querySelectorAll('.reveal-stagger').forEach(function (el) {
      el.classList.add('reveal-stagger--visible');
    });
  }


  // ==========================================================================
  // 4. FAQ ACCORDION
  // ==========================================================================

  const faqItems = document.querySelectorAll('.faq__item');

  faqItems.forEach(function (item) {
    const question = item.querySelector('.faq__question');

    if (question) {
      question.addEventListener('click', function () {
        const isOpen = item.classList.contains('faq__item--open');

        // Close all other items
        faqItems.forEach(function (otherItem) {
          if (otherItem !== item) {
            otherItem.classList.remove('faq__item--open');
            const otherBtn = otherItem.querySelector('.faq__question');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          }
        });

        // Toggle current
        if (isOpen) {
          item.classList.remove('faq__item--open');
          question.setAttribute('aria-expanded', 'false');
        } else {
          item.classList.add('faq__item--open');
          question.setAttribute('aria-expanded', 'true');
        }
      });

      // Keyboard support
      question.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          question.click();
        }
      });
    }
  });


  // ==========================================================================
  // 5. ACTIVE NAV STATE
  // ==========================================================================

  function setActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.header__nav-link');

    navLinks.forEach(function (link) {
      const href = link.getAttribute('href');
      link.classList.remove('header__nav-link--active');

      if (href === currentPage) {
        link.classList.add('header__nav-link--active');
      }
    });
  }

  setActiveNav();


  // ==========================================================================
  // 6. CONTACT FORM VALIDATION (works alongside Formspree Ajax SDK)
  // ==========================================================================

  const contactForm = document.getElementById('contact-form');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      let isValid = true;
      const requiredFields = contactForm.querySelectorAll('[required]');

      // Reset errors
      contactForm.querySelectorAll('.form-group').forEach(function (group) {
        group.classList.remove('form-group--error');
      });

      requiredFields.forEach(function (field) {
        const group = field.closest('.form-group');
        const value = field.value.trim();

        if (!value) {
          isValid = false;
          if (group) group.classList.add('form-group--error');
        }

        // Email validation
        if (field.type === 'email' && value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            isValid = false;
            if (group) group.classList.add('form-group--error');
          }
        }
      });

      // Only prevent submission if client-side validation fails.
      // If valid, let the Formspree Ajax SDK handle the submit,
      // success state, and button disable/re-enable via data-fs-* attributes.
      if (!isValid) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    });
  }


  // ==========================================================================
  // 7. SMOOTH SCROLL FOR ANCHOR LINKS
  // ==========================================================================

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerHeight = header ? header.offsetHeight : 0;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight - 20;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });


  // ==========================================================================
  // 8. YEAR UPDATE IN FOOTER
  // ==========================================================================

  const yearElements = document.querySelectorAll('[data-year]');
  const currentYear = new Date().getFullYear();

  yearElements.forEach(function (el) {
    el.textContent = currentYear;
  });

})();
