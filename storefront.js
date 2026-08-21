/* ============================================================
   APP LOGIC — hash router + render functions.
   Everything here is client-side only (no backend). Cart/wishlist
   state lives in memory for this session, matching brief section
   3.1 features at prototype fidelity.
   ============================================================ */

const NAV_LINKS = [
  { href: '#home', label: 'Home' },
  { href: '#catalogue', label: 'Shop All' },
  { href: '#catalogue?cat=Duvets', label: 'Duvets' },
  { href: '#catalogue?cat=Linen%20Sets', label: 'Linen' },
  { href: '#contact', label: 'Contact' },
];

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(STATE.toastTimer);
  STATE.toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
}

function fmtR(n) { return 'R' + n.toLocaleString('en-ZA'); }

function stars(rating) {
  const full = Math.round(rating);
  let s = '';
  for (let i = 0; i < 5; i++) s += i < full ? '★' : '☆';
  return s;
}

/* ---------------- routing ---------------- */
function parseHash() {
  let hash = location.hash.replace(/^#/, '') || 'home';
  let [path, qs] = hash.split('?');
  const params = new URLSearchParams(qs || '');
  return { path, params };
}

function navigate(hash) { location.hash = hash; window.scrollTo({ top: 0, behavior: 'smooth' }); }

function render() {
  const { path, params } = parseHash();
  const app = document.getElementById('app');
  let html = '';

  if (path === 'home') html = renderHome();
  else if (path === 'catalogue') html = renderCatalogue(params);
  else if (path.startsWith('product/')) html = renderProduct(parseInt(path.split('/')[1], 10));
  else if (path === 'cart') html = renderCart();
  else if (path === 'checkout') html = renderCheckout();
  else if (path === 'order-confirmation') html = renderOrderConfirmation();
  else if (path === 'track') html = renderTrack();
  else if (path === 'contact') html = renderContact();
  else if (path === 'returns') html = renderReturns();
  else if (path === 'wishlist') html = renderWishlist();
  else if (path === 'account') html = renderAccount();
  else if (path === 'faq') html = renderFAQ();
  else if (path.startsWith('legal/')) html = renderLegal(path.split('/')[1]);
  else html = renderNotFound();

  app.innerHTML = html;
  renderMainNav(path);
  updateBadges();
  window.__afterRender && window.__afterRender();
  window.__afterRender = null;
}

function renderMainNav(path) {
  const nav = document.getElementById('main-nav');
  nav.innerHTML = NAV_LINKS.map(l => {
    const active = (l.href === '#home' && path === 'home') || (l.href.startsWith('#catalogue') && path === 'catalogue' && l.href.includes('cat=') === false && !location.hash.includes('cat=')) || (l.href === '#contact' && path === 'contact');
    return `<a href="${l.href}" class="${path === l.href.replace('#','').split('?')[0] ? 'active' : ''}">${l.label}</a>`;
  }).join('');
}

function updateBadges() {
  const cartCount = STATE.cart.reduce((s, l) => s + l.qty, 0);
  const cb = document.getElementById('cart-badge');
  cb.textContent = cartCount; cb.style.display = cartCount ? 'flex' : 'none';
  const wb = document.getElementById('wishlist-badge');
  wb.textContent = STATE.wishlist.size; wb.style.display = STATE.wishlist.size ? 'flex' : 'none';
}

window.addEventListener('hashchange', render);
window.addEventListener('DOMContentLoaded', () => {
  render();
  if (STATE.cookieChoice === null) {
    setTimeout(() => { document.getElementById('cookie-banner').style.display = 'flex'; }, 500);
  }
});

/* ---------------- cookie banner ---------------- */
function handleCookie(acceptAll) {
  STATE.cookieChoice = acceptAll ? 'all' : 'essential';
  closeCookieBanner();
  toast(acceptAll ? 'Cookie preferences saved — all cookies accepted.' : 'Cookie preferences saved — only essential cookies will be used.');
}
function closeCookieBanner() { document.getElementById('cookie-banner').style.display = 'none'; }

/* ---------------- search ---------------- */
function doSearch() {
  const q = document.getElementById('search-input').value.trim();
  navigate('#catalogue' + (q ? '?q=' + encodeURIComponent(q) : ''));
}

/* ---------------- cart logic ---------------- */
function addToCart(productId, size, colour, qty) {
  qty = qty || 1;
  const existing = STATE.cart.find(l => l.productId === productId && l.size === size && l.colour === colour);
  if (existing) existing.qty += qty;
  else STATE.cart.push({ productId, size, colour, qty });
  updateBadges();
  toast('Added to cart');
}
function removeCartLine(idx) { STATE.cart.splice(idx, 1); render(); }
function changeCartQty(idx, delta) {
  STATE.cart[idx].qty = Math.max(1, STATE.cart[idx].qty + delta);
  render();
}
function cartLinesResolved() {
  return STATE.cart.map((l, idx) => ({ ...l, idx, product: PRODUCTS.find(p => p.id === l.productId) }));
}
function cartSubtotal() {
  return cartLinesResolved().reduce((sum, l) => sum + l.product.price * l.qty, 0);
}

/* ---------------- wishlist ---------------- */
function toggleWishlist(id) {
  if (STATE.wishlist.has(id)) STATE.wishlist.delete(id); else STATE.wishlist.add(id);
  updateBadges();
  const btn = document.querySelector(`[data-wish="${id}"]`);
  if (btn) btn.classList.toggle('active');
}

/* ================================================================
   PAGE RENDERERS
   ================================================================ */

function renderHome() {
  const featured = PRODUCTS.filter(p => p.featured).slice(0, 8);
  return `
  <section class="hero">
    <div class="container hero-grid">
      <div>
        <h1>Bedding that feels like a soft landing, every night.</h1>
        <p class="lead">Duvets, linen, pillows and protectors — sourced from trusted South African suppliers, delivered to your door with card or cash on arrival.</p>
        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:22px;">
          <a href="#catalogue" class="btn btn-primary">Shop the range</a>
          <a href="#track" class="btn btn-outline">Track an order</a>
        </div>
        <div class="hero-badges">
          <span class="hero-badge">🚚 Cash / Card on delivery</span>
          <span class="hero-badge">🔒 Secure online payment</span>
          <span class="hero-badge">↩ Easy returns</span>
        </div>
      </div>
      <div class="hero-art">
        <div class="blob" style="width:220px;height:220px;top:-40px;right:-40px;"></div>
        <div class="blob" style="width:140px;height:140px;bottom:-30px;left:-20px;"></div>
      </div>
    </div>
  </section>

  <section class="container">
    <div class="promo-strip">
      <div class="promo-card"><b>Sale</b> — up to 20% off select duvets this week only.</div>
      <div class="promo-card"><b>New in</b> — Kids Bedding collection just landed.</div>
      <div class="promo-card"><b>Free delivery</b> over R999 in Joburg, Cape Town &amp; Durban metros.</div>
    </div>
  </section>

  <section class="section container">
    <div class="section-head">
      <h2>Shop by category</h2>
    </div>
    <div class="cat-row">
      ${CATEGORIES.map(c => `
        <a class="cat-chip" href="#catalogue?cat=${encodeURIComponent(c.name)}">
          <div class="cat-icon">${svgIcon(c.icon, 44)}</div>
          ${c.name}
        </a>`).join('')}
    </div>
  </section>

  <section class="section container">
    <div class="section-head">
      <h2>Featured products</h2>
      <p><a href="#catalogue">View all →</a></p>
    </div>
    <div class="product-grid">
      ${featured.map(productCard).join('')}
    </div>
  </section>

  <section class="section container two-col">
    <div class="form-card" style="background:var(--cream-deep);border:none;">
      <h3>How delivery works</h3>
      <p class="small-note">At launch, orders are manually assigned to a local e-hailing or courier partner by our team. Phase 2 will add live courier API integration for automatic dispatch.</p>
      <div class="badge-strip" style="margin-top:16px;">
        <span>${svgIcon('truck',18)} Local courier partners</span>
        <span>${svgIcon('shield',18)} PCI-DSS compliant payments</span>
        <span>${svgIcon('leaf',18)} POPIA-aligned data handling</span>
      </div>
    </div>
    <div class="form-card" style="background:var(--cream-deep);border:none;">
      <h3>Pay your way</h3>
      <p class="small-note">Pay online by card / instant EFT through a South African payment gateway, or choose Cash on Delivery / Card on Delivery — you decide at checkout.</p>
      <a href="#catalogue" class="btn btn-secondary btn-sm">Start shopping</a>
    </div>
  </section>
  `;
}

function productCard(p) {
  const wished = STATE.wishlist.has(p.id);
  const stockFlag = p.stock === 0 ? `<span class="stock-flag out">Out of stock</span>` : (p.stock <= 3 ? `<span class="stock-flag low">Only ${p.stock} left</span>` : `<span class="stock-flag in">In stock</span>`);
  return `
  <div class="product-card">
    <div class="product-thumb">
      ${productImage(p)}
      <button class="wishlist-btn ${wished ? 'active' : ''}" data-wish="${p.id}" onclick="toggleWishlist(${p.id})" aria-label="Toggle wishlist">${svgIcon('heart', 18)}</button>
      ${stockFlag}
    </div>
    <div class="product-body">
      <div class="product-cat">${p.category}</div>
      <div class="product-name"><a href="#product/${p.id}">${p.name}</a></div>
      <div class="stars">${stars(p.rating)} <span class="small-note">(${p.reviewCount})</span></div>
      <div class="product-price-row">
        <div class="price">${p.wasPrice ? `<span class="was">${fmtR(p.wasPrice)}</span>` : ''}${fmtR(p.price)}</div>
        <button class="btn btn-ghost btn-sm" ${p.stock === 0 ? 'disabled' : ''} onclick="quickAdd(${p.id})">Add</button>
      </div>
    </div>
  </div>`;
}

function quickAdd(id) {
  const p = PRODUCTS.find(x => x.id === id);
  addToCart(id, p.sizes[0], p.colours[0].name, 1);
}

function renderCatalogue(params) {
  const cat = params.get('cat') || '';
  const q = (params.get('q') || '').toLowerCase();
  let list = PRODUCTS.slice();
  if (cat) list = list.filter(p => p.category === cat);
  if (q) list = list.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));

  const sort = params.get('sort') || 'featured';
  if (sort === 'price-asc') list.sort((a,b) => a.price - b.price);
  else if (sort === 'price-desc') list.sort((a,b) => b.price - a.price);
  else if (sort === 'rating') list.sort((a,b) => b.rating - a.rating);

  const maxPrice = params.get('maxPrice') || '';
  if (maxPrice) list = list.filter(p => p.price <= parseInt(maxPrice, 10));

  const selMaterials = (params.get('material') || '').split(',').filter(Boolean);
  if (selMaterials.length) list = list.filter(p => selMaterials.includes(p.material));

  const setParam = (key, val) => {
    const p2 = new URLSearchParams(params);
    if (val) p2.set(key, val); else p2.delete(key);
    return '#catalogue?' + p2.toString();
  };

  return `
  <section class="section container">
    <div class="crumbs"><a href="#home">Home</a> / ${cat ? cat : (q ? `Search: "${q}"` : 'Shop all')}</div>
    <div class="section-head">
      <h2>${cat || (q ? `Results for "${q}"` : 'Shop all bedding')}</h2>
    </div>
    <div class="catalogue-layout">
      <aside class="filter-panel">
        <div class="filter-group">
          <h4>Category</h4>
          ${CATEGORIES.map(c => `<div class="filter-option"><label style="display:flex;gap:8px;align-items:center;width:100%;cursor:pointer;"><input type="radio" name="fcat" ${cat===c.name?'checked':''} onchange="location.hash='${setParam('cat', c.name)}'"> ${c.name}</label></div>`).join('')}
          <div class="filter-option"><label style="display:flex;gap:8px;align-items:center;width:100%;cursor:pointer;"><input type="radio" name="fcat" ${!cat?'checked':''} onchange="location.hash='${setParam('cat','')}'"> All categories</label></div>
        </div>
        <div class="filter-group">
          <h4>Max price</h4>
          <div class="range-row">
            <span>R0</span>
            <input type="range" min="200" max="1500" step="50" value="${maxPrice || 1500}" oninput="this.nextElementSibling.textContent='R'+this.value" onchange="location.hash='${'#catalogue'}?'+updateParam(event.target.value)">
            <span>${maxPrice ? fmtR(parseInt(maxPrice,10)) : 'R1500'}</span>
          </div>
          <button class="btn btn-ghost btn-sm" style="margin-top:8px;" onclick="applyMaxPrice()">Apply</button>
          <input type="hidden" id="maxprice-hidden" value="${maxPrice}">
        </div>
        <div class="filter-group">
          <h4>Material</h4>
          ${MATERIALS.map(m => `<div class="filter-option"><label style="display:flex;gap:8px;align-items:center;width:100%;cursor:pointer;"><input type="checkbox" ${selMaterials.includes(m)?'checked':''} onchange="toggleMaterialFilter('${m}')"> ${m}</label></div>`).join('')}
        </div>
        <div class="filter-group">
          <h4>Colour</h4>
          <div class="swatch-row">
            ${COLOURS.map(c => `<div class="colour-dot" title="${c.name}" style="background:${c.hex};"></div>`).join('')}
          </div>
          <p class="small-note" style="margin-top:8px;">Colour filtering shown for illustration — narrow by size/colour on each product page.</p>
        </div>
      </aside>
      <div>
        <div class="results-bar">
          <span class="small-note">${list.length} product${list.length===1?'':'s'}</span>
          <select class="sort-select" onchange="location.hash='${'#catalogue'}?'+updateSort(this.value)">
            <option value="featured" ${sort==='featured'?'selected':''}>Sort: Featured</option>
            <option value="price-asc" ${sort==='price-asc'?'selected':''}>Price: Low to High</option>
            <option value="price-desc" ${sort==='price-desc'?'selected':''}>Price: High to Low</option>
            <option value="rating" ${sort==='rating'?'selected':''}>Highest Rated</option>
          </select>
        </div>
        <div class="product-grid">
          ${list.length ? list.map(productCard).join('') : `<div class="empty-state">No products match those filters yet. <br><a href="#catalogue">Clear filters</a></div>`}
        </div>
      </div>
    </div>
  </section>`;
}

