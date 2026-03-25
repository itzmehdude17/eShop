/**
 * itzmehdude - Checkout Page Script
 * Handles order form submission, validation, and cart management
 */

let cart = [];
let currentOrderId = '';
let currentOrderTotal = 0;
let lastSubmitTime = 0;

// ── INITIALIZATION ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  console.log('=== CHECKOUT PAGE LOADING ===');
  console.log('✓ DOM loaded, initializing checkout...');
  
  loadCart();
  console.log('✓ Cart loaded:', cart);
  
  buildOrderSummary();
  console.log('✓ Order summary built');
  
  toggleOrderType();
  console.log('✓ Order type toggle initialized');
  
  updateCartCount();
  console.log('✓ Cart count updated');
  
  updateItemFields();
  console.log('✓ Item fields auto-filled');
  
  // Add event listeners to order type radio buttons
  document.querySelectorAll('input[name="order_type"]').forEach(radio => {
    radio.addEventListener('change', updateItemFields);
  });
  
  // Add phone number formatting
  const phoneInput = document.getElementById('cphone');
  if (phoneInput) {
    phoneInput.addEventListener('input', formatPhoneInput);
  }
  
  // Verify key elements exist
  const submitBtn = document.querySelector('.submit-btn');
  const modal = document.getElementById('success-modal');
  console.log('Submit button found:', !!submitBtn);
  console.log('Success modal found:', !!modal);
  
  if (!submitBtn) console.error('❌ CRITICAL: Submit button not found!');
  if (!modal) console.error('❌ CRITICAL: Success modal not found!');
  
  console.log('=== CHECKOUT PAGE READY ===');
});

// ── CART MANAGEMENT ────────────────────────────────────────
function loadCart() {
  cart = SafeStorage.get('cart', []);
  
  // Validate cart data integrity
  if (!Array.isArray(cart)) {
    cart = [];
    SafeStorage.set('cart', cart);
  }
  
  // Validate each item
  cart = cart.filter(item => {
    return item.name && item.game && typeof item.price === 'number' && item.price > 0 && item.qty > 0;
  });
}

function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const elements = document.querySelectorAll('#cart-count');
  elements.forEach(el => el.textContent = count);
}

// ── BUILD ORDER SUMMARY ────────────────────────────────────
function buildOrderSummary() {
  const itemsContainer = document.getElementById('summary-items');
  const totalsContainer = document.getElementById('summary-totals');
  
  if (!cart.length) {
    itemsContainer.innerHTML = `
      <div class="summary-empty en">No items. <a href="shop.html" style="color:var(--accent)">Go to shop</a></div>
      <div class="summary-empty bn">কার্ট খালি। <a href="shop.html" style="color:var(--accent)">শপে যান</a></div>
    `;
    if (totalsContainer) totalsContainer.style.display = 'none';
    return;
  }
  
  // Build items list
  itemsContainer.innerHTML = cart.map((item, idx) => `
    <div class="summary-item">
      <div class="summary-item-icon">${sanitize(item.icon)}</div>
      <div style="flex:1;">
        <div class="summary-item-name">${sanitize(item.name)}</div>
        <div class="summary-item-game">${sanitize(item.game)} ×${item.qty}</div>
      </div>
      <div class="summary-item-price">${formatCurrency(item.price * item.qty)}</div>
    </div>
  `).join('');
  
  // Calculate totals
  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  
  // Update totals
  document.getElementById('s-sub').textContent = formatCurrency(total);
  document.getElementById('s-grand').textContent = formatCurrency(total);
  
  if (totalsContainer) {
    totalsContainer.style.display = 'block';
  }
  
  // Pre-fill items field if game order
  const itemField = document.getElementById('gitem');
  const subItemField = document.getElementById('sitem');
  if (cart.length) {
    const itemsList = cart.map(i => `${sanitize(i.name)} x${i.qty}`).join(', ');
    if (itemField) itemField.value = itemsList;
    if (subItemField) subItemField.value = itemsList;
    console.log('✓ Item field auto-filled:', itemsList);
  } else {
    if (itemField) { itemField.value = ''; itemField.placeholder = 'Cart is empty - add items from shop'; }
    if (subItemField) { subItemField.value = ''; subItemField.placeholder = 'Cart is empty - add items from shop'; }
  }
}

// ── FORM HANDLERS ──────────────────────────────────────────
/**
 * Update item/package field based on cart contents
 */
