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

  /* ── Helper: open / close the nav ── */
  function openNav() {
    navMenu.classList.add('active');
    toggleBtn.classList.add('open');
    toggleBtn.setAttribute('aria-expanded', 'true');
  }
  function closeNav() {
    navMenu.classList.remove('active');
    toggleBtn.classList.remove('open');
    toggleBtn.setAttribute('aria-expanded', 'false');
  }
  function isNavOpen() { return navMenu.classList.contains('active'); }

  /* Initial ARIA state */
  toggleBtn.setAttribute('aria-label', 'Toggle navigation menu');
  toggleBtn.setAttribute('aria-expanded', 'false');
  toggleBtn.setAttribute('aria-controls', 'nav-menu');

  toggleBtn.addEventListener('click', e => {
    e.stopPropagation();
    isNavOpen() ? closeNav() : openNav();
  });

  /* Keyboard: Escape closes the menu */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isNavOpen()) closeNav();
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => closeNav());
  });

  /* Close nav + overlays when clicking outside */
  document.addEventListener('click', e => {
    if (
      isNavOpen() &&
      !e.target.closest('#menu-toggle') &&
      !e.target.closest('#nav-menu')
    ) {
      closeNav();
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
 * @param {string} price - formatted price string e.g. "Rs. 1,550"
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

/** Redirect to checkout page */
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
  { name: "Red Flower pattern Jutti",    price: "Rs. 1,550", section: "best-selling",  page: "index" },
  { name: "Royal Red Khussa",         price: "Rs. 1,100", section: "best-selling",  page: "index" },
  { name: "Bridal Kundan Jutti",       price: "Rs. 1,800", section: "best-selling",  page: "index" },
  { name: "Classic Black Jutti",        price: "Rs.1,550", section: "best-selling",  page: "index" },
  { name: "Classic Black Jutti", price: "Rs. 1,550", section: "collections",   page: "collection" },
  { name: "Mirror Work Khussa",        price: "Rs. 2,599", section: "collections",   page: "collection" },
  { name: "Velvet Zari Jutti",         price: "Rs. 2,999", section: "collections",   page: "collection" },
  { name: "Heritage Mojari Pair",      price: "Rs. 3,199", section: "collections",   page: "collection" },
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

  const keywords = ['embroidered','gold','khussa','bridal','silk','leather',
                    'mirror','velvet','mojari','heritage','floral','royal','kundan','zari',
                    'blue','tan','classic','casual','traditional','punjabi','wedding'];

  const results = searchProducts.filter(p =>
    p.name.toLowerCase().includes(q) ||
    keywords.some(k => k.includes(q) && p.name.toLowerCase().includes(k.substring(0, 3)))
  );

  // Split: which results live on this page vs collection page
  const indexResults      = results.filter(p => p.page === 'index');
  const collectionResults = results.filter(p => p.page === 'collection');

  if (results.length === 0) {
    labelEl.textContent = `No results for "${q}"`;
    listEl.innerHTML = `
      <div class="search-no-result">
        <p>Nothing found on this page.</p>
        <a class="search-redirect-link" href="collection.html?q=${encodeURIComponent(q)}">
          Browse all collections →
        </a>
      </div>`;
    return;
  }

  labelEl.textContent = `${results.length} result${results.length > 1 ? 's' : ''} found`;

  // Build result rows — index results scroll in page, collection results redirect
  listEl.innerHTML = results.map(p => {
    if (p.page === 'index') {
      return `<div class="search-result-item"
        onclick="closeSearch(); document.getElementById('${p.section}').scrollIntoView({behavior:'smooth'})">
        <div class="sri-left">
          <span class="sri-name">${p.name}</span>
          <span class="sri-badge sri-badge-index">On this page</span>
        </div>
        <span class="sri-price">${p.price}</span>
      </div>`;
    } else {
      return `<div class="search-result-item search-result-collection"
        onclick="window.location.href='collection.html?q=${encodeURIComponent(q)}'">
        <div class="sri-left">
          <span class="sri-name">${p.name}</span>
          <span class="sri-badge sri-badge-collection">Collections page ↗</span>
        </div>
        <span class="sri-price">${p.price}</span>
      </div>`;
    }
  }).join('');

  // If ALL results are on the collection page, add a redirect banner
  if (indexResults.length === 0 && collectionResults.length > 0) {
    listEl.insertAdjacentHTML('afterbegin', `
      <div class="search-redirect-banner">
        No matches on this page — showing results from 
        <a href="collection.html?q=${encodeURIComponent(q)}">All Collections ↗</a>
      </div>`);
  }
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
/* ── Auto-open search from ?q= URL param (used by checkout.html redirect) ── */
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');
  if (q && q.trim()) {
    // Wait a tick for script.js to finish its own DOMContentLoaded
    setTimeout(() => {
      const input = document.getElementById('search-input');
      if (input) {
        input.value = q.trim();
        if (typeof openSearch === 'function') openSearch();
        if (typeof doSearch === 'function') doSearch();
      }
    }, 150);
  }
});
/* ═══════════════════════════════════════════════════════════
   PRODUCT MODAL — full collection-style modal for index.html
   Mirrors collection.js openModal / gallery / add-to-cart
═══════════════════════════════════════════════════════════ */

const INDEX_PRODUCTS = [
  { id:0, name:"Red Flower pattern Jutti",    price:1550, oldPrice:2000, categoryLabel:"Best Seller", rating:4.8, reviews:124, sold:350, desc:"Intricately hand-embroidered with 22-carat gold thread on premium full-grain leather. The finest example of Punjabi artisan craftsmanship, perfect for weddings and formal occasions.", images:[], angles:["Front View","Side Angle","Back View","Close-up Detail"], unavail:[37,41], discount:"22%" },
  { id:1, name:"Royal Red Khussa",         price:1100, oldPrice:1400, categoryLabel:"Traditional",  rating:4.6, reviews:87,  sold:210, desc:"Rich royal red velvet upper adorned with silver thread embroidery. Inspired by Mughal court aesthetics, this khussa pairs beautifully with traditional and formal ensembles.", images:[], angles:["Front View","Side Angle","Back View","Close-up Detail"], unavail:[36,40], discount:"18%" },
  { id:2, name:"Bridal Kundan Jutti",       price:1800, oldPrice:2200, categoryLabel:"Bridal",       rating:4.9, reviews:203, sold:520, desc:"Adorned with kundan stones and mirror work on ivory silk base. This bridal masterpiece is the perfect companion for your wedding day — handcrafted over 3 days by master artisans.", images:[], angles:["Front View","Side Angle","Back View","Close-up Detail"], unavail:[38],    discount:"17%" },
  { id:3, name:"Classic Black Jutti",        price:1550, oldPrice:2000, categoryLabel:"Mojari",       rating:4.7, reviews:156, sold:410, desc:"Delicate floral patterns woven in pure silk thread on a cushioned leather sole. Light, airy and elegant — perfect for Eid gatherings and family events.", images:[], angles:["Front View","Side Angle","Back View","Close-up Detail"], unavail:[],      discount:"22%" },
  { id:4, name:"Classic Black Jutti", price:1550, oldPrice:2000, categoryLabel:"Casual",       rating:4.5, reviews:72,  sold:180, desc:"Minimalist design with full-grain tan leather and hand-stitched edges. Timeless and versatile — the everyday jutti you'll reach for again and again.", images:[], angles:["Front View","Side Angle","Back View","Close-up Detail"], unavail:[39],    discount:"22%" },
  { id:5, name:"Mirror Work Khussa",        price:2599, oldPrice:3100, categoryLabel:"Traditional",  rating:4.8, reviews:99,  sold:290, desc:"Hundreds of tiny convex mirrors set by hand onto rich magenta leather. Catches light beautifully at every angle — a true showstopper for mehndi and dholki nights.", images:[], angles:["Front View","Side Angle","Back View","Close-up Detail"], unavail:[36,42], discount:"16%" },
  { id:6, name:"Velvet Zari Jutti",         price:2999, oldPrice:3700, categoryLabel:"Bridal",       rating:4.9, reviews:145, sold:380, desc:"Deep burgundy velvet with intricate zari (metallic yarn) embroidery. The heaviness of the embroidery and the richness of velvet make this a prized piece for wedding trousseaux.", images:[], angles:["Front View","Side Angle","Back View","Close-up Detail"], unavail:[37],    discount:"19%" },
  { id:7, name:"Heritage Mojari Pair",      price:3199, oldPrice:3900, categoryLabel:"Mojari",       rating:4.7, reviews:118, sold:330, desc:"Inspired by 17th century Lahori craftwork, this pair features dense geometric embroidery on hand-tanned leather. Comes in a heritage gift box — a perfect gift for the connoisseur.", images:[], angles:["Front View","Side Angle","Back View","Close-up Detail"], unavail:[],      discount:"18%" },
];

const INDEX_SIZES = [36,37,38,39,40,41,42];

/* Sync images from each card's data-images attribute */
function syncIndexImages() {
  document.querySelectorAll('.card-wrap[id^="card-"]').forEach(card => {
    const id  = parseInt(card.id.replace('card-',''), 10);
    const img = card.querySelector('img[data-images]');
    if (!img) return;
    try {
      const imgs = JSON.parse(img.getAttribute('data-images'));
      const p = INDEX_PRODUCTS.find(x => x.id === id);
      if (p) p.images = imgs;
    } catch(e) {}
  });
}

let modalProduct    = null;
let currentImgIndex = 0;
let selectedSize    = null;

function openModal(id) {
  const p = INDEX_PRODUCTS.find(x => x.id === id);
  if (!p) return;
  modalProduct    = p;
  currentImgIndex = 0;
  selectedSize    = null;

  document.getElementById('m-cat').textContent       = p.categoryLabel;
  document.getElementById('m-name').textContent      = p.name;
  document.getElementById('m-stars').textContent     = '★'.repeat(Math.floor(p.rating)) + (p.rating % 1 >= 0.5 ? '½' : '');
  document.getElementById('m-rating').textContent    = `${p.rating} · ${p.reviews} reviews`;
  document.getElementById('m-sold').innerHTML        = `&nbsp;·&nbsp; <span style="color:var(--gold-dark,#a9793b);font-weight:700">${p.sold}+</span> sold`;
  document.getElementById('m-price').textContent     = `Rs. ${p.price.toLocaleString()}`;
  document.getElementById('m-price-old').textContent = `Rs. ${p.oldPrice.toLocaleString()}`;
  document.getElementById('m-discount').textContent  = `${p.discount} off`;
  document.getElementById('m-desc').textContent      = p.desc;

  /* Sizes */
  document.getElementById('m-sizes').innerHTML = INDEX_SIZES.map(s => {
    const ua = p.unavail.includes(s);
    return `<button class="sz-btn${ua?' sz-unavail':''}" data-size="${s}" ${ua?'disabled':`onclick="selectModalSize(${s},this)"`} title="${ua?'Out of stock':'Size '+s}">${s}</button>`;
  }).join('');

  /* Reset add button */
  const addBtn = document.getElementById('m-add-btn');
  addBtn.disabled = true;
  addBtn.innerHTML = `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> Select a Size First`;

  /* Gallery thumbnails */
  const thumbsEl = document.getElementById('gallery-thumbs');
  const fallback = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect fill='%23f7f2ec' width='200' height='200'/><text x='50%25' y='56%25' dominant-baseline='middle' text-anchor='middle' font-size='48'>👟</text></svg>`;
  thumbsEl.innerHTML = p.images.map((src, i) => `
    <div class="g-thumb-wrap">
      <div class="g-thumb ${i===0?'active':''}" data-idx="${i}" onclick="switchModalImage(${i})">
        <img src="${src}" alt="${p.angles[i]}" onerror="this.src='${fallback}'">
      </div>
      <span class="g-thumb-label">${p.angles[i].split(' ')[0]}</span>
    </div>`).join('');

  /* Main image */
  const mainImg = document.getElementById('gallery-main-img');
  mainImg.src   = p.images[0] || fallback;
  mainImg.alt   = p.name;
  mainImg.onerror = function(){ this.src = fallback; };
  applyOrientation(p.images[0] || fallback);

  /* Dots */
  document.getElementById('gallery-dots').innerHTML = p.images.map((_,i) =>
    `<div class="g-dot${i===0?' active':''}" onclick="switchModalImage(${i})"></div>`).join('');

  /* Recommendations */
  buildIndexRecs(id);

  /* Open */
  document.getElementById('modal-backdrop').classList.add('open');
  document.body.style.overflow = 'hidden';

  /* Zoom */
  setupZoom();
}

function closeModal() {
  document.getElementById('modal-backdrop').classList.remove('open');
  document.body.style.overflow = '';
  modalProduct = null;
  selectedSize = null;
}

function handleBackdropClick(e) {
  if (e.target === document.getElementById('modal-backdrop')) closeModal();
}

function switchModalImage(idx) {
  if (!modalProduct) return;
  const mainEl  = document.querySelector('.gallery-main');
  const mainImg = document.getElementById('gallery-main-img');
  currentImgIndex = idx;

  /* Reset zoom before switching */
  if (mainEl) mainEl.classList.remove('zoomed');

  mainImg.classList.add('switching');
  setTimeout(() => {
    mainImg.src = modalProduct.images[idx];
    mainImg.classList.remove('switching');
    applyOrientation(modalProduct.images[idx]);
  }, 200);
  document.querySelectorAll('.g-thumb').forEach((t,i) => t.classList.toggle('active', i===idx));
  document.querySelectorAll('.g-dot').forEach((d,i)  => d.classList.toggle('active', i===idx));
}

function galleryNav(dir) {
  if (!modalProduct) return;
  switchModalImage((currentImgIndex + dir + modalProduct.images.length) % modalProduct.images.length);
}

function selectModalSize(size, btn) {
  selectedSize = size;
  document.querySelectorAll('.sz-btn:not(.sz-unavail)').forEach(b => b.classList.remove('sz-selected'));
  btn.classList.add('sz-selected');
  const addBtn = document.getElementById('m-add-btn');
  addBtn.disabled = false;
  addBtn.innerHTML = `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> Add to Cart`;
}

function modalAddToCart() {
  if (!modalProduct || !selectedSize) return;
  const p   = modalProduct;
  const key = `${p.id}-${selectedSize}`;
  const existing = cart.find(i => i.key === key);
  if (existing) { existing.qty += 1; }
  else { cart.push({ key, id:p.id, name:p.name, price:`Rs. ${p.price.toLocaleString()}`, numPrice:p.price, size:selectedSize, qty:1 }); }
  saveCart();
  renderCartItems();
  showToast(`✓ ${p.name} · Size ${selectedSize} added!`);
  const addBtn = document.getElementById('m-add-btn');
  addBtn.innerHTML = '✓ Added to Cart!';
  addBtn.style.background = '#388e3c';
  setTimeout(() => {
    addBtn.innerHTML = `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> Add to Cart`;
    addBtn.style.background = '';
  }, 2000);
}

function modalCheckout() {
  if (!selectedSize) {
    showToast('Please select a size first!');   
    const lbl = document.getElementById('size-label-el');
    lbl.style.color = '#c62828';
    setTimeout(() => lbl.style.color = '', 1500);
    return;
  }
  modalAddToCart();
  closeModal();
  setTimeout(() => { window.location.href = 'checkout.html'; }, 400);
}

/* ── Detect image orientation and adjust gallery-main aspect ratio ── */
function applyOrientation(src) {
  const galleryMain = document.querySelector('.gallery-main');
  if (!galleryMain) return;
  const img = new Image();
  img.onload = () => {
    galleryMain.classList.remove('is-landscape', 'is-portrait', 'is-square');
    const ratio = img.naturalWidth / img.naturalHeight;
    if (ratio > 1.15)      galleryMain.classList.add('is-landscape');
    else if (ratio < 0.87) galleryMain.classList.add('is-portrait');
    else                   galleryMain.classList.add('is-square');
  };
  img.src = src;
}

/* ── Image Zoom (modal main image) ── */
function setupZoom() {
  const galleryMain = document.querySelector('.gallery-main');
  if (!galleryMain) return;

  /* Remove old listeners by cloning the node */
  const fresh = galleryMain.cloneNode(true);
  galleryMain.parentNode.replaceChild(fresh, galleryMain);

  /* Replace arrow buttons with clean copies that have NO onclick attribute,
     then wire them via addEventListener only — prevents double-fire on Netlify */
  ['.gallery-arrow.prev', '.gallery-arrow.next'].forEach((sel, i) => {
    const oldBtn = fresh.querySelector(sel);
    if (!oldBtn) return;
    const newBtn = document.createElement('button');
    newBtn.className = oldBtn.className;
    newBtn.innerHTML = oldBtn.innerHTML;
    newBtn.setAttribute('aria-label', i === 0 ? 'Previous image' : 'Next image');
    const dir = i === 0 ? -1 : 1;
    newBtn.addEventListener('click', e => { e.stopPropagation(); galleryNav(dir); });
    oldBtn.parentNode.replaceChild(newBtn, oldBtn);
  });

  /* Add zoom hint if not already there */
  if (!fresh.querySelector('.zoom-hint')) {
    const hint = document.createElement('div');
    hint.className = 'zoom-hint';
    hint.textContent = '🔍 Click to zoom';
    fresh.appendChild(hint);
  }

  /* Track mouse position so zoom is centred on cursor */
  fresh.addEventListener('mousemove', e => {
    if (!fresh.classList.contains('zoomed')) return;
    const rect = fresh.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1) + '%';
    const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1) + '%';
    fresh.style.setProperty('--zoom-x', x);
    fresh.style.setProperty('--zoom-y', y);
  });

  /* Click toggles zoom; ignore clicks on arrows / dots */
  fresh.addEventListener('click', e => {
    if (e.target.closest('.gallery-arrow, .gallery-dots')) return;
    fresh.classList.toggle('zoomed');
  });

  /* Leave always cancels zoom */
  fresh.addEventListener('mouseleave', () => {
    fresh.classList.remove('zoomed');
  });
}

function resetZoom() {
  document.querySelector('.gallery-main')?.classList.remove('zoomed');
}

function buildIndexRecs(excludeId) {
  const recs  = INDEX_PRODUCTS.filter(p => p.id !== excludeId);
  const strip = document.getElementById('recs-strip');
  const fb    = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect fill='%23f7f2ec' width='200' height='200'/><text x='50%25' y='56%25' dominant-baseline='middle' text-anchor='middle' font-size='48'>👟</text></svg>`;
  strip.innerHTML = recs.map(p => `
    <div class="rec-card" onclick="openModal(${p.id})">
      <img src="${p.images[0]||fb}" alt="${p.name}" onerror="this.src='${fb}'">
      <div class="rec-card-body">
        <p class="rec-name">${p.name}</p>
        <p class="rec-price">Rs. ${p.price.toLocaleString()}</p>
      </div>
    </div>`).join('');
}

/* Escape key closes modal */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { if (document.getElementById('modal-backdrop')?.classList.contains('open')) closeModal(); }
  if (e.key === 'ArrowLeft'  && document.getElementById('modal-backdrop')?.classList.contains('open')) galleryNav(-1);
  if (e.key === 'ArrowRight' && document.getElementById('modal-backdrop')?.classList.contains('open')) galleryNav(1);
});

/* Sync on load */
document.addEventListener('DOMContentLoaded', syncIndexImages);
