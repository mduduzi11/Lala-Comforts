/* ============================================================
   LALA COMFORTS — ADMIN APP
   Separate page/URL from the customer storefront (storefront.html).
   Client-side only prototype: edits live in this browser tab and
   are not shared with the storefront automatically — use Export/
   Import to move a catalogue between the two until a real backend
   exists. See renderAdminBody() for the "why" explained on-page.
   ============================================================ */

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
}

/* ---------------- tiny router (flat views, no nested storefront routes) ---------------- */
function currentAdminView() {
  return location.hash.replace(/^#/, '') || 'overview';
}
function renderAdminApp() {
  document.getElementById('app').innerHTML = renderAdminBody(currentAdminView());
}
window.addEventListener('hashchange', renderAdminApp);
window.addEventListener('DOMContentLoaded', renderAdminApp);

/* ================================================================
   PRODUCTS — live-editable table (name/category/price/stock/etc.)
   plus photo upload, add/delete, export/import.
   ================================================================ */
let __adminNewRowOpen = false;
function renderAdminProducts() {
  return `
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px;">
      <h3 style="margin:0;">Products <span class="small-note">(${PRODUCTS.length})</span></h3>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn btn-secondary btn-sm" onclick="toggleAdminNewRow()">${__adminNewRowOpen ? 'Cancel' : '+ Add product'}</button>
        <button class="btn btn-ghost btn-sm" onclick="exportCatalogue()">Export catalogue (JSON)</button>
        <label class="btn btn-ghost btn-sm" style="margin:0;">Import catalogue
          <input type="file" accept=".json" style="display:none;" onchange="importCatalogue(event)">
        </label>
      </div>
    </div>
    <div class="notice-box info">Edits here update instantly in this browser tab. Use <b>Upload</b> on any row to add real product photos (up to 4 per product, 5MB each). This admin runs on its own page/URL from the storefront and has no shared database yet, so changes don't appear there automatically — <b>Export</b> the catalogue here, then use "Sync catalogue data" in the storefront's footer to load it there. A real build would connect both to one database instead, the way Shopify's admin does.</div>
    <table class="admin-table">
      <thead><tr><th>Photo</th><th>Product</th><th>Category</th><th>Price (R)</th><th>Was price (R)</th><th>Stock</th><th>Material</th><th>Supplier</th><th></th></tr></thead>
      <tbody>
        ${__adminNewRowOpen ? `
        <tr>
          <td class="small-note">Upload after saving →</td>
          <td><input id="new-p-name" type="text" placeholder="Product name" style="width:140px;"></td>
          <td><select id="new-p-cat">${CATEGORIES.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}</select></td>
          <td><input id="new-p-price" type="number" min="0" value="499" style="width:80px;"></td>
          <td><input id="new-p-was" type="number" min="0" placeholder="—" style="width:80px;"></td>
          <td><input id="new-p-stock" type="number" min="0" value="10" style="width:70px;"></td>
          <td><select id="new-p-material">${MATERIALS.map(m => `<option>${m}</option>`).join('')}</select></td>
          <td><select id="new-p-supplier">${SUPPLIERS.map(s => `<option>${s}</option>`).join('')}</select></td>
          <td><button class="btn btn-primary btn-sm" onclick="addNewProduct()">Save</button></td>
        </tr>` : ''}
        ${PRODUCTS.map(p => `
        <tr data-product-row="${p.id}">
          <td>
            <div style="width:56px;height:56px;border-radius:8px;overflow:hidden;background:#f4efe4;margin-bottom:6px;">${productImage(p)}</div>
            <label class="btn btn-ghost btn-sm" style="margin:0;padding:4px 8px;font-size:.7em;display:inline-block;">Upload
              <input type="file" accept="image/*" multiple style="display:none;" onchange="handleProductImageUpload(${p.id}, event)">
            </label>
            ${p.images && p.images.length ? `<div><a class="small-note" style="cursor:pointer;text-decoration:underline;" onclick="clearProductImages(${p.id})">Clear</a></div>` : ''}
          </td>
          <td><input type="text" value="${p.name.replace(/"/g,'&quot;')}" onchange="updateProductField(${p.id},'name',this.value)" style="min-width:150px;"></td>
          <td><select onchange="updateProductField(${p.id},'category',this.value)">${CATEGORIES.map(c => `<option value="${c.name}" ${c.name===p.category?'selected':''}>${c.name}</option>`).join('')}</select></td>
          <td><input type="number" min="0" value="${p.price}" onchange="updateProductField(${p.id},'price',this.value)" style="width:80px;"></td>
          <td><input type="number" min="0" value="${p.wasPrice || ''}" placeholder="—" onchange="updateProductField(${p.id},'wasPrice',this.value)" style="width:80px;"></td>
          <td><input type="number" min="0" value="${p.stock}" onchange="updateProductField(${p.id},'stock',this.value)" style="width:70px;"></td>
          <td><select onchange="updateProductField(${p.id},'material',this.value)">${MATERIALS.map(m => `<option ${m===p.material?'selected':''}>${m}</option>`).join('')}</select></td>
          <td><select onchange="updateProductField(${p.id},'supplier',this.value)">${SUPPLIERS.map(s => `<option ${s===p.supplier?'selected':''}>${s}</option>`).join('')}</select></td>
          <td><button class="btn btn-ghost btn-sm" onclick="deleteProduct(${p.id})" title="Delete product">✕</button></td>
        </tr>`).join('')}
      </tbody>
    </table>`;
}