function updateItemFields() {
  const itemField = document.getElementById('gitem');
  const subItemField = document.getElementById('sitem');
  
  if (cart.length) {
    const itemsList = cart.map(i => `${sanitize(i.name)} x${i.qty}`).join(', ');
    if (itemField) { itemField.value = itemsList; itemField.placeholder = 'Auto-filled from cart'; }
    if (subItemField) { subItemField.value = itemsList; subItemField.placeholder = 'Auto-filled from cart'; }
    console.log('✓ Item field updated:', itemsList);
  } else {
    if (itemField) { itemField.value = ''; itemField.placeholder = 'Cart is empty - add items from shop'; itemField.style.background = 'rgba(255, 100, 100, 0.1)'; }
    if (subItemField) { subItemField.value = ''; subItemField.placeholder = 'Cart is empty - add items from shop'; subItemField.style.background = 'rgba(255, 100, 100, 0.1)'; }
  }
}

function toggleOrderType() {
  const type = document.querySelector('input[name="order_type"]:checked')?.value || 'game';
  const gameFields = document.getElementById('game-fields');
  const subFields = document.getElementById('sub-fields');
  
  if (gameFields) gameFields.classList.toggle('on', type === 'game');
  if (subFields) subFields.classList.toggle('on', type === 'subscription');
  
  // Update item fields when order type changes
  updateItemFields();
}

// ── PHONE FORMATTING ────────────────────────────────────────
function formatPhoneInput(event) {
  let value = event.target.value.replace(/\D/g, ''); // Remove all non-digits
  
  if (value.length > 11) {
    value = value.slice(0, 11);
  }
  
  // Format as XXXXX-XXXXXX (hyphen after 5 digits)
  let formatted = value;
  if (value.length > 5) {
    formatted = value.slice(0, 5) + '-' + value.slice(5);
  }
  
  event.target.value = formatted;
}

// ── VALIDATION FUNCTIONS ────────────────────────────────────
function validatePhone(phone) {
  // Remove formatting (hyphen) for validation
  const rawPhone = phone.replace(/\D/g, '');
  // Must be 11 digits and start with 01
  return /^01[0-9]{9}$/.test(rawPhone);
}

function validateEmail(email) {
  // Domain whitelist: gmail, hotmail, outlook, yahoo, proton
  const allowedDomains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'proton.com'];
  const emailLower = email.toLowerCase();
  
  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLower)) {
    return false;
  }
  
  // Check if domain is whitelisted
  const domain = emailLower.split('@')[1];
  return allowedDomains.includes(domain);
}

function validateTrxID(trxid) {
  // Letters and numbers only, max 10 characters
  return /^[a-zA-Z0-9]{1,10}$/.test(trxid);
}

function validatePlayerID(uid) {
  // Numbers only, max 10 characters
  return /^[0-9]{1,10}$/.test(uid);
}

// ── FORM VALIDATION ────────────────────────────────────────
function validateOrderForm() {
  try {
    const name = document.getElementById('cname')?.value.trim() || '';
    const phone = document.getElementById('cphone')?.value.trim() || '';
    const orderType = document.querySelector('input[name="order_type"]:checked')?.value;
    
    console.log('Validating form...', { name, phone, orderType });
    
    // Validate name
    if (!name || name.length < 3 || name.length > 100) {
      showError('❌ Please enter a valid name (3-100 characters)');
      return false;
    }
    
    // Validate phone
    if (!validatePhone(phone)) {
      showError('❌ Please enter a valid Bangladesh phone number (01XXXXXXXXX)');
      return false;
    }
    
    // Validate order type-specific fields
    if (orderType === 'game') {
      const gameSelect = document.getElementById('game-sel')?.value;
      const playerId = document.getElementById('puid')?.value.trim();
      const email = document.getElementById('cemail')?.value.trim();
      const itemField = document.getElementById('gitem')?.value.trim();
      const trxid = document.getElementById('trxid')?.value.trim();
      
      if (!gameSelect) {
        showError('❌ Please select a game');
        return false;
      }
      
      if (!playerId) {
        showError('❌ Player ID is required');
        return false;
      }
      
      if (!validatePlayerID(playerId)) {
        showError('❌ Player ID must contain numbers only, max 10 characters');
        return false;
      }
      
      if (!validateEmail(email)) {
        showError('❌ Email must be from: Gmail, Hotmail, Outlook, Yahoo, or ProtonMail');
        return false;
      }
      
      if (!itemField) {
        showError('❌ Please specify which item to purchase');
        return false;
      }
      
      if (!trxid) {
        showError('❌ Transaction ID is required');
        return false;
      }
      
      if (!validateTrxID(trxid)) {
        showError('❌ Transaction ID must be 1-10 alphanumeric characters (letters and numbers only)');
        return false;
      }
    } else if (orderType === 'subscription') {
      const subSelect = document.getElementById('sub-sel')?.value;
      const email = document.getElementById('sub-email')?.value.trim();
      const trxid = document.getElementById('trxid')?.value.trim();
      
      if (!subSelect) {
        showError('❌ Please select a subscription');
        return false;
      }
      
      if (!validateEmail(email)) {
        showError('❌ Email must be from: Gmail, Hotmail, Outlook, Yahoo, or ProtonMail');
        return false;
      }
      
      if (!trxid) {
        showError('❌ Transaction ID is required');
        return false;
      }
      
      if (!validateTrxID(trxid)) {
        showError('❌ Transaction ID must be 1-10 alphanumeric characters (letters and numbers only)');
        return false;
      }
    }
    
    console.log('✓ Form validation passed');
    return true;
    
  } catch (error) {
    console.error('✗ Validation error:', error);
    showError('Validation error: ' + error.message);
    return false;
  }
}