// helpers used by inline catalogue filter controls (kept simple for a prototype)
function updateParam(val) {
  const { params } = parseHash();
  params.set('maxPrice', val);
  return params.toString();
}
function applyMaxPrice() {
  const { params } = parseHash();
  const val = document.querySelector('.range-row input[type=range]').value;
  params.set('maxPrice', val);
  navigate('#catalogue?' + params.toString());
}
function updateSort(val) {
  const { params } = parseHash();
  params.set('sort', val);
  return params.toString();
}
function toggleMaterialFilter(m) {
  const { params } = parseHash();
  let list = (params.get('material') || '').split(',').filter(Boolean);
  if (list.includes(m)) list = list.filter(x => x !== m); else list.push(m);
  if (list.length) params.set('material', list.join(',')); else params.delete('material');
  navigate('#catalogue?' + params.toString());
}

function renderProduct(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return renderNotFound();
  const related = PRODUCTS.filter(x => x.category === p.category && x.id !== p.id).slice(0, 4);
  window.__pdpState = { size: p.sizes[0], colour: p.colours[0].name, qty: 1, tab: 'description' };

  window.__afterRender = () => {};

  return `
  <section class="section container">
    <div class="crumbs"><a href="#home">Home</a> / <a href="#catalogue?cat=${encodeURIComponent(p.category)}">${p.category}</a> / ${p.name}</div>
    <div class="pdp-grid">
      <div>
        <div class="pdp-gallery-main" id="pdp-main-image">${productImage(p, true, 0)}</div>
        <div class="pdp-thumbs">
          ${(p.images && p.images.length ? p.images.map((_,i)=>i) : [0,1,2]).map(i => `<div class="pdp-thumb ${i===0?'active':''}" onclick="selectPdpGalleryImage(${p.id},${i},this)">${productImage(p, false, i)}</div>`).join('')}
        </div>
      </div>
      <div class="pdp-info">
        <div class="product-cat">${p.category} · sold by ${p.supplier}</div>
        <h1>${p.name}</h1>
        <div class="stars">${stars(p.rating)} <span class="small-note">${p.rating} (${p.reviewCount} reviews)</span></div>
        <div class="pdp-price">${p.wasPrice ? `<span class="was" style="font-size:.6em;">${fmtR(p.wasPrice)}</span> ` : ''}${fmtR(p.price)}</div>
        <div>${p.stock === 0 ? `<span class="stock-flag out" style="position:static;">Out of stock</span>` : p.stock <= 3 ? `<span class="stock-flag low" style="position:static;">Only ${p.stock} left in stock</span>` : `<span class="stock-flag in" style="position:static;">In stock</span>`}</div>

        <div class="option-group">
          <h4>Size</h4>
          <div class="swatch-row" id="size-row">
            ${p.sizes.map((s,i) => `<div class="swatch ${i===0?'selected':''}" onclick="selectPdpOption('size','${s}',this)">${s}</div>`).join('')}
          </div>
        </div>
        <div class="option-group">
          <h4>Colour</h4>
          <div class="swatch-row" id="colour-row">
            ${p.colours.map((c,i) => `<div class="colour-dot ${i===0?'selected':''}" title="${c.name}" style="background:${c.hex};" onclick="selectPdpOption('colour','${c.name}',this)"></div>`).join('')}
          </div>
        </div>
        <div class="qty-row">
          <div class="qty-stepper">
            <button onclick="pdpQty(-1)">−</button><span id="pdp-qty">1</span><button onclick="pdpQty(1)">+</button>
          </div>
          <span class="small-note">${p.material}</span>
        </div>
        <div class="pdp-actions">
          <button class="btn btn-primary" ${p.stock===0?'disabled':''} onclick="pdpAddToCart(${p.id})">Add to cart</button>
          <button class="btn btn-outline" ${p.stock===0?'disabled':''} onclick="pdpAddToCart(${p.id});navigate('#checkout')">Buy now</button>
          <button class="wishlist-btn ${STATE.wishlist.has(p.id)?'active':''}" data-wish="${p.id}" onclick="toggleWishlist(${p.id})" style="position:static;">${svgIcon('heart',18)}</button>
        </div>
        <div class="pdp-meta-list">
          <div><span>Material</span><span>${p.material}</span></div>
          <div><span>Supplier</span><span>${p.supplier}</span></div>
          <div><span>Delivery</span><span>Assigned to local courier/e-hailing partner after confirmation</span></div>
          <div><span>Returns</span><span><a href="#returns">7-day cooling-off period</a> applies</span></div>
        </div>
      </div>
    </div>

    <div class="tabs">
      <div class="tab-btn active" id="tab-description-btn" onclick="switchTab('description')">Description</div>
      <div class="tab-btn" id="tab-reviews-btn" onclick="switchTab('reviews')">Reviews (${p.reviewCount})</div>
    </div>
    <div id="tab-description">
      <p style="max-width:680px;">${p.description}</p>
    </div>
    <div id="tab-reviews" style="display:none;max-width:680px;">
      <div style="margin-bottom:20px;">
        <h4>Write a review</h4>
        <div class="rating-input" id="review-stars">${[1,2,3,4,5].map(n=>`<span onclick="setReviewStars(${n})" data-n="${n}">☆</span>`).join('')}</div>
        <textarea id="review-text" placeholder="Share your experience with this product…" style="width:100%;border:1px solid var(--line);border-radius:8px;padding:10px;margin-top:8px;min-height:70px;"></textarea>
        <button class="btn btn-secondary btn-sm" style="margin-top:8px;" onclick="submitReview('${p.name}')">Submit review</button>
      </div>
      ${REVIEWS.map(r => `
        <div class="review">
          <div class="stars">${stars(r.rating)}</div>
          <div class="who">${r.who} <span class="when">· ${r.when}</span></div>
          <p style="margin-top:6px;">${r.text}</p>
        </div>`).join('')}
      <div id="new-reviews"></div>
    </div>

    <section class="section" style="padding-top:20px;">
      <div class="section-head"><h2>You may also like</h2></div>
      <div class="product-grid">${related.map(productCard).join('')}</div>
    </section>
  </section>`;
}

