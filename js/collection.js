/* ════════════════════════════════════════════════════════
   PRODUCT DATA
   Images are now defined in HTML via data-images attribute
   on each card's <img> tag. JS syncs them on init.
════════════════════════════════════════════════════════ */
const SIZES = [36, 37, 38, 39, 40, 41, 42];

const PRODUCTS = [
  {
    id: 0,
    name: "Red Flower pattern Jutti",
    price: 1800, oldPrice: 2000,
    category: "best-seller",
    categoryLabel: "Best Seller",
    tag: "Best Seller", tagClass: "tag-best",
    rating: 4.8, reviews: 124, sold: 350,
    desc: "Intricately hand-embroidered with 22-carat gold thread on premium full-grain leather. The finest example of Punjabi artisan craftsmanship, perfect for weddings and formal occasions.",
    images: [],   // filled from HTML data-images on init
    angles: ["Front View","Side Angle","Back View","Close-up Detail"],
    unavail: [37, 41],
    discount: "22%"
  },
  {
    id: 1,
    name: "Royal Red Khussa",
    price: 1100, oldPrice: 1400,
    category: "traditional",
    categoryLabel: "Traditional",
    tag: "New", tagClass: "tag-new",
    rating: 4.6, reviews: 87, sold: 210,
    desc: "Rich royal red velvet upper adorned with silver thread embroidery. Inspired by Mughal court aesthetics, this khussa pairs beautifully with traditional and formal ensembles.",
    images: [],
    angles: ["Front View","Side Angle","Back View","Close-up Detail"],
    unavail: [36, 40],
    discount: "18%"
  },
  {
    id: 2,
    name: "Bridal Kundan Jutti",
    price: 1500, oldPrice: 2200,
    category: "bridal",
    categoryLabel: "Bridal",
    tag: "Bridal", tagClass: "tag-bridal",
    rating: 4.9, reviews: 203, sold: 520,
    desc: "Adorned with kundan stones and mirror work on ivory silk base. This bridal masterpiece is the perfect companion for your wedding day — handcrafted over 3 days by master artisans.",
    images: [],
    angles: ["Front View","Side Angle","Back View","Close-up Detail"],
    unavail: [38],
    discount: "17%"
  },
  {
    id: 3,
    name: "Classic Black Jutti",
    price: 1550, oldPrice: 2000,
    category: "mojari",
    categoryLabel: "Mojari",
    tag: "Best Seller", tagClass: "tag-best",
    rating: 4.7, reviews: 156, sold: 410,
    desc: "Delicate floral patterns woven in pure silk thread on a cushioned leather sole. Light, airy and elegant — perfect for Eid gatherings and family events.",
    images: [],
    angles: ["Front View","Side Angle","Back View","Close-up Detail"],
    unavail: [],
    discount: "21%"
  },
  {
    id: 4,
    name: "Classic Tan Leather Jutti",
    price: 1899, oldPrice: 2400,
    category: "casual",
    categoryLabel: "Casual",
    tag: "New", tagClass: "tag-new",
    rating: 4.5, reviews: 72, sold: 180,
    desc: "Minimalist design with full-grain tan leather and hand-stitched edges. Timeless and versatile — the everyday jutti you'll reach for again and again.",
    images: [],
    angles: ["Front View","Side Angle","Back View","Close-up Detail"],
    unavail: [39],
    discount: "21%"
  },
  {
    id: 5,
    name: "Mirror Work Khussa",
    price: 2599, oldPrice: 3100,
    category: "traditional",
    categoryLabel: "Traditional",
    tag: "Best Seller", tagClass: "tag-best",
    rating: 4.8, reviews: 99, sold: 290,
    desc: "Hundreds of tiny convex mirrors set by hand onto rich magenta leather. Catches light beautifully at every angle — a true showstopper for mehndi and dholki nights.",
    images: [],
    angles: ["Front View","Side Angle","Back View","Close-up Detail"],
    unavail: [36, 42],
    discount: "16%"
  },
  {
    id: 6,
    name: "Velvet Zari Jutti",
    price: 2999, oldPrice: 3700,
    category: "bridal",
    categoryLabel: "Bridal",
    tag: "Bridal", tagClass: "tag-bridal",
    rating: 4.9, reviews: 145, sold: 380,
    desc: "Deep burgundy velvet with intricate zari (metallic yarn) embroidery. The heaviness of the embroidery and the richness of velvet make this a prized piece for wedding trousseaux.",
    images: [],
    angles: ["Front View","Side Angle","Back View","Close-up Detail"],
    unavail: [37],
    discount: "19%"
  },
  {
    id: 7,
    name: "Heritage Mojari Pair",
    price: 3199, oldPrice: 3900,
    category: "mojari",
    categoryLabel: "Mojari",
    tag: "Best Seller", tagClass: "tag-best",
    rating: 4.7, reviews: 118, sold: 330,
    desc: "Inspired by 17th century Lahori craftwork, this pair features dense geometric embroidery on hand-tanned leather. Comes in a heritage gift box — a perfect gift for the connoisseur.",
    images: [],
    angles: ["Front View","Side Angle","Back View","Close-up Detail"],
    unavail: [],
    discount: "18%"
  },
  {
    id: 8,
    name: "Embroidered Bridal Potli",
    price: 1799, oldPrice: 2400,
    category: "potli",
    categoryLabel: "Potli",
    tag: "New", tagClass: "tag-new",
    rating: 5.0, reviews: 94, sold: 215,
    desc: "Hand-embroidered with gold and ivory silk thread on a blush satin base. This bridal potli features a tassel drawstring closure and is the perfect accessory to complete your wedding look.",
    images: [],
    angles: ["Front View","Side Angle","Back View","Close-up Detail"],
    unavail: [],
    discount: "25%"
  },
  {
    id: 9,
    name: "Zari Gold Potli Clutch",
    price: 2299, oldPrice: 2900,
    category: "potli",
    categoryLabel: "Potli",
    tag: "Best Seller", tagClass: "tag-best",
    rating: 5.0, reviews: 138, sold: 310,
    desc: "Dazzling zari (gold metallic thread) embroidery on deep maroon silk. The structured base and silk rope handles make it as functional as it is stunning — perfect for mehndi and dholki nights.",
    images: [],
    angles: ["Front View","Side Angle","Back View","Close-up Detail"],
    unavail: [],
    discount: "21%"
  },
  {
    id: 10,
    name: "Kundan Velvet Potli Bag",
    price: 2599, oldPrice: 3200,
    category: "potli",
    categoryLabel: "Potli",
    tag: "Bridal", tagClass: "tag-bridal",
    rating: 4.8, reviews: 67, sold: 172,
    desc: "Rich royal blue velvet adorned with hand-set kundan stones and mirror embellishments. Roomy enough for your essentials, beautiful enough to be the centrepiece of your bridal ensemble.",
    images: [],
    angles: ["Front View","Side Angle","Back View","Close-up Detail"],
    unavail: [],
    discount: "19%"
  },
];

