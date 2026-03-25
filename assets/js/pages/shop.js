/* SHOP PAGE JAVASCRIPT */
/* Extracted from shop.html - filtering, sorting, cart management */

// Cart management (uses SafeStorage from shared.js)
let cart = SafeStorage.get('cart', []);

/**
 * Update cart UI - shows items in sidebar and updates count
 */
function updateCartUI() {
  const count = cart.reduce((total, item) => total + item.qty, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  
  const cartCount = getElement('cart-count');
  if (cartCount) cartCount.textContent = count;
  
  const cartTotal = getElement('cart-total');
  if (cartTotal) cartTotal.textContent = '৳' + total.toLocaleString('en-IN');
  
  const cartItemsContainer = getElement('cart-items');
  if (!cartItemsContainer) return;
  
  if (!cart.length) {
    cartItemsContainer.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <p class="en">Your cart is empty</p>
        <p class="bn">আপনার কার্ট খালি</p>
      </div>
    `;
    return;
  }
  
  cartItemsContainer.innerHTML = cart.map((item, index) => `
    <div class="cart-item">
      <div class="cart-item-icon">${sanitize(item.icon)}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${sanitize(item.name)}</div>
        <div class="cart-item-game">${sanitize(item.game)}</div>
        <div class="cart-item-row">
          <span class="cart-item-price">৳${(item.price * item.qty).toLocaleString('en-IN')}</span>
          <span class="cart-item-remove" style="cursor: pointer;" data-index="${index}">✕ Remove</span>
        </div>
      </div>
    </div>
  `).join('');
  
  // Add event listeners to remove buttons
  cartItemsContainer.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.index);
      removeFromCart(index);
    });
  });
}

/**
 * Add item to cart with validation
 */
function addToCart(name, game, price, icon) {
  // Validate inputs
  if (!name || !game || price <= 0) {
    console.warn('Invalid product data:', { name, game, price });
    return;
  }
  
  // Check if item already exists
  const existing = cart.find(item => item.name === name && item.game === game);
  
  if (existing) {
    // Increment quantity, max 100
    existing.qty = Math.min(existing.qty + 1, 100);
  } else {
    // Add new item
    cart.push({
      name: name,
      game: game,
      price: price,
      icon: icon,
      qty: 1
    });
  }
  
  // Save to storage
  SafeStorage.set('cart', cart);
  updateCartUI();
  
  // Open cart sidebar
  const cartOverlay = getElement('cart-overlay');
  const cartSidebar = getElement('cart-sidebar');
  if (cartOverlay) cartOverlay.classList.add('open');
  if (cartSidebar) cartSidebar.classList.add('open');
}

/**
 * Remove item from cart by index
 */
function removeFromCart(index) {
  if (index >= 0 && index < cart.length) {
    cart.splice(index, 1);
    SafeStorage.set('cart', cart);
    updateCartUI();
  }
}

/**
 * Toggle cart sidebar visibility
 */
function toggleCart() {
  const cartOverlay = getElement('cart-overlay');
  const cartSidebar = getElement('cart-sidebar');
  
  if (cartOverlay) cartOverlay.classList.toggle('open');
  if (cartSidebar) cartSidebar.classList.toggle('open');
}

/**
 * Proceed to checkout - validate cart and redirect
 */
function proceedCheckout() {
  if (!cart.length) {
    alert('Your cart is empty! Add items before checkout.');
    return;
  }
  
  SafeStorage.set('cart', cart);
  window.location.href = 'checkout.html';
}

/**
 * Filter products by category, game, and price range
 */
function filterProducts() {
  const categoryFilter = document.querySelector('input[name="cat"]:checked');
  const gameFilter = document.querySelector('input[name="game"]:checked');
  const priceFilter = document.querySelector('input[name="price"]:checked');
  
  const category = categoryFilter ? categoryFilter.value : 'all';
  const game = gameFilter ? gameFilter.value : 'all';
  const price = priceFilter ? priceFilter.value : 'all';
  
  let visibleCount = 0;
  
  document.querySelectorAll('.product-card').forEach(card => {
    const cardCategory = card.dataset.category || '';
    const cardGame = card.dataset.game || '';
    const cardPrice = parseInt(card.dataset.price) || 0;
    
    let shouldShow = true;
    
    // Category filter
    if (category !== 'all' && cardCategory !== category) {
      shouldShow = false;
    }
    
    // Game filter
    if (game !== 'all' && cardGame !== game) {
      shouldShow = false;
    }
    
    // Price filter
    if (price === 'low' && cardPrice >= 500) {
      shouldShow = false;
    } else if (price === 'mid' && (cardPrice < 500 || cardPrice > 2000)) {
      shouldShow = false;
    } else if (price === 'high' && cardPrice <= 2000) {
      shouldShow = false;
    }
    
    card.style.display = shouldShow ? '' : 'none';
    if (shouldShow) visibleCount++;
  });
  
  // Update product count display
  const enCount = getElement('product-count-en');
  const bnCount = getElement('product-count-bn');
  if (enCount) enCount.textContent = visibleCount;
  if (bnCount) bnCount.textContent = visibleCount;
}

/**
 * Sort products by different criteria
 */
function sortProducts(sortMethod) {
  ['games-grid', 'subs-grid'].forEach(gridId => {
    const grid = getElement(gridId);
    if (!grid) return;
    
    const cards = Array.from(grid.querySelectorAll('.product-card'));
    
    cards.sort((cardA, cardB) => {
      const priceA = parseInt(cardA.dataset.price) || 0;
      const priceB = parseInt(cardB.dataset.price) || 0;
      
      if (sortMethod === 'price-asc') {
        return priceA - priceB;
      } else if (sortMethod === 'price-desc') {
        return priceB - priceA;
      }
      return 0; // default - no sort
    });
    
    cards.forEach(card => grid.appendChild(card));
  });
}

/**
 * Scroll to section and update tab state
 */
function scrollToSection(sectionId) {
  const section = getElement(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  
  const gamesTab = getElement('tab-games');
  const subsTab = getElement('tab-subs');
  
  if (sectionId === 'games') {
    if (gamesTab) gamesTab.classList.add('active');
    if (subsTab) subsTab.classList.remove('active');
  } else if (sectionId === 'subscriptions') {
    if (gamesTab) gamesTab.classList.remove('active');
    if (subsTab) subsTab.classList.add('active');
  }
}

/**
 * Show error notification with styled toast
 */
function showError(message) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    background: #ff4444;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-weight: 600;
    z-index: 999;
    animation: slideIn 0.3s ease;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Show success notification with styled toast
 */
function showNotification(message) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: var(--accent);
    color: #000;
    padding: 12px 20px;
    border-radius: 8px;
    font-weight: 600;
    z-index: 999;
    animation: slideIn 0.3s ease;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

/**
 * Initialize shop page on load
 */
function initShopPage() {
  // Initialize theme and language from shared.js
  initTheme();
  initLang();
  
  // Update cart UI
  updateCartUI();
  
  // Add event listeners to filter inputs
  document.querySelectorAll('input[name="cat"], input[name="game"], input[name="price"]').forEach(input => {
    input.addEventListener('change', filterProducts);
  });
  
  // Add event listener to sort select
  const sortSelect = getElement('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      sortProducts(e.target.value);
    });
  }
  
  // Add event listeners to section tabs
  document.querySelectorAll('.section-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      const sectionId = e.currentTarget.getAttribute('data-section');
      if (sectionId) scrollToSection(sectionId);
    });
  });
  
  // Check if hash indicates subscriptions section
  if (window.location.hash === '#subscriptions') {
    setTimeout(() => scrollToSection('subscriptions'), 300);
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initShopPage);