function selectPdpGalleryImage(productId, idx, el) {
  const p = PRODUCTS.find(x => x.id === productId);
  document.getElementById('pdp-main-image').innerHTML = productImage(p, true, idx);
  el.parentElement.querySelectorAll('.pdp-thumb').forEach(n => n.classList.remove('active'));
  el.classList.add('active');
}
function selectPdpOption(key, value, el) {
  window.__pdpState[key] = value;
  el.parentElement.querySelectorAll(key === 'size' ? '.swatch' : '.colour-dot').forEach(n => n.classList.remove('selected'));
  el.classList.add('selected');
}
function pdpQty(delta) {
  window.__pdpState.qty = Math.max(1, window.__pdpState.qty + delta);
  document.getElementById('pdp-qty').textContent = window.__pdpState.qty;
}
function pdpAddToCart(id) {
  const s = window.__pdpState;
  addToCart(id, s.size, s.colour, s.qty);
}
function switchTab(tab) {
  document.getElementById('tab-description').style.display = tab === 'description' ? 'block' : 'none';
  document.getElementById('tab-reviews').style.display = tab === 'reviews' ? 'block' : 'none';
  document.getElementById('tab-description-btn').classList.toggle('active', tab === 'description');
  document.getElementById('tab-reviews-btn').classList.toggle('active', tab === 'reviews');
}
let __reviewStars = 0;
function setReviewStars(n) {
  __reviewStars = n;
  document.querySelectorAll('#review-stars span').forEach(s => {
    s.textContent = parseInt(s.dataset.n, 10) <= n ? '★' : '☆';
    s.classList.toggle('on', parseInt(s.dataset.n, 10) <= n);
  });
}
function submitReview(productName) {
  const text = document.getElementById('review-text').value.trim();
  if (!__reviewStars || !text) { toast('Add a star rating and a comment first'); return; }
  document.getElementById('new-reviews').insertAdjacentHTML('afterbegin', `
    <div class="review"><div class="stars">${stars(__reviewStars)}</div><div class="who">You <span class="when">· just now</span></div><p style="margin-top:6px;">${text}</p></div>`);
  document.getElementById('review-text').value = '';
  setReviewStars(0);
  toast('Thanks — your review has been submitted for moderation');
}

