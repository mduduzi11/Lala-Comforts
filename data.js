/* ============================================================
   MOCK DATA — placeholder products/suppliers/orders for the demo.
   Replace with real catalogue data before go-live.
   ============================================================ */

const CATEGORIES = [
  { name: 'Duvets', icon: 'duvet' },
  { name: 'Linen Sets', icon: 'linen' },
  { name: 'Pillows', icon: 'pillow' },
  { name: 'Mattress Protectors', icon: 'protector' },
  { name: "Kids Bedding", icon: 'kids' },
];

const MATERIALS = ['Microfibre', 'Cotton', 'Percale Cotton', 'Fleece', 'Memory Foam', 'Bamboo Blend'];
const SUPPLIERS = ['Comfort Textiles CC', 'SleepWell Imports', 'Karoo Linen Co.', 'Little Dreamers Supply'];

function palette(seed) {
  const palettes = [
    ['#e7d3c1', '#b98a63'], ['#cfd9ea', '#5c6b8c'], ['#e3ded1', '#8a9a7e'],
    ['#f0dfe3', '#c96f83'], ['#dbe6dc', '#5f8b6a'], ['#efe2c8', '#c79a3e'],
    ['#e0e4f2', '#6c6fa0'], ['#f2e2d4', '#c06f4d'],
  ];
  return palettes[seed % palettes.length];
}

// icon key -> inline SVG path markup (simple line icons, drawn at 0 0 24 24)
const ICONS = {
  duvet: '<path d="M4 9c0-2.8 2.2-5 5-5h6c2.8 0 5 2.2 5 5v8a2 2 0 01-2 2H6a2 2 0 01-2-2V9z"/><path d="M12 4v16M8 8h2m4 0h2M8 13h2m4 0h2"/>',
  linen: '<rect x="4" y="6" width="16" height="12" rx="1.5"/><path d="M4 10h16M9 6v4M15 6v4"/>',
  pillow: '<path d="M4 8c0-1.6 1.6-3 4-3h8c2.4 0 4 1.4 4 3v8c0 1.6-1.6 3-4 3H8c-2.4 0-4-1.4-4-3V8z"/><path d="M9 10.5c1-1 2-1 3 0s2 1 3 0" />',
  protector: '<rect x="5" y="4" width="14" height="16" rx="3"/><path d="M9 4v3a3 3 0 006 0V4"/>',
  kids: '<circle cx="9" cy="8" r="2"/><path d="M4 19c0-3 2.5-5 5-5s5 2 5 5" /><path d="M15 5l1.3 2.6L19 8.9l-2.3 1.3L15 13l-1-2.8L11.5 8.9l2.3-1.3z"/>',
  star: '<path d="M12 3l2.6 5.8 6.2.6-4.7 4.2 1.4 6.2L12 16.9 6.5 19.8l1.4-6.2L3.2 9.4l6.2-.6z"/>',
  heart: '<path d="M12 20s-7-4.5-9.3-9C1 7.5 3 4 6.5 4c2 0 3.6 1.2 5.5 3.2C13.9 5.2 15.5 4 17.5 4 21 4 23 7.5 21.3 11c-2.3 4.5-9.3 9-9.3 9z"/>',
  truck: '<path d="M3 7h11v8H3z"/><path d="M14 10h4l3 3v2h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17.5" cy="18" r="1.6"/>',
  shield: '<path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6z"/>',
  leaf: '<path d="M5 19c8 0 14-6 14-14-8 0-14 6-14 14z"/><path d="M5 19c2-4 5-7 9-9"/>',
};

function svgIcon(key, size, stroke) {
  size = size || 22;
  const body = ICONS[key] || ICONS.duvet;
  const filled = key === 'heart' || key === 'star';
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${filled ? 'none' : 'none'}" stroke="${stroke || 'currentColor'}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}

function productImage(p, big, imgIndex) {
  const images = p.images || [];
  const idx = imgIndex || 0;
  if (images[idx]) {
    return `<img src="${images[idx]}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;">`;
  }
  const [bg, fg] = palette(p.id);
  return `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(150deg, ${bg}, #ffffff 130%);">
    <div style="color:${fg};transform:scale(${big ? 3 : 1.6});">${svgIcon(p.icon, 40)}</div>
  </div>`;
}

const NAMES = {
  Duvets: ['Cloud Nine Duvet Inner', 'Winter Warmth Duvet', 'All-Season Duvet Inner', 'Hotel Weight Duvet'],
  'Linen Sets': ['Percale Stripe Linen Set', 'Soft Wash Linen Set', 'Classic Plain Linen Set', 'Botanical Print Linen Set'],
  Pillows: ['Cloud Support Pillow', 'Memory Foam Contour Pillow', 'Feather-Feel Pillow', 'Firm Support Pillow'],
  'Mattress Protectors': ['Waterproof Mattress Protector', 'Quilted Mattress Protector', 'Cooling Mattress Protector'],
  "Kids Bedding": ['Little Explorer Duvet Set', 'Dreamland Kids Linen Set', 'Starry Night Kids Duvet'],
};

