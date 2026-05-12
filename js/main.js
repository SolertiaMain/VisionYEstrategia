/**
 * VISIÓN Y ESTRATEGIA — CONSULTORÍA
 * main.js | Funcionalidad principal
 */
'use strict';

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

/* PAGE LOADER */
function initLoader() {
  const loader = $('.page-loader');
  if (!loader) return;
  document.body.style.overflow = 'hidden';
  window.addEventListener('load', () => {
    setTimeout(() => { loader.classList.add('hidden'); document.body.style.overflow = ''; }, 1400);
  });
}

/* NAVBAR */
function initNavbar() {
  const navbar = $('.navbar');
  const hamburger = $('.hamburger');
  const mobileMenu = $('.mobile-menu');
  if (!navbar) return;

  function updateNav() {
    if (window.scrollY > 60) { navbar.classList.add('scrolled'); navbar.classList.remove('transparent'); }
    else { navbar.classList.remove('scrolled'); navbar.classList.add('transparent'); }
  }
  updateNav();
  window.addEventListener('scroll', updateNav, { passive: true });

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      hamburger.setAttribute('aria-expanded', open);
    });
    $$('.mobile-link, .mobile-sub-link', mobileMenu).forEach(l => {
      l.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  const path = window.location.pathname;
  $$('.nav-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href !== 'index.html' && path.includes(href)) link.classList.add('active');
  });
}

/* SMOOTH SCROLL */
function initSmoothScroll() {
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = $(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });
}

/* SCROLL REVEAL */
function initScrollReveal() {
  const els = $$([ '.reveal', '.reveal-left', '.reveal-right', '.reveal-scale' ].join(','));
  if (!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => obs.observe(el));
}

/* COUNTER ANIMATION */
function initCounters() {
  const counters = $$('[data-count]');
  if (!counters.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      const duration = 1800;
      const start = performance.now();
      function update(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target).toLocaleString('es-MX') + suffix;
        if (progress < 1) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => obs.observe(c));
}

/* FAQ ACCORDION */
function initFAQ() {
  $$('.faq-item').forEach(item => {
    const q = $('.faq-question', item);
    if (!q) return;
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      $$('.faq-item.open').forEach(o => o.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
}

/* FORM VALIDATION */
function initForms() {
  $$('.contact-form-el').forEach(f => f.addEventListener('submit', handleSubmit));
  $$('.form-field input, .form-field textarea').forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.closest('.form-field')?.classList.contains('error')) validateField(field);
    });
  });
}

function validateField(field) {
  const parent = field.closest('.form-field');
  if (!parent) return true;
  let valid = true;
  if (field.hasAttribute('required') && !field.value.trim()) valid = false;
  else if (field.type === 'email' && field.value.trim()) valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
  else if (field.type === 'tel' && field.value.trim()) valid = /^[\d\s\+\-\(\)]{7,}$/.test(field.value);
  parent.classList.toggle('error', !valid);
  return valid;
}

function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  let allValid = true;
  $$('input[required], textarea[required]', form).forEach(f => { if (!validateField(f)) allValid = false; });
  if (!allValid) return;
  const btn = $('[type="submit"]', form);
  const orig = btn.textContent;
  btn.textContent = 'Enviando…'; btn.disabled = true;
  setTimeout(() => {
    form.style.display = 'none';
    form.closest('.contact-form-card')?.querySelector('.form-success')?.classList.add('visible');
    btn.textContent = orig; btn.disabled = false;
  }, 1800);
}

/* PARTICLES */
function initParticles() {
  const c = $('.hero-particles');
  if (!c) return;
  const count = window.matchMedia('(max-width:768px)').matches ? 6 : 14;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');
    const size = Math.random() * 80 + 20;
    p.style.cssText = `width:${size}px;height:${size}px;left:${Math.random()*100}%;animation-duration:${Math.random()*15+12}s;animation-delay:${Math.random()*10}s;opacity:${Math.random()*0.25+0.05}`;
    c.appendChild(p);
  }
}

/* TABS */
function initTabs() {
  $$('.tab-group').forEach(group => {
    const tabs = $$('.tab-btn', group);
    const panels = $$('.tab-panel', group);
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        panels[i]?.classList.add('active');
      });
    });
  });
}

/* BACK TO TOP */
function initBackToTop() {
  const btn = $('#back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 600), { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* INIT */
document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initNavbar();
  initSmoothScroll();
  initScrollReveal();
  initCounters();
  initFAQ();
  initForms();
  initParticles();
  initTabs();
  initBackToTop();
});
