/**
 * itzmehdude - Shared Utilities
 * Theme, Language, and Security Functions
 */

// ── THEME MANAGEMENT ────────────────────────────────────────
function setTheme(theme) {
  if (!['light', 'dark'].includes(theme)) return;
  
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

function initTheme() {
  const theme = localStorage.getItem('theme') || 'dark';
  setTheme(theme);
}

// ── LANGUAGE MANAGEMENT ─────────────────────────────────────
function setLang(lang) {
  if (!['en', 'bn'].includes(lang)) return;
  
  document.documentElement.setAttribute('data-lang', lang);
  document.getElementById('btn-en')?.classList.toggle('active', lang === 'en');
  document.getElementById('btn-bn')?.classList.toggle('active', lang === 'bn');
  localStorage.setItem('lang', lang);
}

function initLang() {
  const lang = localStorage.getItem('lang') || 'en';
  setLang(lang);
}

// ── MOBILE NAVIGATION ───────────────────────────────────────
function toggleMobileNav() {
  const nav = document.getElementById('mobile-nav');
  if (nav) {
    nav.classList.toggle('mobile-open');
  }
}

// Close mobile menu when a link is clicked
document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('#mobile-nav a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      const nav = document.getElementById('mobile-nav');
      if (nav) {
        nav.classList.remove('mobile-open');
      }
    });
  });
});

// Hamburger menu functionality
      const hamburgerBtn = document.getElementById('hamburger-btn');
      const mobileNav = document.getElementById('mobile-nav');
      hamburgerBtn.addEventListener('click', function() {
        const expanded = hamburgerBtn.getAttribute('aria-expanded') === 'true';
        hamburgerBtn.setAttribute('aria-expanded', !expanded);
        mobileNav.classList.toggle('open');
        hamburgerBtn.classList.toggle('open');
      });
      // Optional: Close menu when clicking outside (mobile only)
      document.addEventListener('click', function(e) {
        if (!mobileNav.contains(e.target) && !hamburgerBtn.contains(e.target)) {
          mobileNav.classList.remove('open');
          hamburgerBtn.classList.remove('open');
          hamburgerBtn.setAttribute('aria-expanded', 'false');
        }
      });

// ── SECURITY & VALIDATION ──────────────────────────────────
/**
 * Sanitize string to prevent XSS
 */
function sanitize(text) {
  if (typeof text !== 'string') return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, char => map[char]);
}

/**
 * Validate email format
 */
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email) && email.length <= 254;
}

/**
 * Validate phone number (Bangladesh format)
 */
function validatePhone(phone) {
  // Bangladesh phone: 01XXXXXXXXX (11 digits)
  const re = /^01[0-9]{9}$/;
  return re.test(phone.replace(/[\s\-]/g, ''));
}

/**
 * Validate product quantity
 */
function validateQuantity(qty) {
  const num = parseInt(qty, 10);
  return !isNaN(num) && num > 0 && num <= 100;
}

/**
 * Safe localStorage operations
 */
const SafeStorage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Storage error reading ${key}:`, error);
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Storage error writing ${key}:`, error);
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Storage error removing ${key}:`, error);
      return false;
    }
  }
};

// ── DOM UTILITIES ───────────────────────────────────────────
/**
 * Safe element selection
 */
function getElement(id) {
  const element = document.getElementById(id);
  if (!element) console.warn(`Element not found: ${id}`);
  return element;
}

/**
 * Format currency (BDT)
 */
function formatCurrency(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) return '৳0';
  return '৳' + amount.toLocaleString('en-IN');
}

/**
 * Format date to readable string
 */
function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
}

/**
 * Debounce function for search/filter
 */
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Generate unique ID for orders
 */
function generateOrderID() {
  return 'IMD-' + Date.now().toString().slice(-6);
}

/**
 * Safe event listener helper
 */
function addListener(selector, event, handler) {
  const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
  if (element) {
    element.addEventListener(event, handler);
    return () => element.removeEventListener(event, handler);
  }
  return () => {};
}

// ── ACTIVE NAV LINK ──────────────────────────────────────────
function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav a');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    // Remove existing active class
    link.classList.remove('active');
    
    // Add active class to current page link
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

// ── INITIALIZATION ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initLang();
  setActiveNavLink();
});