function toggleAdminNewRow() { __adminNewRowOpen = !__adminNewRowOpen; renderAdminApp(); }

function updateProductField(id, field, rawValue) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  if (field === 'price' || field === 'stock') {
    p[field] = Math.max(0, parseInt(rawValue, 10) || 0);
  } else if (field === 'wasPrice') {
    p.wasPrice = rawValue ? Math.max(0, parseInt(rawValue, 10) || 0) : null;
  } else {
    p[field] = rawValue;
  }
  toast(`Saved — ${p.name}`);
}

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function handleProductImageUpload(id, event) {
  const files = Array.from(event.target.files || []).slice(0, 4);
  if (!files.length) return;
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  const tooBig = files.find(f => f.size > 5 * 1024 * 1024);
  if (tooBig) { toast(`"${tooBig.name}" is over 5MB — try a smaller image`); return; }
  try {
    const dataUrls = await Promise.all(files.map(fileToDataURL));
    p.images = dataUrls;
    toast(`Photo${dataUrls.length > 1 ? 's' : ''} uploaded for ${p.name}`);
    renderAdminApp();
  } catch (e) {
    toast('Could not read that image file');
  }
}

function clearProductImages(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  p.images = [];
  toast('Photo removed — back to placeholder image');
  renderAdminApp();
}

function deleteProduct(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  if (!confirm(`Remove "${p.name}" from the catalogue?`)) return;
  PRODUCTS = PRODUCTS.filter(x => x.id !== id);
  toast('Product removed');
  renderAdminApp();
}

function addNewProduct() {
  const name = document.getElementById('new-p-name').value.trim();
  if (!name) { toast('Give the product a name first'); return; }
  const category = document.getElementById('new-p-cat').value;
  const price = Math.max(0, parseInt(document.getElementById('new-p-price').value, 10) || 0);
  const wasPriceRaw = document.getElementById('new-p-was').value;
  const stock = Math.max(0, parseInt(document.getElementById('new-p-stock').value, 10) || 0);
  const material = document.getElementById('new-p-material').value;
  const supplier = document.getElementById('new-p-supplier').value;
  const catMeta = CATEGORIES.find(c => c.name === category);
  const newProduct = {
    id: NEXT_PRODUCT_ID++,
    name, category,
    icon: catMeta ? catMeta.icon : 'duvet',
    price, wasPrice: wasPriceRaw ? parseInt(wasPriceRaw, 10) : null,
    sizes: SIZES_BY_CAT[category] || ['Standard'],
    colours: COLOURS.slice(0, 3),
    material, supplier, stock,
    rating: '4.0', reviewCount: 0,
    description: `${name} — newly added product. Add a fuller description before publishing.`,
    featured: false,
  };
  PRODUCTS.push(newProduct);
  __adminNewRowOpen = false;
  toast('Product added');
  renderAdminApp();
}