/* ════════════════════════════════════
   SYNC IMAGES FROM HTML
   Reads data-images from each card's <img> and populates PRODUCTS[].images
════════════════════════════════════ */
function syncImagesFromHTML() {
  document.querySelectorAll('.p-card').forEach(card => {
    const id  = parseInt(card.dataset.id, 10);
    const img = card.querySelector('.card-img-wrap img');
    if (!img) return;
    const raw = img.getAttribute('data-images');
    if (!raw) return;
    try {
      const imgs = JSON.parse(raw);
      const product = PRODUCTS.find(p => p.id === id);
      if (product) product.images = imgs;
    } catch(e) {}
  });
}

/* ════════════════════════════════════
   CART STATE
════════════════════════════════════ */
let cart = [];
try { cart = JSON.parse(localStorage.getItem('jutti_cart') || '[]'); } catch(e) { cart = []; }

function saveCart() {
  try { localStorage.setItem('jutti_cart', JSON.stringify(cart)); } catch(e) {}
  updateBadge();
  renderCartDrawer();
}

function updateBadge() {
  const qty = cart.reduce((s, i) => s + i.qty, 0);
  document.getElementById('cart-badge').textContent = qty;
}

/* ════════════════════════════════════
   PAGINATION STATE
════════════════════════════════════ */
const ITEMS_PER_PAGE = 4;
let currentPage      = 1;
let activeFilteredList = [];  // current filtered+sorted list

/* ════════════════════════════════════
   SHOW / HIDE CARDS  (no re-injection)
   Cards stay in HTML; we just show/hide based on filter+page
════════════════════════════════════ */
function renderGrid(list) {
  activeFilteredList = list;
  currentPage = 1;           // reset to first page on filter/sort
  applyPage();
}

