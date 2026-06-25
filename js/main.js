/**
 * VISIÓN Y ESTRATEGIA — CONSULTORÍA
 * main.js | Funcionalidad principal accesible WCAG 2.2 AA
 */
'use strict';

const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

/* PAGE LOADER */
function initLoader() {
  const loader = $('.page-loader');
  if (!loader) return;

  document.body.style.overflow = 'hidden';

  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.style.overflow = '';
    }, 700);
  });
}

/* SKIP LINK */
function initSkipLink() {
  const skipLink = $('.skip-link');
  const main = $('#contenido-principal');

  if (!skipLink || !main) return;

  skipLink.addEventListener('click', () => {
    setTimeout(() => {
      main.focus({ preventScroll: true });
    }, 0);
  });
}

/* NAVBAR */
function initNavbar() {
  const navbar = $('.navbar');
  const hamburger = $('.hamburger');
  const mobileMenu = $('#mobile-menu');
  const servicesItem = $('.has-dropdown');
  const servicesTrigger = $('.nav-services-trigger');
  const servicesDropdown = $('#servicios-submenu');

  if (!navbar) return;

  function updateNav() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
      navbar.classList.remove('transparent');
    } else {
      navbar.classList.add('scrolled');
      navbar.classList.remove('transparent');
    }
  }

  updateNav();
  window.addEventListener('scroll', updateNav, { passive: true });

  setActiveNavigation();

  if (servicesItem && servicesTrigger && servicesDropdown) {
    let skipNextServicesFocusOpen = false;
    let dropdownCloseTimer = null;

    const openDropdown = () => {
      if (skipNextServicesFocusOpen) {
        skipNextServicesFocusOpen = false;
        return;
      }

      window.clearTimeout(dropdownCloseTimer);
      servicesItem.classList.remove('dismissed');
      servicesItem.classList.add('open');
      servicesTrigger.setAttribute('aria-expanded', 'true');
    };

    const closeDropdown = () => {
      window.clearTimeout(dropdownCloseTimer);
      servicesItem.classList.remove('open');
      servicesTrigger.setAttribute('aria-expanded', 'false');
    };

    const dismissDropdown = ({ restoreFocus = false } = {}) => {
      closeDropdown();
      servicesItem.classList.add('dismissed');
      skipNextServicesFocusOpen = restoreFocus;

      if (restoreFocus) {
        servicesTrigger.focus();
      }
    };

    const closeDropdownSoon = () => {
      window.clearTimeout(dropdownCloseTimer);
      dropdownCloseTimer = window.setTimeout(closeDropdown, 300);
    };

    servicesItem.addEventListener('mouseenter', openDropdown);
    servicesItem.addEventListener('mouseleave', closeDropdownSoon);
    servicesDropdown.addEventListener('mouseenter', openDropdown);
    servicesDropdown.addEventListener('mouseleave', closeDropdownSoon);
    servicesItem.addEventListener('focusin', openDropdown);

    servicesItem.addEventListener('focusout', (event) => {
      if (!servicesItem.contains(event.relatedTarget)) {
        closeDropdown();
      }
    });

    servicesItem.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        dismissDropdown({ restoreFocus: true });
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && servicesTrigger.getAttribute('aria-expanded') === 'true') {
        dismissDropdown();
      }
    });
  }

  if (hamburger && mobileMenu) {
    const focusableSelector = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(',');

    let lastFocusedElement = null;

    const getFocusableMenuItems = () => $$(focusableSelector, mobileMenu)
      .filter((element) => element.offsetParent !== null);

    const openMobileMenu = () => {
      lastFocusedElement = document.activeElement;

      hamburger.classList.add('open');
      hamburger.setAttribute('aria-expanded', 'true');
      hamburger.setAttribute('aria-label', 'Cerrar menú');

      mobileMenu.hidden = false;
      mobileMenu.setAttribute('aria-hidden', 'false');

      requestAnimationFrame(() => {
        mobileMenu.classList.add('open');
      });

      document.body.style.overflow = 'hidden';

      const focusableItems = getFocusableMenuItems();
      if (focusableItems.length) {
        focusableItems[0].focus();
      }
    };

    const closeMobileMenu = () => {
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Abrir menú');

      mobileMenu.classList.remove('open');
      mobileMenu.setAttribute('aria-hidden', 'true');

      setTimeout(() => {
        mobileMenu.hidden = true;
      }, 320);

      document.body.style.overflow = '';

      if (lastFocusedElement) {
        lastFocusedElement.focus();
      } else {
        hamburger.focus();
      }
    };

    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
      isOpen ? closeMobileMenu() : openMobileMenu();
    });

    document.addEventListener('click', (event) => {
      const isOpen = hamburger.getAttribute('aria-expanded') === 'true';

      if (!isOpen) return;

      const clickedInsideMenu = mobileMenu.contains(event.target);
      const clickedHamburger = hamburger.contains(event.target);

      if (!clickedInsideMenu && !clickedHamburger) {
        event.preventDefault();
        event.stopPropagation();
        closeMobileMenu();
      }
    }, true);

    mobileMenu.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeMobileMenu();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusableItems = getFocusableMenuItems();
      if (!focusableItems.length) return;

      const firstItem = focusableItems[0];
      const lastItem = focusableItems[focusableItems.length - 1];

      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault();
        lastItem.focus();
      }

      if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    });

    $$('.mobile-link, .mobile-sub-link, .mobile-cta', mobileMenu).forEach((link) => {
      link.addEventListener('click', closeMobileMenu);
    });
  }
}