const SIZES_BY_CAT = {
  Duvets: ['Single', 'Double', 'Queen', 'King'],
  'Linen Sets': ['Single', 'Double', 'Queen', 'King'],
  Pillows: ['Standard', 'Continental'],
  'Mattress Protectors': ['Single', 'Double', 'Queen', 'King'],
  "Kids Bedding": ['Single', 'Toddler'],
};

const COLOURS = [
  { name: 'Ivory', hex: '#f1ead9' }, { name: 'Dusty Blue', hex: '#8fa3c2' },
  { name: 'Terracotta', hex: '#c06f4d' }, { name: 'Sage', hex: '#8a9a7e' },
  { name: 'Charcoal', hex: '#4a4640' }, { name: 'Blush', hex: '#e3b9b0' },
];

function buildProducts() {
  const products = [];
  let id = 1;
  CATEGORIES.forEach((cat) => {
    NAMES[cat.name].forEach((name, i) => {
      const basePrice = { Duvets: 899, 'Linen Sets': 649, Pillows: 279, 'Mattress Protectors': 449, "Kids Bedding": 549 }[cat.name];
      const price = basePrice + i * 120;
      const onSale = (id % 3 === 0);
      products.push({
        id: id,
        name: name,
        category: cat.name,
        icon: cat.icon,
        price: onSale ? Math.round(price * 0.82) : price,
        wasPrice: onSale ? price : null,
        sizes: SIZES_BY_CAT[cat.name],
        colours: COLOURS.slice(0, 3 + (id % 3)),
        material: MATERIALS[id % MATERIALS.length],
        supplier: SUPPLIERS[id % SUPPLIERS.length],
        stock: id % 7 === 0 ? 0 : (id % 5 === 0 ? 3 : 22),
        rating: (3.6 + ((id * 7) % 14) / 10).toFixed(1),
        reviewCount: 8 + (id * 13) % 140,
        description: `The ${name} brings hotel-level comfort home. Made from ${MATERIALS[id % MATERIALS.length].toLowerCase()}, it's breathable, easy to care for, and built to hold up wash after wash. Sourced through our partner ${SUPPLIERS[id % SUPPLIERS.length]} and quality-checked before it reaches you.`,
        featured: id % 4 === 0,
      });
      id++;
    });
  });
  return products;
}

let PRODUCTS = buildProducts();
let NEXT_PRODUCT_ID = PRODUCTS.length + 1;

const REVIEWS = [
  { who: 'Nomvula K.', when: '3 weeks ago', rating: 5, text: 'So much softer than I expected for the price. Arrived within 2 days of ordering.' },
  { who: 'Kagiso M.', when: '1 month ago', rating: 4, text: 'Good quality, true to size. Delivery driver called ahead which was great.' },
  { who: 'Aisha P.', when: '2 months ago', rating: 5, text: 'Bought this as a gift and ended up ordering one for myself too. Washes really well.' },
  { who: 'Thabo R.', when: '2 months ago', rating: 3, text: 'Nice product, took a little longer to arrive than the estimate but support was responsive on WhatsApp.' },
];

const DELIVERY_ZONES = [
  { zone: 'Johannesburg / Pretoria metro', fee: 65, eta: '1–2 working days' },
  { zone: 'Cape Town metro', fee: 85, eta: '2–3 working days' },
  { zone: 'Durban metro', fee: 85, eta: '2–3 working days' },
  { zone: 'Other major city', fee: 110, eta: '3–4 working days' },
  { zone: 'Outlying / rural area', fee: 160, eta: '4–7 working days' },
];

const SAMPLE_ORDER = {
  id: 'LALA-20268841',
  status: 2, // 0 placed,1 confirmed,2 out for delivery,3 delivered
  placedAt: '18 Aug 2026',
  items: [
    { name: 'Cloud Nine Duvet Inner (Queen, Ivory)', qty: 1, price: 899 },
    { name: 'Cloud Support Pillow (Standard, x2)', qty: 2, price: 279 },
  ],
  deliveryFee: 65,
  driver: 'Sipho — local courier partner',
};

// ---------- In-memory app state (no persistence — refresh resets, as expected in a prototype) ----------
const STATE = {
  cart: [], // {productId, size, colour, qty}
  wishlist: new Set(),
  cookieChoice: null,
  toastTimer: null,
};
