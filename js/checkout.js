/* ══════════════════════════════════════
   JUTTI.COM — script.js
   Full cart functionality:
   • Size selector overlay
   • Add to Cart → navbar badge updates
   • Cart drawer with qty controls & remove
   • Toast notifications
   • Persistent cart via localStorage
══════════════════════════════════════ */

/* ─────────────────────────────────────
   SIZE DATA
   unavail: sizes not available for that product index
───────────────────────────────────── */
const SIZES = [36, 37, 38, 39, 40, 41, 42];

const productMeta = {
  0: { unavail: [37, 41] },
  1: { unavail: [36, 40] },
  2: { unavail: [38] },
  3: { unavail: [] },
  4: { unavail: [39] },
  5: { unavail: [36, 42] },
  6: { unavail: [37] },
  7: { unavail: [] },
};

/* ─────────────────────────────────────
   CART STATE — persisted in localStorage
───────────────────────────────────── */
let cart = [];
try {
  cart = JSON.parse(localStorage.getItem('jutti_cart') || '[]');
} catch (e) {
  cart = [];
}

/* ─────────────────────────────────────
   INJECT SIZE BUTTONS INTO EACH CARD
───────────────────────────────────── */
function injectSizes() {
  Object.keys(productMeta).forEach(idx => {
    const container = document.getElementById(`sizes-${idx}`);
    if (!container) return;
    const meta = productMeta[idx];

    container.innerHTML = SIZES.map(s => {
      const unavail = meta.unavail.includes(s);
      return `<div
        class="sz${unavail ? ' unavailable' : ''}"
        data-size="${s}"
        ${unavail ? '' : `onclick="selectSize(${idx}, ${s}, event)"`}
        title="${unavail ? 'Out of stock' : 'Size ' + s}"
      >${s}</div>`;
    }).join('');
  });
}

/* ═══════════════════════════════════════
   INITIALISE on DOM ready
═══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  injectSizes();
  buildCartDrawer();   // build drawer HTML once
  renderCartItems();   // populate with saved cart
  updateBadge();
  initStatsObserver(); // rolling counter for About stats

  /* ── Hamburger menu ── */
  const toggleBtn = document.getElementById('menu-toggle');
  const navMenu   = document.getElementById('nav-menu');

  toggleBtn.addEventListener('click', e => {
    e.stopPropagation();
    const isOpen = navMenu.classList.toggle('active');
    const spans  = toggleBtn.querySelectorAll('span');
    if (isOpen) {
      spans[0].style.cssText = 'transform:rotate(45deg) translate(5px,5px)';
      spans[1].style.cssText = 'opacity:0;transform:scaleX(0)';
      spans[2].style.cssText = 'transform:rotate(-45deg) translate(5px,-5px)';
    } else {
      spans.forEach(s => s.style.cssText = '');
    }
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      toggleBtn.querySelectorAll('span').forEach(s => s.style.cssText = '');
    });
  });

  /* Close nav + overlays when clicking outside */
  document.addEventListener('click', e => {
    if (
      navMenu.classList.contains('active') &&
      !e.target.closest('#menu-toggle') &&
      !e.target.closest('#nav-menu')
    ) {
      navMenu.classList.remove('active');
      toggleBtn.querySelectorAll('span').forEach(s => s.style.cssText = '');
    }
    /* Close size overlays when clicking outside a card */
    if (!e.target.closest('.card-wrap')) {
      closeAllSizes();
    }
  });

  /* Live search */
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', doSearch);
  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeSearch();
    if (e.key === 'Enter')  doSearch();
  });
});

/* ═══════════════════════════════════════
   SIZE OVERLAY LOGIC
═══════════════════════════════════════ */

/** Open the size selector for a given card */
function openSize(idx, e) {
  if (e) e.stopPropagation();
  closeAllSizes();
  const overlay = document.getElementById(`overlay-${idx}`);
  if (overlay) overlay.classList.add('open');
}