function setActiveNavigation() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  $$('.nav-link, .mobile-link').forEach((link) => {
    const href = link.getAttribute('href') || '';
    const linkPage = href.split('#')[0] || 'index.html';
    const isActive = linkPage === currentPage;

    link.classList.toggle('active', isActive);

    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

/* SMOOTH SCROLL */
function initSmoothScroll() {
  $$('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const target = $(targetId);
      if (!target) return;

      event.preventDefault();

      const offset = 96;
      const y = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({ top: y, behavior: 'smooth' });

      if (target.hasAttribute('tabindex')) {
        setTimeout(() => target.focus({ preventScroll: true }), 250);
      }
    });
  });
}

/* SCROLL REVEAL */
function initScrollReveal() {
  const elements = $$('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  if (!elements.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    elements.forEach((element) => element.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach((element) => observer.observe(element));
}

/* COUNTER ANIMATION */
function initCounters() {
  const counters = $('[data-count]') ? $$('[data-count]') : [];
  if (!counters.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    counters.forEach((counter) => {
      counter.textContent = `${counter.dataset.count}${counter.dataset.suffix || ''}`;
    });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const element = entry.target;
      const target = parseInt(element.dataset.count, 10);
      const suffix = element.dataset.suffix || '';
      const duration = 1400;
      const start = performance.now();

      function update(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);

        element.textContent = Math.floor(eased * target).toLocaleString('es-MX') + suffix;

        if (progress < 1) {
          requestAnimationFrame(update);
        }
      }

      requestAnimationFrame(update);
      observer.unobserve(element);
    });
  }, { threshold: 0.5 });

  counters.forEach((counter) => observer.observe(counter));
}

/* FAQ ACCORDION */
function initFAQ() {
  $$('.faq-item').forEach((item) => {
    const button = $('.faq-question', item);
    if (!button) return;

    const panelId = button.getAttribute('aria-controls');
    const panel = panelId ? document.getElementById(panelId) : null;
    const toggle = $('.faq-toggle', button);

    if (!panel) return;

    function closeItem(faqItem) {
      const faqButton = $('.faq-question', faqItem);
      if (!faqButton) return;

      const faqPanel = document.getElementById(faqButton.getAttribute('aria-controls'));
      const faqToggle = $('.faq-toggle', faqButton);

      faqButton.setAttribute('aria-expanded', 'false');
      faqItem.classList.remove('open');

      if (faqPanel) faqPanel.hidden = true;
      if (faqToggle) faqToggle.textContent = '+';
    }

    function toggleItem() {
      const isOpen = button.getAttribute('aria-expanded') === 'true';

      $$('.faq-item').forEach((otherItem) => {
        if (otherItem !== item) closeItem(otherItem);
      });

      button.setAttribute('aria-expanded', String(!isOpen));
      panel.hidden = isOpen;
      item.classList.toggle('open', !isOpen);

      if (toggle) {
        toggle.textContent = isOpen ? '+' : '−';
      }
    }

    button.addEventListener('click', toggleItem);

    button.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleItem();
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        closeItem(item);
        button.focus();
      }
    });
  });
}

/* FORM VALIDATION */
function initForms() {
  $$('.contact-form-el').forEach((form) => {
    form.addEventListener('submit', handleSubmit);

    $$('input, textarea, select', form).forEach((field) => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        if (field.getAttribute('aria-invalid') === 'true') {
          validateField(field);
        }
      });
      field.addEventListener('change', () => validateField(field));
    });
  });
}

function getErrorElement(field) {
  const parent = field.closest('.form-field');
  if (!parent) return null;
  return $('.form-error', parent);
}