// ── ERROR DISPLAY ──────────────────────────────────────────
function showError(message) {
  console.warn('Showing error:', message);
  
  // Create error toast if not exists
  let toast = document.getElementById('error-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'error-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      background: #ff6b6b;
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      z-index: 2000;
      max-width: 400px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      animation: slideIn 0.3s ease-out;
      font-weight: 600;
    `;
    document.body.appendChild(toast);
  }
  
  toast.textContent = message;
  toast.style.display = 'block';
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    if (toast) {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => {
        if (toast) toast.style.display = 'none';
      }, 300);
    }
  }, 5000);
}

// ── SUCCESS NOTIFICATION ────────────────────────────────────
function showNotification(message) {
  console.log('Showing notification:', message);
  
  let toast = document.getElementById('success-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'success-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: var(--accent);
      color: #000;
      padding: 16px 24px;
      border-radius: 8px;
      z-index: 2000;
      max-width: 400px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      animation: slideIn 0.3s ease-out;
      font-weight: 600;
    `;
    document.body.appendChild(toast);
  }
  
  toast.textContent = message;
  toast.style.display = 'block';
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    if (toast) {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => {
        if (toast) toast.style.display = 'none';
      }, 300);
    }
  }, 3000);
}

// ── ORDER SUBMISSION ───────────────────────────────────────
function submitOrder() {
  try {
    console.log('✓ submitOrder() called');
    
    // Rate limiting - prevent rapid resubmission
    if (Date.now() - lastSubmitTime < 3000) {
      showError('Please wait a few seconds before submitting again.');
      return;
    }
    lastSubmitTime = Date.now();
    
    // Validate form
    if (!validateOrderForm()) {
      console.warn('✗ Form validation failed');
      return;
    }
    
    console.log('✓ Form validation passed');
    
    // Collect order data
    const name = sanitize(document.getElementById('cname').value.trim());
    const phone = document.getElementById('cphone').value.trim();
    const email = document.getElementById('cemail')?.value.trim() || document.getElementById('sub-email')?.value.trim() || '';
    const orderType = document.querySelector('input[name="order_type"]:checked').value;
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    const trxId = document.getElementById('trxid')?.value.trim() || '';
    const notes = sanitize(document.getElementById('onotes')?.value.trim() || '');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    currentOrderTotal = total; // Save for WhatsApp later
    
    console.log('Form data collected:', { name, phone, email, orderType, paymentMethod, total });
    
    // Generate order ID
    currentOrderId = generateOrderID();
    console.log('✓ Order ID generated:', currentOrderId);
    
    // Collect type-specific data
    let itemPackage = '';
    
    if (orderType === 'game') {
      itemPackage = document.getElementById('gitem')?.value.trim() || '';
    } else if (orderType === 'subscription') {
      const subSelect = document.getElementById('sub-sel');
      if (subSelect) {
        const selectedOption = subSelect.options[subSelect.selectedIndex];
        itemPackage = selectedOption?.text || '';
      }
    }
    
    console.log('✓ Item package:', itemPackage);
    
    // Create order object for local storage
    const order = {
      id: currentOrderId,
      name,
      phone,
      email,
      orderType,
      paymentMethod,
      total,
      items: cart,
      status: 'Pending Payment',
      createdAt: new Date().toISOString(),
      notes,
      itemPackage
    };
    
    // Save order locally
    let orders = SafeStorage.get('orders', []);
    if (!Array.isArray(orders)) {
      orders = [];
    }
    orders.push(order);
    SafeStorage.set('orders', orders);
    console.log('✓ Order saved to localStorage');
    
    // Send order data to Google Sheets
    sendOrderToGoogleSheets({
      orderId: currentOrderId,
      customerName: name,
      phone: phone,
      email: email,
      orderType: orderType,
      itemPackage: itemPackage,
      totalAmount: total,
      paymentMethod: paymentMethod,
      trxId: trxId,
      notes: notes
    });
    
    // Clear cart
    SafeStorage.set('cart', []);
    cart = [];
    console.log('✓ Cart cleared');
    
    // Show success modal
    showSuccessModal(currentOrderId);
    console.log('✓ Success modal displayed');
    
  } catch (error) {
    console.error('✗ Error in submitOrder():', error);
    showError('An error occurred: ' + error.message);
  }
}

