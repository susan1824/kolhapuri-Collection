// ── YOUR WHATSAPP NUMBER ─────────────────────────────────────────
const WHATSAPP_NUMBER = "9779861093668";

// ── DELIVERY CHARGE ──────────────────────────────────────────────
const DELIVERY_CHARGE = 150;

// ── PROMO CODES ──────────────────────────────────────────────────
// type: "percent"  → % off subtotal
// type: "delivery" → makes delivery FREE
// Each code is one-time-use (tracked in localStorage)
const PROMO_CODES = {
  "JUTTI15":   { type: "percent",  value: 15, label: "15% off"       },
  "SAVE10":    { type: "percent",  value: 10, label: "10% off"       },
  "WELCOME20": { type: "percent",  value: 20, label: "20% off"       },
  "FREESHIP":  { type: "delivery", value: 0,  label: "Free Delivery" },
};
// ────────────────────────────────────────────────────────────────

let cart = [];
let appliedPromo = null;

try { cart = JSON.parse(localStorage.getItem('jutti_cart') || '[]'); }
catch(e) { cart = []; }

/* ── One-time use tracking ── */
function getUsedCodes() {
  try { return new Set(JSON.parse(localStorage.getItem('jutti_used_promos') || '[]')); }
  catch(e) { return new Set(); }
}
function markCodeUsed(code) {
  const used = getUsedCodes();
  used.add(code);
  localStorage.setItem('jutti_used_promos', JSON.stringify([...used]));
}

/* ── Calculate totals ── */
function calcTotals() {
  const subtotal = cart.reduce((s, i) => s + i.numPrice * i.qty, 0);
  let discountAmt = 0;
  let delivery    = DELIVERY_CHARGE;

  if (appliedPromo) {
    if (appliedPromo.type === 'percent') {
      discountAmt = Math.round(subtotal * appliedPromo.value / 100);
    } else if (appliedPromo.type === 'delivery') {
      delivery = 0;
    }
  }

  return { subtotal, discountAmt, delivery, total: subtotal - discountAmt + delivery };
}

/* ── Update summary panel numbers ── */
function updateSummaryTotals() {
  const { subtotal, discountAmt, delivery, total } = calcTotals();

  document.getElementById('summary-subtotal').textContent = `Rs. ${subtotal.toLocaleString()}`;
  document.getElementById('summary-total').textContent    = `Rs. ${total.toLocaleString()}`;

  const deliveryEl = document.getElementById('summary-delivery-val');
  if (delivery === 0) {
    deliveryEl.textContent = 'FREE';
    deliveryEl.style.color = '#388e3c';
  } else {
    deliveryEl.textContent = `Rs. ${delivery.toLocaleString()}`;
    deliveryEl.style.color = '';
  }

  const discountRow = document.getElementById('summary-discount-row');
  if (appliedPromo && discountAmt > 0) {
    document.getElementById('summary-discount-label').textContent = `Promo (${appliedPromo.code})`;
    document.getElementById('summary-discount-val').textContent   = `- Rs. ${discountAmt.toLocaleString()}`;
    discountRow.style.display = 'flex';
  } else if (appliedPromo && appliedPromo.type === 'delivery') {
    document.getElementById('summary-discount-label').textContent = `Promo (${appliedPromo.code})`;
    document.getElementById('summary-discount-val').textContent   = 'Free Delivery';
    discountRow.style.display = 'flex';
  } else {
    discountRow.style.display = 'none';
  }
}