function validateField(field) {
  const parent = field.closest('.form-field');
  const error = getErrorElement(field);

  if (!parent) return true;

  let errorMessage = '';

  const value = field.value.trim();

  if (field.hasAttribute('required') && !value) {
    errorMessage = error?.textContent.trim() || 'Este campo es obligatorio.';
  } else if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    errorMessage = 'Escribe un correo válido. Ejemplo: nombre@dominio.com.';
  } else if (field.type === 'tel' && value && !/^[\d\s+\-()]{7,}$/.test(value)) {
    errorMessage = 'Escribe un teléfono válido, por ejemplo: 722-000-0000.';
  }

  const isValid = !errorMessage;

  parent.classList.toggle('error', !isValid);
  field.setAttribute('aria-invalid', String(!isValid));

  if (error) {
    if (isValid) {
      error.hidden = true;
    } else {
      error.textContent = errorMessage;
      error.hidden = false;
    }
  }

  return isValid;
}

function setFormStatus(form, message) {
  const status = $('#form-status', form);
  if (status) status.textContent = message;
}

function handleSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const fields = $$('input, textarea, select', form).filter((field) => {
    return !field.disabled && field.type !== 'hidden';
  });

  const invalidField = fields.find((field) => !validateField(field));

  if (invalidField) {
    setFormStatus(form, 'Hay errores en el formulario. Revisa el campo señalado.');
    invalidField.focus();
    return;
  }

  const button = $('[type="submit"]', form);
  const buttonText = $('.btn-text', button) || button;
  const originalText = buttonText.textContent;

  button.disabled = true;
  button.setAttribute('aria-busy', 'true');
  buttonText.textContent = 'Enviando…';
  setFormStatus(form, 'Enviando solicitud.');

  setTimeout(() => {
    const card = form.closest('.contact-form-card');
    const success = card ? $('#form-success', card) : null;

    form.hidden = true;

    if (success) {
      success.hidden = false;
      success.classList.add('visible');
      success.focus();
    }

    button.disabled = false;
    button.removeAttribute('aria-busy');
    buttonText.textContent = originalText;
  }, 900);
}

/* PARTICLES */
function initParticles() {
  const container = $('.hero-particles');
  if (!container) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const count = window.matchMedia('(max-width:768px)').matches ? 6 : 14;

  for (let i = 0; i < count; i += 1) {
    const particle = document.createElement('div');
    particle.classList.add('particle');

    const size = Math.random() * 80 + 20;

    particle.style.cssText = `
      width:${size}px;
      height:${size}px;
      left:${Math.random() * 100}%;
      animation-duration:${Math.random() * 15 + 12}s;
      animation-delay:${Math.random() * 10}s;
      opacity:${Math.random() * 0.25 + 0.05};
    `;

    container.appendChild(particle);
  }
}

/* TABS */
function initTabs() {
  $$('.tab-group').forEach((group) => {
    const tabs = $$('.tab-btn', group);
    const panels = $$('.tab-panel', group);

    if (!tabs.length || !panels.length) return;

    function activateTab(index, moveFocus = true) {
      tabs.forEach((tab, i) => {
        const isActive = i === index;

        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', String(isActive));
        tab.setAttribute('tabindex', isActive ? '0' : '-1');

        const panelId = tab.getAttribute('aria-controls');
        const panel = panelId ? document.getElementById(panelId) : panels[i];

        if (panel) {
          panel.classList.toggle('active', isActive);
          panel.hidden = !isActive;
        }
      });

      if (moveFocus) {
        tabs[index].focus();
      }
    }

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activateTab(index, false));

      tab.addEventListener('keydown', (event) => {
        const currentIndex = tabs.indexOf(document.activeElement);
        let nextIndex = currentIndex;

        if (event.key === 'ArrowRight') {
          nextIndex = (currentIndex + 1) % tabs.length;
        } else if (event.key === 'ArrowLeft') {
          nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        } else if (event.key === 'Home') {
          nextIndex = 0;
        } else if (event.key === 'End') {
          nextIndex = tabs.length - 1;
        } else if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          activateTab(index, false);
          return;
        } else {
          return;
        }

        event.preventDefault();
        activateTab(nextIndex);
      });
    });
  });
}

/* BACK TO TOP */
function initBackToTop() {
  const button = $('#back-to-top');
  if (!button) return;

  window.addEventListener('scroll', () => {
    button.classList.toggle('visible', window.scrollY > 600);
  }, { passive: true });

  button.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* INIT */
document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initSkipLink();
  initNavbar();
  initSmoothScroll();
  initScrollReveal();
  initCounters();
  initFAQ();
  initForms();
  // initParticles();
  initTabs();
  initBackToTop();
});