function applyPage() {
  const allCards = document.querySelectorAll('.p-card');
  const totalItems = activeFilteredList.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

  // Clamp currentPage
  if (currentPage < 1) currentPage = 1;
  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const end   = start + ITEMS_PER_PAGE;
  const pageIds = activeFilteredList.slice(start, end).map(p => p.id);

  // Show/hide all HTML cards
  allCards.forEach(card => {
    const id  = parseInt(card.dataset.id, 10);
    const cat = card.dataset.cat;

    const inList = activeFilteredList.some(p => p.id === id);
    const onPage = pageIds.includes(id);

    card.style.display = (inList && onPage) ? '' : 'none';
  });

  // Update results count
  document.getElementById('results-count').textContent =
    `${totalItems} product${totalItems !== 1 ? 's' : ''}`;

  // Empty state
  const grid = document.getElementById('product-grid');
  const emptyEl = document.getElementById('empty-state');
  if (!totalItems) {
    if (!emptyEl) {
      const d = document.createElement('div');
      d.id = 'empty-state';
      d.style.cssText = 'grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--muted);font-size:1rem;';
      d.textContent = 'No products found in this category.';
      grid.appendChild(d);
    }
  } else {
    if (emptyEl) emptyEl.remove();
  }

  renderPagination(totalPages);
}

/* ════════════════════════════════════
   PAGINATION UI
════════════════════════════════════ */
function renderPagination(totalPages) {
  const wrap    = document.getElementById('pagination-wrap');
  const numbers = document.getElementById('pg-numbers');
  const prev    = document.getElementById('pg-prev');
  const next    = document.getElementById('pg-next');

  // Always show pagination
  wrap.style.display = 'flex';

  prev.disabled = (currentPage === 1);
  next.disabled = (currentPage === totalPages);

  // Build page number buttons
  numbers.innerHTML = '';
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.className = 'pg-num' + (i === currentPage ? ' active' : '');
    btn.textContent = i;
    btn.setAttribute('aria-label', `Page ${i}`);
    btn.onclick = () => goToPage(i);
    numbers.appendChild(btn);
  }
}