function exportCatalogue() {
  const blob = new Blob([JSON.stringify(PRODUCTS, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'lala-comforts-catalogue.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  toast('Catalogue exported — load it into the storefront via its footer "Sync catalogue data" link');
}

function importCatalogue(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!Array.isArray(data)) throw new Error('not an array');
      PRODUCTS = data;
      NEXT_PRODUCT_ID = Math.max(0, ...data.map(p => p.id || 0)) + 1;
      toast('Catalogue imported');
      renderAdminApp();
    } catch (e) {
      toast('Could not read that file — expecting a catalogue JSON export');
    }
  };
  reader.readAsText(file);
}

/* ================================================================
   OTHER ADMIN SECTIONS — static mockups (section 3.2 of the brief)
   ================================================================ */
function renderAdminBody(view) {
  const menu = [
    ['overview', 'Overview'], ['products', 'Products'], ['orders', 'Orders'],
    ['suppliers', 'Suppliers'], ['customers', 'Customers'], ['promotions', 'Promotions'],
  ];
  let body = '';
  if (view === 'products') {
    body = renderAdminProducts();
  } else if (view === 'orders') {
    body = `<h3>Orders</h3>
      <table class="admin-table"><thead><tr><th>Order</th><th>Customer</th><th>Payment</th><th>Status</th><th>Delivery partner</th><th>Total</th></tr></thead><tbody>
      <tr><td>LALA-20268841</td><td>N. Khumalo</td><td><span class="status-pill paid">Paid online</span></td><td><span class="status-pill transit">Out for delivery</span></td><td>Local courier</td><td>R1,243</td></tr>
      <tr><td>LALA-20268840</td><td>T. Mahlangu</td><td><span class="status-pill cod">COD</span></td><td><span class="status-pill placed">Placed</span></td><td>Unassigned</td><td>R899</td></tr>
      <tr><td>LALA-20268839</td><td>S. van Wyk</td><td><span class="status-pill paid">Paid online</span></td><td><span class="status-pill delivered">Delivered</span></td><td>e-hailing partner</td><td>R2,010</td></tr>
      </tbody></table>`;
  } else if (view === 'suppliers') {
    body = `<h3>Suppliers</h3>
      <table class="admin-table"><thead><tr><th>Supplier</th><th>Linked products</th><th>Lead time</th></tr></thead><tbody>
      ${SUPPLIERS.map(s => `<tr><td>${s}</td><td>${PRODUCTS.filter(p=>p.supplier===s).length}</td><td>3–5 working days</td></tr>`).join('')}
      </tbody></table>`;
  } else if (view === 'customers') {
    body = `<h3>Customers</h3><p class="small-note">Customer directory with order history would appear here — not populated in this prototype.</p>`;
  } else if (view === 'promotions') {
    body = `<h3>Promotions</h3><p class="small-note">Discount/coupon management for social media campaigns would appear here — not populated in this prototype.</p>`;
  } else {
    body = `<h3>Overview</h3>
      <div class="admin-kpis">
        <div class="kpi-card"><div class="label">Revenue (7d)</div><div class="value">R38,420</div></div>
        <div class="kpi-card"><div class="label">Orders (7d)</div><div class="value">47</div></div>
        <div class="kpi-card"><div class="label">Paid online</div><div class="value">68%</div></div>
        <div class="kpi-card"><div class="label">COD / Card on delivery</div><div class="value">32%</div></div>
      </div>
      <p class="small-note">This back-office preview illustrates the admin dashboard requested in the brief (product, order, supplier, and delivery management with role-based access). It is a static mockup for developer discussion, not a working system.</p>`;
  }
  return `
    <div class="demo-flag">Concept preview of the admin dashboard from the brief (section 3.2), now on its own page/URL separate from the storefront. The <b>Products</b> tab is live-editable so you can try changing prices/stock/photos the way you would in Shopify — other tabs (Orders, Suppliers, Customers, Promotions) are static mockups for scope discussion, since real order/customer data needs a backend a developer would build.</div>
    <div class="admin-shell">
      <div class="admin-side">
        <div class="brand">LALA Admin</div>
        ${menu.map(m => `<a class="${view===m[0]?'active':''}" href="#${m[0]}">${m[1]}</a>`).join('')}
      </div>
      <div class="admin-main">${body}</div>
    </div>`;
}