/* ── Render cart items ── */
function renderCartPanel() {
  const listEl    = document.getElementById('cart-items-list');
  const summaryEl = document.getElementById('cart-summary');
  const badgeEl   = document.getElementById('cart-count-badge');
  const totalQty  = cart.reduce((s, i) => s + i.qty, 0);

  badgeEl.textContent = `${totalQty} item${totalQty !== 1 ? 's' : ''}`;

  if (cart.length === 0) {
    listEl.innerHTML = `
      <div class="cart-empty-msg">
        <svg width="48" height="48" fill="none" stroke="#c8a97e" stroke-width="1.2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        Your cart is empty.<br>
        <a href="index.html" style="color:#a9793b;font-weight:700;text-decoration:none;">← Go back and add items</a>
      </div>`;
    summaryEl.style.display = 'none';
    return;
  }

  listEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="ci-icon">👟</div>
      <div class="ci-details">
        <p class="ci-name">${item.name}</p>
        <p class="ci-meta">Size ${item.size} &nbsp;·&nbsp; ${item.price}</p>
      </div>
      <span class="ci-qty">× ${item.qty}</span>
      <div class="ci-price">Rs. ${(item.numPrice * item.qty).toLocaleString()}</div>
    </div>
  `).join('');

  summaryEl.style.display = 'block';
  updateSummaryTotals();
}

/* ── Apply promo code ── */
function applyPromo() {
  const inputEl = document.getElementById('f-promo');
  const msgEl   = document.getElementById('promo-msg');
  const code    = inputEl.value.trim().toUpperCase();

  if (!code) {
    msgEl.textContent = 'Please enter a promo code.';
    msgEl.className = 'promo-msg show fail';
    return;
  }

  const promo = PROMO_CODES[code];
  if (!promo) {
    appliedPromo = null;
    msgEl.textContent = '❌ Invalid promo code. Please try again.';
    msgEl.className = 'promo-msg show fail';
    inputEl.classList.add('error');
    return;
  }

  if (getUsedCodes().has(code)) {
    appliedPromo = null;
    msgEl.textContent = '⚠️ This code has already been used.';
    msgEl.className = 'promo-msg show fail';
    inputEl.classList.add('error');
    return;
  }

  appliedPromo = { code, ...promo };
  inputEl.disabled = true;
  inputEl.style.color = '#388e3c';
  inputEl.style.fontWeight = '700';
  const applyBtn = document.querySelector('.promo-apply-btn');
  applyBtn.textContent = '✓ Applied';
  applyBtn.disabled = true;
  applyBtn.style.background = '#e8f5e9';
  applyBtn.style.color = '#388e3c';
  applyBtn.style.borderColor = '#a5d6a7';

  msgEl.textContent = `🎉 "${code}" applied — ${promo.label}!`;
  msgEl.className = 'promo-msg show success';
  updateSummaryTotals();
}

/* ── Validate form ── */
function validateForm() {
  let valid = true;
  const fields = [
    { id: 'f-name',    err: 'err-name',    check: v => v.trim().length >= 2 },
    { id: 'f-phone',   err: 'err-phone',   check: v => /^[+\d\s\-()]{7,}$/.test(v.trim()) },
    { id: 'f-address', err: 'err-address', check: v => v.trim().length >= 5 },
  ];

  const emailVal = document.getElementById('f-email').value.trim();
  if (emailVal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
    document.getElementById('f-email').classList.add('error');
    document.getElementById('err-email').classList.add('show');
    valid = false;
  } else {
    document.getElementById('f-email').classList.remove('error');
    document.getElementById('err-email').classList.remove('show');
  }

  fields.forEach(({ id, err, check }) => {
    const el  = document.getElementById(id);
    const msg = document.getElementById(err);
    if (!check(el.value)) { el.classList.add('error'); msg.classList.add('show'); valid = false; }
    else { el.classList.remove('error'); msg.classList.remove('show'); }
  });

  const paymentSelected = document.querySelector('input[name="payment"]:checked');
  const paymentErr      = document.getElementById('err-payment');
  const paymentOptions  = document.querySelector('.payment-options');
  if (!paymentSelected) {
    paymentErr.classList.add('show'); paymentOptions.classList.add('error-highlight'); valid = false;
  } else {
    paymentErr.classList.remove('show'); paymentOptions.classList.remove('error-highlight');
  }

  return valid;
}

/* ── Build WhatsApp message ── */
function buildWhatsAppMessage() {
  const name     = document.getElementById('f-name').value.trim();
  const phone    = document.getElementById('f-phone').value.trim();
  const email    = document.getElementById('f-email').value.trim();
  const address  = document.getElementById('f-address').value.trim();
  const location = document.getElementById('f-location').value.trim();
  const payment  = document.querySelector('input[name="payment"]:checked').value;
  const payLabel = payment === 'cod' ? 'Cash on Delivery (COD)' : 'Online Payment (JazzCash / EasyPaisa / Bank)';

  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  const { subtotal, discountAmt, delivery, total } = calcTotals();

  const itemLines = cart.map(item =>
    `  • ${item.name} | Size ${item.size} | ${item.price} × ${item.qty} = Rs. ${(item.numPrice * item.qty).toLocaleString()}`
  ).join('\n');

  let msg = `🛍 *New Order – JUtti.com*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  msg += `👤 *Customer Details*\n`;
  msg += `Name    : ${name}\n`;
  msg += `Phone   : ${phone}\n`;
  if (email) msg += `Email   : ${email}\n`;
  msg += `Address : ${address}\n`;
  if (location) msg += `Location: ${location}\n`;
  msg += `\n`;
  msg += `📦 *Order Items (${totalQty} item${totalQty !== 1 ? 's' : ''})*\n`;
  msg += `${itemLines}\n\n`;
  msg += `💰 Subtotal  : Rs. ${subtotal.toLocaleString()}\n`;
  if (appliedPromo && discountAmt > 0)
    msg += `🏷 Promo (${appliedPromo.code}): - Rs. ${discountAmt.toLocaleString()}\n`;
  if (appliedPromo && appliedPromo.type === 'delivery')
    msg += `🏷 Promo (${appliedPromo.code}): Free Delivery\n`;
  msg += `🚚 Delivery  : ${delivery === 0 ? 'FREE' : 'Rs. ' + delivery.toLocaleString()}\n`;
  msg += `💰 *Total    : Rs. ${total.toLocaleString()}*\n`;
  msg += `💳 Payment   : ${payLabel}\n\n`;
  msg += `_Please confirm availability & delivery time. Thank you!_`;

  return msg;
}