function renderCart() {
  const lines = cartLinesResolved();
  if (!lines.length) {
    return `<section class="section container">
      <div class="empty-state">
        <h2>Your cart is empty</h2>
        <p>Find something cosy to add.</p>
        <a href="#catalogue" class="btn btn-primary">Browse products</a>
      </div>
    </section>`;
  }
  const subtotal = cartSubtotal();
  return `
  <section class="section container">
    <h2>Your cart</h2>
    <div class="cart-layout">
      <div>
        ${lines.map(l => `
          <div class="cart-line">
            <div class="cart-thumb">${productImage(l.product)}</div>
            <div>
              <div class="cart-line-name"><a href="#product/${l.product.id}">${l.product.name}</a></div>
              <div class="cart-line-meta">${l.size} · ${l.colour}</div>
              <div class="qty-stepper" style="margin-top:8px;">
                <button onclick="changeCartQty(${l.idx},-1)">−</button><span>${l.qty}</span><button onclick="changeCartQty(${l.idx},1)">+</button>
              </div>
              <a class="remove-link" onclick="removeCartLine(${l.idx})">Remove</a>
            </div>
            <div class="cart-line-price">${fmtR(l.product.price * l.qty)}</div>
          </div>`).join('')}
        <a href="#catalogue" class="btn btn-ghost btn-sm" style="margin-top:16px;">← Continue shopping</a>
      </div>
      <div class="summary-card">
        <h3>Order summary</h3>
        <div class="promo-input-row">
          <input type="text" placeholder="Promo code">
          <button class="btn btn-ghost btn-sm" onclick="toast('Promo codes are validated at checkout')">Apply</button>
        </div>
        <div class="summary-row"><span>Subtotal</span><span>${fmtR(subtotal)}</span></div>
        <div class="summary-row"><span>Delivery</span><span>Calculated at checkout</span></div>
        <div class="summary-row total"><span>Estimated total</span><span>${fmtR(subtotal)}</span></div>
        <a href="#checkout" class="btn btn-primary btn-block" style="margin-top:10px;">Proceed to checkout</a>
        <p class="small-note" style="margin-top:12px;">Guest checkout available — no account required.</p>
      </div>
    </div>
  </section>`;
}

