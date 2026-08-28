/* ==========================================================================
   HC Agency — Dynamic Component Loader & Data Synchronization
   ==========================================================================
   
   This script automatically injects and synchronizes the unified Header,
   Footer, Contact details, and Project links across ALL pages from SITE_CONFIG.
   ========================================================================== */

(function () {
  'use strict';

  function initComponents() {
    const config = window.SITE_CONFIG || {};

    // Get current filename for active state highlighting
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';

    // 1. RENDER UNIFIED HEADER
    const headerEl = document.getElementById('header') || document.querySelector('.header');
    if (headerEl) {
      const navItemsHtml = (config.navigation || []).map(item => {
        const isActive = item.url === currentPath;
        return `<li><a href="${item.url}" class="header__nav-link ${isActive ? 'header__nav-link--active' : ''}">${item.name}</a></li>`;
      }).join('');

      headerEl.innerHTML = `
        <div class="container header__inner">
          <a href="index.html" class="header__logo" aria-label="${config.brandName || 'HC Agency'} - Home">
            <img src="logo/Logo blanc.png" alt="${config.brandName || 'HC Agency'}" class="header__logo-img header__logo-img--default">
            <img src="logo/Logo bleu dégradé.png" alt="${config.brandName || 'HC Agency'}" class="header__logo-img header__logo-img--hover">
          </a>

          <nav class="header__nav" aria-label="Main navigation">
            <div class="header__nav-pill">
              <ul class="header__nav-list" role="list">
                ${navItemsHtml}
              </ul>
            </div>
          </nav>

          <a href="${config.contact?.consultationUrl || 'contact.html'}" class="header__cta">Book a Consultation</a>

          <button class="header__hamburger" id="hamburger" aria-label="Toggle navigation menu" aria-expanded="false">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      `;
    }

    // 2. RENDER UNIFIED MOBILE NAV OVERLAY
    const mobileNavEl = document.getElementById('mobile-nav') || document.querySelector('.mobile-nav');
    if (mobileNavEl) {
      const mobileNavItemsHtml = (config.navigation || []).map(item => {
        return `<li class="mobile-nav__item"><a href="${item.url}" class="mobile-nav__link">${item.name}</a></li>`;
      }).join('');

      mobileNavEl.innerHTML = `
        <nav>
          <ul class="mobile-nav__list" role="list">
            ${mobileNavItemsHtml}
          </ul>
          <div class="mobile-nav__separator"></div>
          <div class="mobile-nav__cta">
            <a href="${config.contact?.consultationUrl || 'contact.html'}" class="btn btn--primary btn--large">Book a Free Consultation</a>
          </div>
        </nav>
      `;
    }

    // 3. RENDER UNIFIED FOOTER
    const footerEl = document.querySelector('.footer');
    if (footerEl) {
      const footerNavHtml = (config.navigation || []).map(item => {
        return `<li><a href="${item.url}" class="footer__link">${item.name}</a></li>`;
      }).join('');

      const footerServicesHtml = (config.services || []).map(item => {
        return `<li><a href="${item.url}" class="footer__link">${item.name}</a></li>`;
      }).join('');

      const footerLegalHtml = (config.legal || []).map(item => {
        return `<a href="${item.url}">${item.name}</a>`;
      }).join('');

      footerEl.innerHTML = `
        <div class="container">
          <div class="footer__grid">
            <div class="footer__brand">
              <a href="index.html" class="footer__logo" aria-label="${config.brandName || 'HC Agency'} - Home">
                <img src="logo/Logo blanc.png" alt="${config.brandName || 'HC Agency'}" class="footer__logo-img">
              </a>
              <p class="footer__tagline">${config.tagline || ''}</p>
              <div class="social-links" style="margin-top: var(--space-md);">
                <a href="${config.socials?.instagram || '#'}" class="social-link" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
                <a href="${config.socials?.linkedin || '#'}" class="social-link" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </a>
                <a href="${config.socials?.behance || '#'}" class="social-link" aria-label="Behance" target="_blank" rel="noopener noreferrer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14h-8.027c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h5.025c-.154-1.545-1.085-2.328-2.476-2.328-1.459 0-2.354.87-2.549 2.328zm-8.9 5.545c-3.667 0-5.14-2.024-5.14-4.638 0-2.218 1.263-3.636 2.88-4.16v-.046c-1.162-.474-2.2-1.592-2.2-3.28 0-2.487 1.876-4.421 4.862-4.421h6.338v16.545h-6.74zm.452-7.364c-1.606 0-2.592.924-2.592 2.378 0 1.563 1.1 2.426 2.674 2.426h3.343v-4.804h-3.425zm-.138-6.621c-1.37 0-2.242.82-2.242 2.124 0 1.39.906 2.175 2.328 2.175h3.195v-4.299h-3.281z"/></svg>
                </a>
                <a href="${config.socials?.github || '#'}" class="social-link" aria-label="GitHub" target="_blank" rel="noopener noreferrer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                </a>
              </div>
            </div>
            <div>
              <h3 class="footer__heading">Navigation</h3>
              <ul class="footer__links" role="list">
                ${footerNavHtml}
              </ul>
            </div>
            <div>
              <h3 class="footer__heading">Services</h3>
              <ul class="footer__links" role="list">
                ${footerServicesHtml}
              </ul>
            </div>
            <div>
              <h3 class="footer__heading">Contact</h3>
              <ul class="footer__links" role="list">
                <li><a href="mailto:${config.contact?.email || ''}" class="footer__link" data-contact="email">${config.contact?.email || ''}</a></li>
                <li><a href="tel:${config.contact?.phoneRaw || ''}" class="footer__link" data-contact="phone">${config.contact?.phone || ''}</a></li>
                <li><span class="footer__link" data-contact="location">${config.contact?.location || ''}</span></li>
              </ul>
            </div>
          </div>
          <div class="footer__bottom">
            <p class="footer__copyright">&copy; ${config.copyrightYear || 2026} ${config.brandName || 'HC Agency'}. All rights reserved.</p>
            <div class="footer__legal">
              ${footerLegalHtml}
            </div>
          </div>
        </div>
      `;
    }

    // 4. SYNCHRONIZE DATA ATTRIBUTES ACROSS THE PAGE
    // Sync contact elements
    document.querySelectorAll('[data-contact="email"]').forEach(el => {
      if (config.contact?.email) {
        if (el.tagName === 'A') el.href = `mailto:${config.contact.email}`;
        el.textContent = config.contact.email;
      }
    });

    document.querySelectorAll('[data-contact="phone"]').forEach(el => {
      if (config.contact?.phone) {
        if (el.tagName === 'A') el.href = `tel:${config.contact.phoneRaw || config.contact.phone}`;
        el.textContent = config.contact.phone;
      }
    });

    document.querySelectorAll('[data-contact="whatsapp"]').forEach(el => {
      if (config.contact?.whatsapp) {
        if (el.tagName === 'A') el.href = config.contact.whatsappUrl || `https://wa.me/${config.contact.phoneRaw || ''}`;
        el.textContent = config.contact.whatsapp;
      }
    });

    document.querySelectorAll('[data-contact="location"]').forEach(el => {
      if (config.contact?.location) el.textContent = config.contact.location;
    });

    // Sync project URLs (for August, Lumière, Nova buttons & links)
    document.querySelectorAll('[data-project-url]').forEach(el => {
      const key = el.getAttribute('data-project-url');
      if (key && config.projectUrls && config.projectUrls[key]) {
        el.href = config.projectUrls[key];
      }
    });

    // 5. INITIALIZE 1000% BETTER CHOICE SELECTORS
    initCustomSelects();
  }

  // CHOICE UI/UX ENHANCER MODULE (Clean & Home-Matched Style)
  function initCustomSelects() {
    const selects = document.querySelectorAll('select.form-group__select, select[data-custom-select]');
    if (!selects.length) return;

    // Vector SVG icons matching index.html Home page industry icons
    const CHOICE_ICONS = {
      '': `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`,
      'restaurant': `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>`,
      'dental': `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>`,
      'gym': `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20V10"></path><path d="M12 20V4"></path><path d="M6 20v-6"></path></svg>`,
      'law': `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`,
      'hotel': `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
      'beauty': `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
      'realestate': `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>`,
      'other': `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>`
    };

    selects.forEach(select => {
      if (select.dataset.customized === 'true') return;
      select.dataset.customized = 'true';

      const options = Array.from(select.options);
      if (!options.length) return;

      // Visually hide native select while preserving DOM & Formspree validity
      select.classList.add('visually-hidden-select');
      select.setAttribute('tabindex', '-1');

      // Create Custom Select Dropdown
      const customSelect = document.createElement('div');
      customSelect.className = 'custom-select';

      const selectedOpt = options.find(o => o.value === select.value) || options[0];
      const selectedIcon = CHOICE_ICONS[selectedOpt.value] || CHOICE_ICONS['other'];
      const isPlaceholder = selectedOpt.value === '';

      // Trigger Button
      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'custom-select__trigger';
      trigger.setAttribute('aria-haspopup', 'listbox');
      trigger.setAttribute('aria-expanded', 'false');

      trigger.innerHTML = `
        <div class="custom-select__value">
          <span class="custom-select__icon-box">${selectedIcon}</span>
          <span class="${isPlaceholder ? 'custom-select__placeholder' : ''}">${selectedOpt.text}</span>
        </div>
        <svg class="custom-select__chevron" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      `;

      // Dropdown Menu Panel
      const dropdown = document.createElement('div');
      dropdown.className = 'custom-select__dropdown';

      const optionsList = document.createElement('div');
      optionsList.className = 'custom-select__options';
      optionsList.setAttribute('role', 'listbox');

      options.forEach(opt => {
        // Do not render empty placeholder options as selectable choices in the dropdown list
        if (opt.value === '' || opt.disabled) return;

        const val = opt.value;
        const label = opt.text;
        const iconSvg = CHOICE_ICONS[val] || CHOICE_ICONS['other'];
        const isSelected = select.value === val;

        const optionEl = document.createElement('div');
        optionEl.className = `custom-select__option ${isSelected ? 'custom-select__option--selected' : ''}`;
        optionEl.setAttribute('role', 'option');
        optionEl.setAttribute('aria-selected', isSelected ? 'true' : 'false');
        optionEl.setAttribute('data-value', val);

        optionEl.innerHTML = `
          <div class="custom-select__option-main">
            <span class="custom-select__icon-box">${iconSvg}</span>
            <span class="custom-select__option-title">${label}</span>
          </div>
          <svg class="custom-select__option-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        `;

        optionEl.addEventListener('click', () => {
          selectValue(val);
          closeDropdown();
        });

        optionsList.appendChild(optionEl);
      });

      dropdown.appendChild(optionsList);
      customSelect.appendChild(trigger);
      customSelect.appendChild(dropdown);

      // Insert customSelect right where original select was
      select.parentNode.insertBefore(customSelect, select);
      customSelect.appendChild(select);

      function selectValue(val) {
        select.value = val;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        select.dispatchEvent(new Event('input', { bubbles: true }));

        const formGroup = select.closest('.form-group');
        if (formGroup && val !== '') {
          formGroup.classList.remove('form-group--error');
        }

        const currentOpt = options.find(o => o.value === val) || options[0];
        const iconSvg = CHOICE_ICONS[currentOpt.value] || CHOICE_ICONS['other'];
        const isPlc = currentOpt.value === '';

        const valSpan = trigger.querySelector('.custom-select__value');
        valSpan.innerHTML = `
          <span class="custom-select__icon-box">${iconSvg}</span>
          <span class="${isPlc ? 'custom-select__placeholder' : ''}">${currentOpt.text}</span>
        `;

        optionsList.querySelectorAll('.custom-select__option').forEach(op => {
          if (op.getAttribute('data-value') === val) {
            op.classList.add('custom-select__option--selected');
            op.setAttribute('aria-selected', 'true');
          } else {
            op.classList.remove('custom-select__option--selected');
            op.setAttribute('aria-selected', 'false');
          }
        });
      }

      function toggleDropdown() {
        if (customSelect.classList.contains('custom-select--open')) {
          closeDropdown();
        } else {
          openDropdown();
        }
      }

      function openDropdown() {
        document.querySelectorAll('.custom-select--open').forEach(el => {
          if (el !== customSelect) el.classList.remove('custom-select--open');
        });
        customSelect.classList.add('custom-select--open');
        trigger.setAttribute('aria-expanded', 'true');
      }

      function closeDropdown() {
        customSelect.classList.remove('custom-select--open');
        trigger.setAttribute('aria-expanded', 'false');
      }

      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        toggleDropdown();
      });

      trigger.addEventListener('keydown', (e) => {
        if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
          e.preventDefault();
          if (!customSelect.classList.contains('custom-select--open')) {
            openDropdown();
          }
        }
      });

      customSelect.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          closeDropdown();
          trigger.focus();
        }
      });

      document.addEventListener('click', (e) => {
        if (!customSelect.contains(e.target)) {
          closeDropdown();
        }
      });

      select.addEventListener('change', () => {
        selectValue(select.value);
      });
    });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initComponents);
  } else {
    initComponents();
  }
})();