function goToPage(n) {
  const totalPages = Math.ceil(activeFilteredList.length / ITEMS_PER_PAGE);
  if (n < 1 || n > totalPages) return;
  currentPage = n;
  applyPage();
  // Scroll to top of grid
  document.querySelector('.collection-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function changePage(delta) {
  goToPage(currentPage + delta);
}

/* ════════════════════════════════════
   FILTER & SORT
════════════════════════════════════ */
let activeFilter = 'all';
let activeSort   = 'default';

function filterProducts(cat, btn) {
  activeFilter = cat;
  document.querySelectorAll('.ftab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  applyFilterSort();
}

function sortProducts(val) { activeSort = val; applyFilterSort(); }

function applyFilterSort() {
  let list = activeFilter === 'all'
    ? [...PRODUCTS]
    : PRODUCTS.filter(p => p.category === activeFilter);

  if (activeSort === 'price-asc')  list.sort((a,b) => a.price - b.price);
  if (activeSort === 'price-desc') list.sort((a,b) => b.price - a.price);
  if (activeSort === 'name')       list.sort((a,b) => a.name.localeCompare(b.name));

  renderGrid(list);
}

/* ════════════════════════════════════
   PRODUCT DETAIL MODAL
════════════════════════════════════ */
let modalProduct    = null;
let currentImgIndex = 0;
let selectedSize    = null;

function openModal(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  modalProduct = p;
  currentImgIndex = 0;
  selectedSize    = null;

  // Populate info
  document.getElementById('m-cat').textContent      = p.categoryLabel;
  document.getElementById('m-name').textContent     = p.name;
  document.getElementById('m-stars').textContent    = '★'.repeat(Math.floor(p.rating)) + (p.rating % 1 >= 0.5 ? '½' : '');
  document.getElementById('m-rating').textContent   = `${p.rating} · ${p.reviews} reviews`;
  document.getElementById('m-sold').innerHTML       = `&nbsp;·&nbsp; <span>${p.sold}+</span> sold`;
  document.getElementById('m-price').textContent    = `Rs. ${p.price.toLocaleString()}`;
  document.getElementById('m-price-old').textContent = `Rs. ${p.oldPrice.toLocaleString()}`;
  document.getElementById('m-discount').textContent = `${p.discount} off`;
  document.getElementById('m-desc').textContent     = p.desc;

  // Sizes
  document.getElementById('m-sizes').innerHTML = SIZES.map(s => {
    const unavail = p.unavail.includes(s);
    return `<button
      class="sz-btn${unavail ? ' sz-unavail' : ''}"
      data-size="${s}"
      ${unavail ? 'disabled' : `onclick="selectModalSize(${s}, this)"`}
      title="${unavail ? 'Out of stock' : 'Size ' + s}"
    >${s}</button>`;
  }).join('');

  // Add to cart button reset
  document.getElementById('m-add-btn').disabled = true;
  document.getElementById('m-add-btn').innerHTML = `
    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
    Select a Size First`;

  // Gallery thumbnails
  const thumbsEl = document.getElementById('gallery-thumbs');
  thumbsEl.innerHTML = p.images.map((src, i) => `
    <div class="g-thumb-wrap">
      <div class="g-thumb ${i === 0 ? 'active' : ''}" data-idx="${i}" onclick="switchImage(${i})">
        <img src="${src}" alt="${p.angles[i]}"
          onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><rect fill=%22%23f7f2ec%22 width=%22100%22 height=%22100%22/><text x=%2250%25%22 y=%2256%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2228%22>👟</text></svg>'">
      </div>
      <span class="g-thumb-label">${p.angles[i].split(' ')[0]}</span>
    </div>
  `).join('');

  // Main image
  const mainImg = document.getElementById('gallery-main-img');
  mainImg.src = p.images[0] || '';
  mainImg.alt = p.name;
  mainImg.onerror = function() {
    this.src = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='500' height='500'><rect fill='%23f7f2ec' width='500' height='500'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='serif' font-size='80' fill='%23c8a97e'>👟</text></svg>`;
  };

  // Detect orientation for first image
  applyOrientation(p.images[0] || '');

  // Dots
  document.getElementById('gallery-dots').innerHTML = p.images.map((_, i) =>
    `<div class="g-dot${i===0?' active':''}" onclick="switchImage(${i})"></div>`
  ).join('');

  // Recommendations: other products
  buildRecs(id);

  // Setup zoom on main gallery image
  setupZoom();

  // Open modal
  document.getElementById('modal-backdrop').classList.add('open');
  document.body.style.overflow = 'hidden';
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

/* ── Detect image orientation and adjust gallery-main ── */
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

  // Remove old listeners by cloning
  const fresh = galleryMain.cloneNode(true);
  galleryMain.parentNode.replaceChild(fresh, galleryMain);

  // Re-wire arrow buttons (they were inside gallery-main)
  const prevBtn = fresh.querySelector('.gallery-arrow.prev');
  const nextBtn = fresh.querySelector('.gallery-arrow.next');
  if (prevBtn) { prevBtn.removeAttribute('onclick'); prevBtn.addEventListener('click', e => { e.stopPropagation(); galleryNav(-1); }); }
  if (nextBtn) { nextBtn.removeAttribute('onclick'); nextBtn.addEventListener('click', e => { e.stopPropagation(); galleryNav(1); }); }

  // Add zoom hint element
  if (!fresh.querySelector('.zoom-hint')) {
    const hint = document.createElement('div');
    hint.className = 'zoom-hint';
    hint.textContent = '🔍 Click to zoom';
    fresh.appendChild(hint);
  }

  // Track mouse position for zoom origin
  fresh.addEventListener('mousemove', e => {
    if (!fresh.classList.contains('zoomed')) return;
    const rect = fresh.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1) + '%';
    const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1) + '%';
    fresh.style.setProperty('--zoom-x', x);
    fresh.style.setProperty('--zoom-y', y);
  });

  fresh.addEventListener('click', e => {
    // Don't zoom if clicking arrows or dots
    if (e.target.closest('.gallery-arrow, .gallery-dots')) return;
    fresh.classList.toggle('zoomed');
    const img = fresh.querySelector('img');
    if (img) img.style.transformOrigin = '';
  });

  fresh.addEventListener('mouseleave', () => {
    fresh.classList.remove('zoomed');
  });
}

function resetZoom() {
  document.querySelector('.gallery-main')?.classList.remove('zoomed');
}

/* ── Image gallery controls ── */
function switchImage(idx) {
  if (!modalProduct) return;
  const mainEl    = document.querySelector('.gallery-main');
  const mainImg   = document.getElementById('gallery-main-img');
  const thumbs    = document.querySelectorAll('.g-thumb');
  const dots      = document.querySelectorAll('.g-dot');
  currentImgIndex = idx;

  // Reset zoom before switching
  if (mainEl) mainEl.classList.remove('zoomed');

  mainImg.classList.add('switching');
  setTimeout(() => {
    mainImg.src = modalProduct.images[idx];
    mainImg.classList.remove('switching');
    applyOrientation(modalProduct.images[idx]);
  }, 200);

  thumbs.forEach((t, i) => t.classList.toggle('active', i === idx));
  dots.forEach((d, i)   => d.classList.toggle('active', i === idx));
}

function galleryNav(dir) {
  if (!modalProduct) return;
  const next = (currentImgIndex + dir + modalProduct.images.length) % modalProduct.images.length;
  switchImage(next);
}

/* ── Size selector ── */
function selectModalSize(size, btn) {
  selectedSize = size;
  document.querySelectorAll('.sz-btn:not(.sz-unavail)').forEach(b => b.classList.remove('sz-selected'));
  btn.classList.add('sz-selected');

  const addBtn = document.getElementById('m-add-btn');
  addBtn.disabled = false;
  addBtn.innerHTML = `
    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
    Add to Cart`;
}

/* ── Add to cart from modal ── */
function modalAddToCart() {
  if (!modalProduct || !selectedSize) return;
  const p = modalProduct;
  const key = `${p.id}-${selectedSize}`;
  const existing = cart.find(i => i.key === key);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      key, id: p.id, name: p.name,
      price: `Rs. ${p.price.toLocaleString()}`,
      numPrice: p.price, size: selectedSize, qty: 1
    });
  }
  saveCart();
  showToast(`✓ ${p.name} · Size ${selectedSize} added!`);

  // Button feedback
  const addBtn = document.getElementById('m-add-btn');
  addBtn.innerHTML = `✓ Added to Cart!`;
  addBtn.style.background = '#388e3c';
  setTimeout(() => {
    addBtn.innerHTML = `
      <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
      Add to Cart`;
    addBtn.style.background = '';
  }, 2000);
}

function modalCheckout() {
  if (!selectedSize) {
    showToast('Please select a size first!');
    document.getElementById('size-label-el').style.color = '#c62828';
    setTimeout(() => document.getElementById('size-label-el').style.color = '', 1500);
    return;
  }
  modalAddToCart();
  closeModal();
  setTimeout(() => { window.location.href = 'checkout.html'; }, 400);
}

/* ── Recommendations ── */
function buildRecs(excludeId) {
  const recs = PRODUCTS.filter(p => p.id !== excludeId);
  const strip = document.getElementById('recs-strip');
  strip.innerHTML = recs.map(p => `
    <div class="rec-card" onclick="openModal(${p.id})">
      <img src="${p.images[0] || ''}" alt="${p.name}"
        onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><rect fill=%22%23f7f2ec%22 width=%22200%22 height=%22200%22/><text x=%2250%25%22 y=%2256%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2248%22>👟</text></svg>'">
      <div class="rec-card-body">
        <p class="rec-name">${p.name}</p>
        <p class="rec-price">Rs. ${p.price.toLocaleString()}</p>
      </div>
    </div>
  `).join('');
}

/* ════════════════════════════════════
   CART DRAWER
════════════════════════════════════ */
function toggleCart() {
  document.getElementById('cart-drawer').classList.toggle('open');
  document.getElementById('cart-backdrop-el').classList.toggle('open');
  document.body.classList.toggle('cart-open',
    document.getElementById('cart-drawer').classList.contains('open'));
}

function renderCartDrawer() {
  const itemsEl  = document.getElementById('cart-items-el');
  const footerEl = document.getElementById('cart-footer-el');

  if (!cart.length) {
    itemsEl.innerHTML = `
      <div class="cart-empty-el">
        <svg width="48" height="48" fill="none" stroke="#c8a97e" stroke-width="1.2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        <p>Your cart is empty</p>
      </div>`;
    footerEl.innerHTML = '';
    return;
  }

  itemsEl.innerHTML = cart.map(item => `
    <div class="cart-item-row">
      <div class="ci-info">
        <p class="ci-name">${item.name}</p>
        <p class="ci-meta">Size ${item.size} · ${item.price}</p>
      </div>
      <div class="ci-controls-el">
        <button class="qty-btn-el" onclick="updateQty('${item.key}', -1)">−</button>
        <span class="qty-num-el">${item.qty}</span>
        <button class="qty-btn-el" onclick="updateQty('${item.key}', 1)">+</button>
        <button class="ci-remove-btn" onclick="removeFromCart('${item.key}')">✕</button>
      </div>
    </div>
  `).join('');

  const total = cart.reduce((s, i) => s + i.numPrice * i.qty, 0);
  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  footerEl.innerHTML = `
    <div class="cart-footer-el">
      <div class="cart-total-el">
        <span>Total (${totalQty} item${totalQty !== 1 ? 's' : ''})</span>
        <span>Rs. ${total.toLocaleString()}</span>
      </div>
      <button class="checkout-btn-el" onclick="window.location.href='checkout.html'">Proceed to Checkout →</button>
      <button class="continue-btn-el" onclick="toggleCart()">Continue Shopping</button>
    </div>`;
}

function removeFromCart(key) {
  cart = cart.filter(i => i.key !== key);
  saveCart();
}

function updateQty(key, delta) {
  const item = cart.find(i => i.key === key);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.key !== key);
  saveCart();
}

/* ════════════════════════════════════
   TOAST
════════════════════════════════════ */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2800);
}

/* ════════════════════════════════════
   SEARCH (collection page)
════════════════════════════════════ */
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
  applyFilterSort();
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
    applyFilterSort();
    return;
  }

  tagsEl.style.display = 'none';

  const keywords = ['embroidered','gold','khussa','bridal','silk','leather',
                    'mirror','velvet','mojari','heritage','floral','royal','kundan','zari',
                    'blue','tan','classic','casual','traditional','punjabi','wedding',
                    'potli','clutch','bag','tassel','drawstring','satin'];

  const matched = PRODUCTS.filter(p => {
    const nameLower = p.name.toLowerCase();
    const descLower = p.desc.toLowerCase();
    const catLower  = p.categoryLabel.toLowerCase();
    return (
      nameLower.includes(q) ||
      descLower.includes(q) ||
      catLower.includes(q)  ||
      keywords.some(k => k.includes(q) && nameLower.includes(k.substring(0, 3)))
    );
  });

  if (matched.length === 0) {
    labelEl.textContent = `No results for "${q}" in collections`;
    listEl.innerHTML = `<div class="coll-search-empty">
      <svg width="48" height="48" fill="none" stroke="#c8a97e" stroke-width="1.2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <p>No juttis found for "<strong>${q}</strong>"</p>
      <button onclick="clearSearch()">Clear search</button>
    </div>`;
    renderGrid([]);
    return;
  }

  labelEl.textContent = `${matched.length} result${matched.length !== 1 ? 's' : ''} found`;
  listEl.innerHTML = matched.map(p => `
    <div class="search-result-item" onclick="closeSearch(); openModal(${p.id})">
      <div class="sri-left">
        <span class="sri-name">${p.name}</span>
        <span class="sri-badge sri-badge-index">${p.categoryLabel}</span>
      </div>
      <span class="sri-price">Rs. ${p.price.toLocaleString()}</span>
    </div>`).join('');

  renderGrid(matched);
}

function clearSearch() {
  document.getElementById('search-input').value = '';
  closeSearch();
}

/* ════════════════════════════════════
   KEYBOARD & INIT
════════════════════════════════════ */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeSearch();
});

function subscribeNewsletter() {
  const el = document.getElementById('newsletter-email');
  if (el && el.value.includes('@')) {
    showToast('Subscribed! Welcome to the JUtti family 🎉');
    el.value = '';
  } else {
    showToast('Please enter a valid email address.');
  }
}

/* ════════════════════════════════════
   INIT
════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Read images from HTML into PRODUCTS data
  syncImagesFromHTML();

  // 2. Initial render (show all, default sort)
  applyFilterSort();
  updateBadge();
  renderCartDrawer();

  // hamburger menu (mobile)
  document.getElementById('menu-toggle').addEventListener('click', () => {
    document.querySelector('.nav-links').style.display =
      document.querySelector('.nav-links').style.display === 'flex' ? 'none' : 'flex';
  });

  // Auto-open search from ?q= URL param
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');
  if (q && q.trim()) {
    setTimeout(() => {
      const input = document.getElementById('search-input');
      if (input) {
        input.value = q.trim();
        openSearch();
        doSearch();
      }
    }, 200);
  }
});