// ── GOOGLE SHEETS INTEGRATION ──────────────────────────────
function sendOrderToGoogleSheets(orderData) {
  const deploymentUrl = 'https://script.google.com/macros/s/AKfycbwt-f2ppbyNuXwF9JN2A536mHkrRnsZ2P4JP46p8VbLfpsX3G54lKnPk8KHyDP3BqllRw/exec';
  
  console.log('Sending to Google Sheets:', orderData);
  
  // Prepare form data
  const formData = new FormData();
  formData.append('orderId', orderData.orderId);
  formData.append('customerName', orderData.customerName);
  formData.append('phone', orderData.phone);
  formData.append('email', orderData.email);
  formData.append('orderType', orderData.orderType);
  formData.append('itemPackage', orderData.itemPackage);
  formData.append('totalAmount', orderData.totalAmount);
  formData.append('paymentMethod', orderData.paymentMethod);
  formData.append('trxId', orderData.trxId);
  formData.append('notes', orderData.notes);
  
  // Send to Google Sheets
  fetch(deploymentUrl, {
    method: 'POST',
    body: formData
  })
  .then(response => {
    console.log('✓ Google Sheets response status:', response.status);
    return response.json().catch(() => ({ status: 'received' }));
  })
  .then(data => {
    console.log('✓ Order sent to Google Sheets successfully:', data);
  })
  .catch(error => {
    console.error('✗ Error sending to Google Sheets:', error);
    // Log but don't block - order is already saved locally
    showError('⚠️ Could not sync to server (order saved locally)');
  });
}

function showSuccessModal(orderId) {
  try {
    console.log('Displaying success modal for Order ID:', orderId);
    
    const modal = document.getElementById('success-modal');
    const orderIdElement = document.getElementById('modal-oid');
    
    if (!modal) {
      console.error('✗ SUCCESS MODAL NOT FOUND in DOM');
      showError('Modal element not found - order saved but notification failed');
      return;
    }
    
    if (orderIdElement) {
      orderIdElement.textContent = orderId;
      console.log('✓ Order ID placed in modal:', orderId);
    } else {
      console.warn('⚠️ Order ID element not found');
    }
    
    modal.classList.add('open');
    console.log('✓ Modal opened (class added)');
    
    // Scroll to modal
    setTimeout(() => {
      modal.scrollIntoView({ behavior: 'smooth', block: 'center' });
      console.log('✓ Modal scrolled into view');
    }, 100);
    
  } catch (error) {
    console.error('✗ Error displaying modal:', error);
    showError('Could not display success modal: ' + error.message);
  }
}

// ── WHATSAPP INTEGRATION ───────────────────────────────────
function openWhatsApp() {
  try {
    const name = document.getElementById('cname')?.value || '';
    const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || '';
    const trxId = document.getElementById('trxid')?.value.trim() || '(not provided yet)';
    const total = currentOrderTotal;
    
    const message = `Assalamualaikum, I have placed an order on itzmehdude.online\n\nOrder ID: ${currentOrderId}\nName: ${name}\nPayment Method: ${paymentMethod}\nTotal: ${formatCurrency(total)}\nTransaction ID: ${trxId}\n\nPlease confirm my order.`;
    
    console.log('Opening WhatsApp with message:', message);
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send/?phone=8801575694241&text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    console.log('✓ WhatsApp opened');
    
  } catch (error) {
    console.error('✗ Error opening WhatsApp:', error);
    showError('Could not open WhatsApp: ' + error.message);
  }
}

// ── UTILITY: Copy Order ID to Clipboard ─────────────────────
function copyOrderID() {
  const orderIdElement = document.getElementById('modal-oid');
  if (!orderIdElement) {
    showError('Order ID element not found');
    return;
  }
  
  const orderId = orderIdElement.textContent;
  
  // Copy to clipboard
  navigator.clipboard.writeText(orderId).then(() => {
    console.log('✓ Order ID copied:', orderId);
    
    // Show visual feedback
    const btn = document.querySelector('.modal-copy-btn');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-check"></i>';
    btn.style.background = '#22c55e';
    
    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.style.background = 'var(--accent)';
    }, 2000);
    
    showNotification('✓ Order ID copied to clipboard!');
  }).catch(error => {
    console.error('✗ Failed to copy:', error);
    showError('Could not copy to clipboard');
  });
}
(function addStyles() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(-100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    #error-toast {
      display: none;
    }
  `;
  document.head.appendChild(style);
})();