function renderWishlist() {
  const items = PRODUCTS.filter(p => STATE.wishlist.has(p.id));
  return `<section class="section container">
    <h2>Your wishlist</h2>
    ${items.length ? `<div class="product-grid">${items.map(productCard).join('')}</div>` : `<div class="empty-state">No items saved yet. <a href="#catalogue">Browse products</a></div>`}
  </section>`;
}

let __checkoutState = { zone: DELIVERY_ZONES[0].zone, payment: 'gateway', guest: true, accepted: false };
function renderCheckout() {
  const lines = cartLinesResolved();
  if (!lines.length) {
    return `<section class="section container"><div class="empty-state"><h2>Your cart is empty</h2><a href="#catalogue" class="btn btn-primary">Browse products</a></div></section>`;
  }
  const subtotal = cartSubtotal();
  const zoneObj = DELIVERY_ZONES.find(z => z.zone === __checkoutState.zone) || DELIVERY_ZONES[0];
  const total = subtotal + zoneObj.fee;

  return `
  <section class="section container">
    <h2>Checkout</h2>
    <div class="cart-layout">
      <div>
        <div class="form-card" style="margin-bottom:20px;">
          <h3>Contact &amp; account</h3>
          <div class="radio-card ${__checkoutState.guest?'selected':''}"><input type="radio" name="acct" ${__checkoutState.guest?'checked':''} onchange="setCheckout('guest',true)"><div><div class="title">Continue as guest</div><div class="desc">Check out quickly — no account needed. We'll email your order confirmation.</div></div></div>
          <div class="radio-card ${!__checkoutState.guest?'selected':''}"><input type="radio" name="acct" ${!__checkoutState.guest?'checked':''} onchange="setCheckout('guest',false)"><div><div class="title">Log in / create account</div><div class="desc">Save your addresses and view order history next time.</div></div></div>
          <div class="form-row"><label>Email address</label><input type="email" placeholder="you@email.com" required></div>
          <div class="form-row"><label>Mobile number (for delivery &amp; WhatsApp updates)</label><input type="tel" placeholder="082 000 0000" required></div>
        </div>

        <div class="form-card" style="margin-bottom:20px;">
          <h3>Delivery address</h3>
          <div class="form-grid-2">
            <div class="form-row"><label>Full name</label><input type="text" required></div>
            <div class="form-row"><label>Suburb</label><input type="text" required></div>
          </div>
          <div class="form-row"><label>Street address</label><input type="text" required></div>
          <div class="form-grid-2">
            <div class="form-row"><label>City</label><input type="text" required></div>
            <div class="form-row"><label>Postal code</label><input type="text" required></div>
          </div>
          <div class="form-row">
            <label>Delivery zone (for delivery fee estimate)</label>
            <select onchange="setCheckout('zone', this.value)">
              ${DELIVERY_ZONES.map(z => `<option value="${z.zone}" ${z.zone===__checkoutState.zone?'selected':''}>${z.zone} — ${fmtR(z.fee)} (${z.eta})</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="form-card">
          <h3>Payment method</h3>
          <div class="radio-card ${__checkoutState.payment==='gateway'?'selected':''}">
            <input type="radio" name="pay" ${__checkoutState.payment==='gateway'?'checked':''} onchange="setCheckout('payment','gateway')">
            <div><div class="title">Pay online now</div><div class="desc">Card, Instant EFT via a South African payment gateway (e.g. PayFast / Yoco / Ozow / PayGate). Hosted, PCI-DSS compliant — LALA Comforts never sees your card details.</div></div>
          </div>
          <div class="radio-card ${__checkoutState.payment==='cod'?'selected':''}">
            <input type="radio" name="pay" ${__checkoutState.payment==='cod'?'checked':''} onchange="setCheckout('payment','cod')">
            <div><div class="title">Cash on Delivery</div><div class="desc">Pay the courier in cash when your order arrives.</div></div>
          </div>
          <div class="radio-card ${__checkoutState.payment==='cardod'?'selected':''}">
            <input type="radio" name="pay" ${__checkoutState.payment==='cardod'?'checked':''} onchange="setCheckout('payment','cardod')">
            <div><div class="title">Card on Delivery</div><div class="desc">Tap or insert your card on the driver's mobile card machine on arrival.</div></div>
          </div>
        </div>
      </div>

      <div class="summary-card">
        <h3>Order summary</h3>
        ${lines.map(l => `<div class="summary-row"><span>${l.product.name} × ${l.qty}</span><span>${fmtR(l.product.price*l.qty)}</span></div>`).join('')}
        <div class="summary-row"><span>Subtotal</span><span>${fmtR(subtotal)}</span></div>
        <div class="summary-row"><span>Delivery (${zoneObj.zone})</span><span>${fmtR(zoneObj.fee)}</span></div>
        <div class="summary-row total"><span>Total</span><span>${fmtR(total)}</span></div>

        <div class="checkbox-row">
          <input type="checkbox" id="accept-terms" ${__checkoutState.accepted?'checked':''} onchange="setCheckout('accepted', this.checked)">
          <label for="accept-terms">I have read and accept the <a href="#legal/terms" style="text-decoration:underline;">Terms &amp; Conditions</a> and <a href="#legal/returns-policy" style="text-decoration:underline;">Returns Policy</a>.</label>
        </div>
        <div class="notice-box info">Full price and delivery cost are shown above before you finalise your order, as required under the ECT Act. Online orders qualify for a 7-day cooling-off period under the Consumer Protection Act — details are included on your order confirmation.</div>

        <button class="btn btn-primary btn-block" ${!__checkoutState.accepted?'disabled':''} onclick="placeOrder()">Place order — ${fmtR(total)}</button>
      </div>
    </div>
  </section>`;
}
function setCheckout(key, val) { __checkoutState[key] = val; render(); }
function placeOrder() {
  if (!__checkoutState.accepted) return;
  STATE.cart = [];
  updateBadges();
  navigate('#order-confirmation');
}

function renderOrderConfirmation() {
  return `<section class="section container">
    <div class="form-card" style="max-width:640px;margin:0 auto;text-align:center;">
      <div style="color:var(--ok);margin-bottom:8px;">${svgIcon('shield', 44)}</div>
      <h2>Thank you — your order is confirmed!</h2>
      <p>Order reference <b>${SAMPLE_ORDER.id}</b>. A confirmation has been sent by email and WhatsApp/SMS.</p>
      <div class="notice-box">You have a <b>7-day cooling-off period</b> from today to cancel this order under the Consumer Protection Act, since it was placed online. See our <a href="#legal/returns-policy" style="text-decoration:underline;">Returns Policy</a> for how to request a cancellation or return.</div>
      <div style="display:flex;gap:12px;justify-content:center;margin-top:16px;flex-wrap:wrap;">
        <a href="#track" class="btn btn-primary">Track this order</a>
        <a href="#catalogue" class="btn btn-outline">Continue shopping</a>
      </div>
    </div>
  </section>`;
}

const TRACK_STEPS = ['Order placed', 'Confirmed', 'Out for delivery', 'Delivered'];
function renderTrack() {
  return `<section class="section container">
    <h2>Track your order</h2>
    <div class="form-card" style="max-width:720px;">
      <div class="form-grid-2">
        <div class="form-row"><label>Order reference</label><input type="text" value="${SAMPLE_ORDER.id}"></div>
        <div class="form-row"><label>Email or mobile used at checkout</label><input type="text" placeholder="you@email.com"></div>
      </div>
      <button class="btn btn-secondary" onclick="toast('Showing sample order '+SAMPLE_ORDER.id+' for demo purposes')">Track order</button>

      <div class="tracker">
        ${TRACK_STEPS.map((s,i) => `
          <div class="tracker-step ${i < SAMPLE_ORDER.status ? 'done' : i===SAMPLE_ORDER.status ? 'current' : ''}">
            <div class="dot">${i < SAMPLE_ORDER.status ? '✓' : i+1}</div>
            <div class="tracker-label">${s}</div>
          </div>`).join('')}
      </div>
      <p class="tracker-sub">Placed ${SAMPLE_ORDER.placedAt} · Assigned to ${SAMPLE_ORDER.driver}</p>

      <div style="margin-top:20px;">
        <h4 style="font-size:.9em;text-transform:uppercase;letter-spacing:.04em;">Order items</h4>
        ${SAMPLE_ORDER.items.map(i => `<div class="summary-row"><span>${i.name} × ${i.qty}</span><span>${fmtR(i.price*i.qty)}</span></div>`).join('')}
        <div class="summary-row"><span>Delivery</span><span>${fmtR(SAMPLE_ORDER.deliveryFee)}</span></div>
      </div>
    </div>
  </section>`;
}

function renderContact() {
  return `<section class="section container">
    <h2>Contact &amp; support</h2>
    <div class="two-col">
      <div class="form-card">
        <h3>Send us a message</h3>
        <div class="form-row"><label>Name</label><input type="text" required></div>
        <div class="form-row"><label>Email</label><input type="email" required></div>
        <div class="form-row"><label>Order reference (optional)</label><input type="text"></div>
        <div class="form-row"><label>Message</label><textarea placeholder="How can we help?"></textarea></div>
        <button class="btn btn-primary" onclick="toast('Thanks — our support team will reply within 1 business day')">Send message</button>
      </div>
      <div>
        <div class="form-card" style="margin-bottom:16px;">
          <h3>Chat with us</h3>
          <p class="small-note">Fastest way to reach us — usually within minutes during business hours.</p>
          <a class="btn btn-secondary" href="https://wa.me/27000000000" target="_blank" rel="noopener">${svgIcon('truck',16)} Chat on WhatsApp</a>
        </div>
        <div class="form-card">
          <h3>Other ways to reach us</h3>
          <p style="margin-bottom:4px;"><b>Email:</b> support@lalacomforts.co.za</p>
          <p style="margin-bottom:4px;"><b>Phone:</b> +27 00 000 0000</p>
          <p style="margin-bottom:4px;"><b>Hours:</b> Mon–Fri 8am–5pm, Sat 9am–1pm (SAST)</p>
          <p class="small-note" style="margin-top:10px;">LALA Comforts (Pty) Ltd · Reg. No. 2026/000000/07 (placeholder) · 12 Comfort Lane, Sandton, Johannesburg, 2196</p>
        </div>
      </div>
    </div>
  </section>`;
}

function renderReturns() {
  return `<section class="section container">
    <h2>Returns &amp; exchange request</h2>
    <p class="small-note" style="max-width:640px;">Read our <a href="#legal/returns-policy" style="text-decoration:underline;">Returns Policy</a> before submitting. Online orders qualify for a 7-day cooling-off period under the Consumer Protection Act.</p>
    <div class="form-card" style="max-width:640px;margin-top:16px;">
      <div class="form-row"><label>Order reference</label><input type="text" placeholder="LALA-2026XXXX" required></div>
      <div class="form-row"><label>Item(s) to return/exchange</label><input type="text" required></div>
      <div class="form-row">
        <label>Reason</label>
        <select>
          <option>Changed my mind (within cooling-off period)</option>
          <option>Item arrived damaged</option>
          <option>Wrong item received</option>
          <option>Size/colour exchange</option>
          <option>Other</option>
        </select>
      </div>
      <div class="form-row"><label>Additional details</label><textarea></textarea></div>
      <button class="btn btn-primary" onclick="toast('Return request submitted — we\\'ll email next steps within 1 business day')">Submit request</button>
    </div>
  </section>`;
}

function renderAccount() {
  return `<section class="section container">
    <h2>Account</h2>
    <div class="two-col" style="max-width:820px;">
      <div class="form-card">
        <h3>Log in</h3>
        <div class="form-row"><label>Email</label><input type="email"></div>
        <div class="form-row"><label>Password</label><input type="password"></div>
        <button class="btn btn-primary btn-block" onclick="toast('This is a prototype — account login is not wired up yet')">Log in</button>
      </div>
      <div class="form-card">
        <h3>Create an account</h3>
        <p class="small-note">Save addresses and see your order history next time — or check out as a guest any time.</p>
        <div class="form-row"><label>Full name</label><input type="text"></div>
        <div class="form-row"><label>Email</label><input type="email"></div>
        <div class="form-row"><label>Password</label><input type="password"></div>
        <button class="btn btn-secondary btn-block" onclick="toast('This is a prototype — account creation is not wired up yet')">Create account</button>
      </div>
    </div>
  </section>`;
}

function renderFAQ() {
  const faqs = [
    ['How long does delivery take?', 'Most metro orders arrive within 1–3 working days; outlying areas may take 4–7 working days depending on your local courier partner.'],
    ['Can I pay cash on delivery?', 'Yes — choose Cash on Delivery or Card on Delivery at checkout alongside online card/EFT payment.'],
    ['What is your returns policy?', 'You have a 7-day cooling-off period on online orders under the Consumer Protection Act, plus our standard exchange process — see the Returns Policy for details.'],
    ['Is my personal information safe?', 'We handle personal information in line with POPIA and never store your card details ourselves — payments are processed through a secure hosted gateway.'],
  ];
  return `<section class="section container">
    <h2>Frequently asked questions</h2>
    <div style="max-width:680px;">
      ${faqs.map(f => `<div class="form-card" style="margin-bottom:14px;"><h4 style="margin-bottom:6px;">${f[0]}</h4><p style="margin:0;color:var(--ink-soft);">${f[1]}</p></div>`).join('')}
    </div>
  </section>`;
}

function renderNotFound() {
  return `<section class="section container"><div class="empty-state"><h2>Page not found</h2><a href="#home" class="btn btn-primary">Back to home</a></div></section>`;
}

function submitNewsletter() {
  const val = document.getElementById('newsletter-email').value.trim();
  if (!val) { toast('Enter an email address first'); return; }
  document.getElementById('newsletter-email').value = '';
  toast('Subscribed! Watch your inbox for sales and new arrivals.');
}

/* ---------------- legal pages (placeholder copy) ---------------- */
function legalNotice() {
  return `<div class="demo-flag">Draft placeholder — replace with final copy approved by LALA Comforts and/or a legal/compliance advisor before this site goes live. Structure reflects POPIA, CPA, and ECT Act requirements from the developer brief.</div>`;
}
function renderLegal(page) {
  if (page === 'privacy') return `<section class="section container" style="max-width:760px;">
    <h2>Privacy Policy</h2>${legalNotice()}
    <p>LALA Comforts (Pty) Ltd ("we", "us") is committed to protecting your personal information in accordance with the Protection of Personal Information Act (POPIA).</p>
    <h4>Information we collect</h4><p>Name, contact details, delivery address, order history, and payment references (card/EFT payments are processed by our payment gateway partner — we do not store full card details).</p>
    <h4>How we use it</h4><p>To process and deliver your order, provide customer support, send order and delivery updates, and — where you've opted in — marketing communications.</p>
    <h4>Your rights</h4><p>You may request access to, correction of, or deletion of your personal information, and may object to direct marketing at any time, by contacting support@lalacomforts.co.za.</p>
    <h4>Cookies</h4><p>We use essential cookies to operate the cart and checkout, and — with your consent — analytics/marketing cookies to understand site usage.</p>
  </section>`;
  if (page === 'terms') return `<section class="section container" style="max-width:760px;">
    <h2>Terms &amp; Conditions</h2>${legalNotice()}
    <p>These terms govern your use of the LALA Comforts website and any orders placed with LALA Comforts (Pty) Ltd, Reg. No. 2026/000000/07 (placeholder), of 12 Comfort Lane, Sandton, Johannesburg, 2196, South Africa.</p>
    <h4>Orders &amp; pricing</h4><p>All prices are displayed in South African Rand and include VAT where applicable. Full price and delivery cost are shown before your order is finalised.</p>
    <h4>Payment</h4><p>We accept online card/EFT payment via a secure hosted payment gateway, as well as Cash on Delivery and Card on Delivery.</p>
    <h4>Delivery</h4><p>Delivery is fulfilled via e-hailing and courier partners. Estimated delivery windows are shown at checkout by delivery zone.</p>
    <h4>Cooling-off period</h4><p>Orders placed online qualify for a 7-day cooling-off period under the Consumer Protection Act — see our Returns Policy for how to exercise this right.</p>
  </section>`;
  if (page === 'returns-policy') return `<section class="section container" style="max-width:760px;">
    <h2>Returns Policy</h2>${legalNotice()}
    <h4>7-day cooling-off period</h4><p>As this is an online store, you may cancel an order within 7 days of delivery without reason, under the Consumer Protection Act, provided goods are unused and in original packaging.</p>
    <h4>Damaged or incorrect items</h4><p>Contact us within 7 days of delivery with your order reference and photos of the item; we'll arrange a replacement, exchange, or refund.</p>
    <h4>How to request a return</h4><p>Submit a <a href="#returns" style="text-decoration:underline;">returns/exchange request</a> or contact support@lalacomforts.co.za / WhatsApp with your order number.</p>
  </section>`;
  return renderNotFound();
}


/* ---------------- catalogue sync (store owner utility) ----------------
   No backend exists yet, so this storefront can't see admin.html's edits
   automatically. A store owner can export the catalogue from the Admin
   panel and load it here to preview/update the live storefront — a real
   build would replace this with a shared database. ---------------- */
function importStoreCatalogue(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!Array.isArray(data)) throw new Error('not an array');
      PRODUCTS = data;
      toast('Storefront catalogue updated from file');
      render();
    } catch (e) {
      toast('Could not read that file — expecting a catalogue JSON export from Admin');
    }
  };
  reader.readAsText(file);
}