/** Close (and reset) the size selector for a given card */
function closeSize(idx) {
  const overlay = document.getElementById(`overlay-${idx}`);
  if (!overlay) return;
  overlay.classList.remove('open');
  /* Reset selection */
  overlay.querySelectorAll('.sz').forEach(s => s.classList.remove('selected'));
  const confirmBtn = document.getElementById(`confirm-${idx}`);
  if (confirmBtn) confirmBtn.disabled = true;
}

/** Close every open size overlay on the page */
function closeAllSizes() {
  document.querySelectorAll('.size-overlay.open').forEach(o => {
    const idx = o.id.replace('overlay-', '');
    closeSize(idx);
  });
}

/** Highlight the chosen size and enable the confirm button */
function selectSize(idx, size, e) {
  if (e) e.stopPropagation();
  const container = document.getElementById(`sizes-${idx}`);
  if (!container) return;
  /* Deselect all, then select chosen */
  container.querySelectorAll('.sz').forEach(s => s.classList.remove('selected'));
  container.querySelector(`[data-size="${size}"]`)?.classList.add('selected');
  /* Enable confirm */
  const confirmBtn = document.getElementById(`confirm-${idx}`);
  if (confirmBtn) confirmBtn.disabled = false;
}

/* ═══════════════════════════════════════
   CART OPERATIONS
═══════════════════════════════════════ */

/**
 * Called by the "Add to Cart" confirm button inside each size overlay.
 * @param {number} idx   - product index (0–7)
 * @param {string} name  - product name
 * @param {string} price - formatted price string e.g. "Rs. 2,499"
 */
function addToCart(idx, name, price) {
  const container = document.getElementById(`sizes-${idx}`);
  if (!container) return;
  const sel = container.querySelector('.sz.selected');
  if (!sel) {
    showToast('Please select a size first!');
    return;
  }

  const size     = sel.dataset.size;
  const key      = `${idx}-${size}`;
  const numPrice = parseInt(price.replace(/[^0-9]/g, ''), 10);
  const existing = cart.find(i => i.key === key);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ key, id: idx, name, price, numPrice, size, qty: 1 });
  }

  saveCart();
  closeSize(idx);
  showToast(`✓  ${name} · Size ${size} added to cart!`);
  renderCartItems();
  bumpBadge();
}

function removeFromCart(key) {
  cart = cart.filter(i => i.key !== key);
  saveCart();
  renderCartItems();
}

function updateQty(key, delta) {
  const item = cart.find(i => i.key === key);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.key !== key);
  saveCart();
  renderCartItems();
}

function saveCart() {
  try { localStorage.setItem('jutti_cart', JSON.stringify(cart)); } catch (e) {}
  updateBadge();
}

/* ─────────────────────────────────────
   BADGE
───────────────────────────────────── */
function updateBadge() {
  const totalQty   = cart.reduce((sum, i) => sum + i.qty, 0);
  const totalPrice = cart.reduce((sum, i) => sum + i.numPrice * i.qty, 0);

  /* Badge count */
  document.querySelectorAll('.badge').forEach(b => {
    b.textContent = totalQty;
  });

  /* Navbar price total */
  const navTotal = document.getElementById('nav-cart-total');
  if (navTotal) {
    navTotal.textContent = totalQty > 0
      ? `Rs. ${totalPrice.toLocaleString()}`
      : 'Rs. 0';
    navTotal.classList.toggle('has-items', totalQty > 0);
  }
}

/** Brief scale animation on the badge + total when items are added */
function bumpBadge() {
  updateBadge();
  document.querySelectorAll('.badge').forEach(b => {
    b.classList.remove('bump');
    void b.offsetWidth;
    b.classList.add('bump');
    setTimeout(() => b.classList.remove('bump'), 300);
  });
  const navTotal = document.getElementById('nav-cart-total');
  if (navTotal) {
    navTotal.classList.remove('pop');
    void navTotal.offsetWidth;
    navTotal.classList.add('pop');
    setTimeout(() => navTotal.classList.remove('pop'), 400);
  }
}

/* ═══════════════════════════════════════
   CART DRAWER
═══════════════════════════════════════ */