/* ── Submit ── */
function submitOrder() {
  if (cart.length === 0) { showToast('Your cart is empty! Add items first.'); return; }
  if (!validateForm()) {
    showToast('Please fill in the required fields.');
    const firstErr = document.querySelector('input.error, textarea.error');
    if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  if (appliedPromo) markCodeUsed(appliedPromo.code);
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppMessage())}`;
  /* ── Clear cart after successful order ── */
  cart = [];
  try { localStorage.removeItem('jutti_cart'); } catch(e) {}
  renderCartPanel(); // update the on-page cart display to empty
  showToast('Opening WhatsApp… 🚀');
  setTimeout(() => window.open(waUrl, '_blank'), 600);
}

/* ── Toast ── */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2800);
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  renderCartPanel();

  ['f-name','f-phone','f-email','f-address','f-location'].forEach(id => {
    document.getElementById(id).addEventListener('input', function() {
      this.classList.remove('error');
      const errEl = document.getElementById('err-' + id.replace('f-', ''));
      if (errEl) errEl.classList.remove('show');
    });
  });

  document.querySelectorAll('input[name="payment"]').forEach(radio => {
    radio.addEventListener('change', () => {
      document.getElementById('err-payment').classList.remove('show');
      document.querySelector('.payment-options').classList.remove('error-highlight');
    });
  });

  document.getElementById('f-promo').addEventListener('input', function() {
    if (this.disabled) return;
    this.classList.remove('error');
    this.value = this.value.toUpperCase();
    document.getElementById('promo-msg').className = 'promo-msg';
  });

  document.getElementById('f-promo').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') { e.preventDefault(); applyPromo(); }
  });
});