# LALA Comforts — Website Prototype

A clickable front-end prototype for LALA Comforts, a South African bedding
e-commerce retailer, built from the company's Website Developer Brief. It's
meant to help visualize the concept and brief web development agencies —
it is **not** a production system (see Limitations below).

## What's here

- `storefront.html` — the customer-facing site: home, catalogue with
  filters, product pages, cart, checkout (online gateway / cash-on-delivery
  / card-on-delivery), order tracking, contact, returns, FAQs, and
  POPIA/CPA/ECT-Act-aligned legal page placeholders.
- `admin.html` — a separate back-office page (its own URL, no link from the
  customer nav) with a live-editable product catalogue: edit name,
  category, price, sale price, stock, material, and supplier inline, add or
  delete products, and upload product photos. Orders/Suppliers/Customers/
  Promotions are static mockups for scope discussion.
- `css/styles.css` — shared styling for both pages.
- `js/data.js` — mock product/category/supplier data and small render
  helpers (icons, price formatting).
- `js/storefront.js` — the storefront's router and page logic.
- `js/admin.js` — the admin page's logic (product CRUD, image upload,
  catalogue export/import).

## Running it locally

These are plain static files — no build step or server required. Either:

- Open `storefront.html` or `admin.html` directly in a browser, or
- Serve the folder with any static file server for a more realistic setup,
  e.g. `npx serve .` or `python3 -m http.server`, then visit
  `http://localhost:PORT/storefront.html`.

## Limitations (read before showing this to a developer)

This is a **front-end-only prototype** — there is no backend, database, or
payment integration:

- Cart, wishlist, and admin edits live in browser memory for that tab only
  and reset on page refresh.
- The admin page and the storefront page don't share data automatically,
  since they're separate pages with no shared database. In the admin,
  click **Export catalogue (JSON)**, then use **Sync catalogue data** in
  the storefront's footer to load that file into the storefront.
- Legal pages (Privacy Policy, Terms & Conditions, Returns Policy) contain
  placeholder copy only — replace with text approved by LALA Comforts
  and/or a legal/compliance advisor before going live.
- Payment gateway, delivery/courier API integration, and account
  login/creation are represented in the UI but not functionally wired up.

A real build would replace the in-memory state with a proper backend and
database (shared by both the storefront and admin), real authentication,
and live payment/courier integrations — which is exactly the scope the
original developer brief describes.

## Background

Built from `LALA_Comforts_Website_Developer_Brief.docx`, a specification
document intended for briefing web development agencies/freelancers.