/** Build the drawer HTML structure once (called on DOMContentLoaded) */
function buildCartDrawer() {
  if (document.getElementById('cart-drawer')) return; /* already built */
  document.body.insertAdjacentHTML('beforeend', `
    <div class="cart-backdrop" id="cart-backdrop" onclick="toggleCart()"></div>
    <aside class="cart-drawer" id="cart-drawer">
      <div class="cart-drawer-header">
        <h3>Your Cart</h3>
        <button class="cart-close" onclick="toggleCart()" title="Close cart">✕</button>
      </div>
      <div class="cart-items" id="cart-items"></div>
      <div class="cart-footer" id="cart-footer"></div>
    </aside>
  `);
}

/** Re-render the cart items list and footer total */
function renderCartItems() {
  const itemsEl  = document.getElementById('cart-items');
  const footerEl = document.getElementById('cart-footer');
  if (!itemsEl || !footerEl) return;

  /* ── Empty state ── */
  if (cart.length === 0) {
    itemsEl.innerHTML = `
      <div class="cart-empty">
        <svg width="56" height="56" fill="none" stroke="#c8a97e" stroke-width="1.2"
          viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        <p>Your cart is empty</p>
      </div>`;
    footerEl.innerHTML = '';
    return;
  }

  /* ── Cart items ── */
  itemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="ci-info">
        <p class="ci-name">${item.name}</p>
        <p class="ci-meta">Size ${item.size} &nbsp;·&nbsp; ${item.price}</p>
      </div>
      <div class="ci-controls">
        <button class="qty-btn" onclick="updateQty('${item.key}', -1)" title="Decrease">−</button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn" onclick="updateQty('${item.key}', 1)"  title="Increase">+</button>
        <button class="ci-remove" onclick="removeFromCart('${item.key}')" title="Remove">✕</button>
      </div>
    </div>
  `).join('');

  /* ── Footer: total + actions ── */
  const total = cart.reduce((sum, i) => sum + i.numPrice * i.qty, 0);
  footerEl.innerHTML = `
    <div class="cart-total">
      <span>Total (${cart.reduce((s,i) => s+i.qty, 0)} item${cart.reduce((s,i)=>s+i.qty,0)!==1?'s':''})</span>
      <span>Rs. ${total.toLocaleString()}</span>
    </div>
    <button class="checkout-btn" onclick="proceedCheckout()">Proceed to Checkout →</button>
    <button class="continue-btn" onclick="toggleCart()">Continue Shopping</button>
  `;
}

/** Open/close the cart drawer */
function toggleCart() {
  const drawer   = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('cart-backdrop');
  if (!drawer) return;
  drawer.classList.toggle('open');
  backdrop.classList.toggle('open');
}

/** Redirect to the dedicated checkout page */
function proceedCheckout() {
  showToast('Redirecting to checkout… 🛍️');
  setTimeout(() => {
    window.location.href = 'checkout.html';
  }, 500);
}

/* ═══════════════════════════════════════
   TOAST
═══════════════════════════════════════ */
function showToast(msg) {
  let toast = document.getElementById('cart-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'cart-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2800);
}

/* ═══════════════════════════════════════
   SEARCH
═══════════════════════════════════════ */
const searchProducts = [
  { name: "Embroidered Gold Jutti",    price: "Rs. 2,499", section: "best-selling" },
  { name: "Royal Blue Khussa",         price: "Rs. 2,799", section: "best-selling" },
  { name: "Bridal Kundan Jutti",       price: "Rs. 3,499", section: "best-selling" },
  { name: "Floral Silk Mojari",        price: "Rs. 2,199", section: "best-selling" },
  { name: "Classic Tan Leather Jutti", price: "Rs. 1,899", section: "collections"  },
  { name: "Mirror Work Khussa",        price: "Rs. 2,599", section: "collections"  },
  { name: "Velvet Zari Jutti",         price: "Rs. 2,999", section: "collections"  },
  { name: "Heritage Mojari Pair",      price: "Rs. 3,199", section: "collections"  },
];

function openSearch() {
  document.getElementById('search-overlay').classList.add('open');
  setTimeout(() => document.getElementById('search-input').focus(), 100);
}

function closeSearch() {
  document.getElementById('search-overlay').classList.remove('open');
  document.getElementById('search-input').value = '';
  document.getElementById('search-results-list').innerHTML = '';
  document.getElementById('search-results-label').textContent = 'Try: embroidered, wedding, mojari, punjabi…';
  document.getElementById('search-tags').style.display = 'flex';
}

function fillSearch(q) {
  document.getElementById('search-input').value = q;
  doSearch();
}

function doSearch() {
  const q       = document.getElementById('search-input').value.trim().toLowerCase();
  const listEl  = document.getElementById('search-results-list');
  const labelEl = document.getElementById('search-results-label');
  const tagsEl  = document.getElementById('search-tags');

  if (!q) {
    listEl.innerHTML = '';
    labelEl.textContent = 'Try: embroidered, wedding, mojari, punjabi…';
    tagsEl.style.display = 'flex';
    return;
  }

  tagsEl.style.display = 'none';

  const results = searchProducts.filter(p =>
    p.name.toLowerCase().includes(q) ||
    ['embroidered','gold','khussa','bridal','silk','leather',
     'mirror','velvet','mojari','heritage','floral','royal','kundan','zari']
      .some(k => k.includes(q) && p.name.toLowerCase().includes(k.substring(0, 3)))
  );

  if (results.length === 0) {
    labelEl.textContent = `No results for "${q}"`;
    listEl.innerHTML = '';
    return;
  }

  labelEl.textContent = `${results.length} result${results.length > 1 ? 's' : ''} found`;
  listEl.innerHTML = results.map(p => `
    <div class="search-result-item"
      onclick="closeSearch(); document.getElementById('${p.section}').scrollIntoView({behavior:'smooth'})">
      <span class="sri-name">${p.name}</span>
      <span class="sri-price">${p.price}</span>
    </div>
  `).join('');
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeSearch();
});

/* ═══════════════════════════════════════
   CONTACT & NEWSLETTER
═══════════════════════════════════════ */
function submitForm() {
  showToast("Message sent! We'll reply within 24 hours ✓");
}

function subscribeNewsletter() {
  const input = document.getElementById('newsletter-email');
  const email = input.value.trim();
  if (!email || !email.includes('@')) {
    showToast('Please enter a valid email address');
    return;
  }
  showToast('Subscribed! Welcome to the JUtti family 🎉');
  input.value = '';
}

/* ═══════════════════════════════════════
   ABOUT STATS — rolling counter animation
   Triggers once when the stats enter the viewport.
═══════════════════════════════════════ */
function animateCounter(el) {
  const target   = parseFloat(el.dataset.target);
  const suffix   = el.dataset.suffix   || '';
  const duration = parseInt(el.dataset.duration) || 1500;
  const decimals = parseInt(el.dataset.decimal)  || 0;
  const start    = performance.now();

  el.classList.add('counting');

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function tick(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased    = easeOutQuart(progress);
    const current  = target * eased;

    el.textContent = current.toFixed(decimals) + suffix;

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = target.toFixed(decimals) + suffix;
      el.classList.remove('counting');
    }
  }

  requestAnimationFrame(tick);
}

function initStatsObserver() {
  const statsEl = document.getElementById('about-stats');
  if (!statsEl) return;

  const counters = statsEl.querySelectorAll('.stat-counter');
  let animated   = false;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        /* Stagger each counter slightly */
        counters.forEach((el, i) => {
          setTimeout(() => animateCounter(el), i * 120);
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.35 });

  observer.observe(statsEl);
}

/* ═══════════════════════════════════════
   SCROLL — navbar shadow + active nav link
═══════════════════════════════════════ */
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 10);

  let current = '';
  document.querySelectorAll('section[id]').forEach(section => {
    if (window.scrollY >= section.offsetTop - 130) current = section.id;
  });
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === '#' + current);
  });
});