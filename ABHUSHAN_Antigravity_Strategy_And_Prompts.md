# ABHUSHAN — Full Site Audit, Strategy & Antigravity Prompt Pack
**Site:** https://abhushan-by-divyaraj.vercel.app/ · **Audited:** 25 Sep 2026 · **Round:** R1
**Method:** Live source downloaded (index.html, admin.html, all 5 product pages, styles.css, script.js, 404.html) + real-browser walkthrough (desktop 1440px + iPhone 14 emulation) + live HTTP probing of every link, image, font and infrastructure file referenced by the site.

> **How to use this file:** Section 2 = what I found (evidence). Section 4 = things ONLY YOU (Divyaraj) must fill in — do this first, 10 minutes. Section 5 = the Antigravity prompts, in order, one at a time. Every prompt is scope-locked, PowerShell 5.1-safe, and ends with commit-but-never-push.

---

## 1. Executive Summary

Abhushan is visually the strongest of your sites — the Tiffany-style oval imagery, the serif/gold palette and the editorial sections all land. **The problem is not looks. The problem is that the site cannot actually take an order or a booking.**

Everything commercial on it is decorative right now:

| Funnel step | Status today |
|---|---|
| "Add to Bag" | ❌ Shows a toast: *The "Tomboy Ring (Add to Bag)" page is coming soon.* |
| Cart / bag | ❌ Does not exist anywhere |
| Wishlist "Move All to Bag" | ❌ Shows a fake success toast, then just deletes the wishlist |
| Appointment booking | ⚠️ Saves to the **customer's own browser** localStorage — you never receive it |
| Newsletter (popup + footer) | ⚠️ Popup saves to customer's browser; **footer form has no handler at all** (page just reloads) |
| Chat consultant | ⚠️ Canned robot replies; no human ever sees the messages |
| Admin dashboard | ⚠️ Reads the same browser's localStorage — a booking made on a customer's phone will never appear on your laptop. Passwords (`admin123` / `abhushan2026`) are in public view-source, and the login modal literally shows `e.g. admin123` as the placeholder |

On top of that: the mobile menu is nearly unreadable (grey text behind a dark blur), the hero image contains AI-gibberish baked-in text ("Your heritags in cvrry ornernent"), every social-share image and schema URL is broken or points to a domain you don't own, and all 5 product pages share the same homepage `<title>`.

**The strategy below fixes the money path first (bag → WhatsApp checkout, forms → your email inbox), then trust signals (SEO/schema/social), then polish.** All fixes keep the current design language untouched.

---

## 2. Verified Findings (evidence)

### 2.1 CRITICAL — money & leads are being lost

| # | Finding | Evidence |
|---|---|---|
| C1 | **"Add to Bag" is fake.** Every PDP's inline script: `function addToBag(name){ showComingSoonToast(name + " (Add to Bag)") }` → renders *"The 'Tomboy Ring (Add to Bag)' page is coming soon."* | product-*.html inline `<script>` |
| C2 | **No cart exists.** Zero bag markup/CSS/JS in the entire codebase. `grep bag-modal|cart` = nothing functional. | script.js, styles.css |
| C3 | **Wishlist "Move All to Bag" is a lie.** Handler shows `✓ All items added to bag!` toast, then empties the wishlist. Nothing is added anywhere. | script.js `#wl-move-all` |
| C4 | **Bookings never reach you.** Booking form handler saves to `localStorage.abhushan_appointments` and shows *"We'll confirm within 2 hours"* — impossible, since the data lives in the visitor's browser. | script.js booking handler |
| C5 | **Admin dashboard is localStorage-only.** admin.html reads `localStorage.abhushan_appointments` from the *same browser*. Cross-device = always empty. | admin.html L913 |
| C6 | **Admin auth is public.** `if (enteredPassword === 'admin123' \|\| enteredPassword === 'abhushan2026')` in *client-side* script.js **and** admin.html; index.html placeholder text says `Enter Passcode (e.g. admin123)` — it advertises a working password on the public page. | script.js L299, admin.html L895, index.html modal |
| C7 | **Footer newsletter form has no submit handler** — pressing ➔ reloads the page with a GET query. | script.js has zero `footer-subscribe-form` references |
| C8 | **Chat consultant is a canned robot** — 5 rotating replies, transcript stays in localStorage, no human path. Risky for a fine-jewellery trust brand. | script.js `consultantReplies` |
| C9 | **EMI claims are fabricated** ("0% interest · HDFC, ICICI, SBI, Axis, Kotak · Instant approval", "Check Eligibility" → `alert('placeholder')` with phone `+91-79-XXXX-XXXX`). In India, displaying bank-specific EMI offers you don't have is a real compliance risk. | script.js initEMI, PDP static EMI block |

### 2.2 HIGH — visible bugs

| # | Finding | Evidence |
|---|---|---|
| H1 | **Mobile menu is unreadable.** `.overlay-bg` has `z-index:200` with `rgba(26,23,20,0.6)` + `blur(4px)`; `.site-header` (which contains the open `.mobile-menu`) is `z-index:100`. The 60%-black blur sits **on top of the menu** → grey-on-grey text. Verified on iPhone 14 emulation. | styles.css L1507 vs L261/L552 |
| H2 | **Hero image has AI-gibberish baked in:** *"Your heritags in cvrry ornernent"* — on the most important visual of the site, prominent on mobile. | images/extras/hero_main.png |
| H3 | **Duplicate EMI teaser on every PDP** — static accordion `or ₹1,834/month with EMI ⌄` + JS-injected `or ₹1,834/month with EMI ⓘ` stacked back-to-back. Verified visually. | script.js initEMI runs although `.product-emi-container-tiffany` already exists |
| H4 | **og:image 404** — `images/og-image.jpg` doesn't exist → WhatsApp/Instagram/Facebook shares render blank. JSON-LD also references `images/logo.png` (404) and `images/studio.jpg` (404). | live HTTP probes |
| H5 | **All 5 PDPs share the homepage `<title>`** "Abhushan – Fine Gold Jewellery \| Ahmedabad, Gujarat, India", the same meta description, canonical `https://abhushan.com`, and a head block containing ALL 5 Product schemas + FAQ schema. No per-product SEO at all. | product-*.html `<head>` |
| H6 | **Canonical/OG/schema URLs point to `https://abhushan.com`** — a domain not deployed anywhere. Schema `telephone: "+91-79-XXXXXXXX"` is a literal placeholder. | all pages |
| H7 | **NAP data contradicts itself:** visible page: "101 Heritage Arcade, CG Road, Navrangpura, Ahmedabad, Gujarat **380001**, 10 AM–7 PM" vs schema: "101, **Luxury** Arcade … **380009**, 11:00–20:00". Google Local reads the schema. | index.html vs JSON-LD |
| H8 | **Pinterest + Facebook icons link to `/abhushan_placeholder/` profiles.** Instagram points to your personal `divyraj.creates`. | footer, all pages |
| H9 | **Popular search pills are dead ends:** "Emerald Rings", "Bridal Sets", "Gold Chains", "Custom Lockets" return **zero results** (5-product catalog has no matching keywords). | script.js `searchCatalog` |
| H10 | **"Quick View" button is injected on product cards but has no click handler** — dead UI inviting a click that does nothing. | script.js `initMicroInteractions` |
| H11 | **No robots.txt, no sitemap.xml, no vercel.json** (probe: all 404) → no security headers at all, and `Permissions-Policy` doesn't declare camera, which the Virtual Try-On needs. | live probes |
| H12 | **If JS fails (or is blocked), the whole page below the hero is invisible** — `.fade-in-up` / `reveal-on-scroll` start at `opacity:0` and only un-hide when IntersectionObserver fires. Full-page render (print, some in-app browsers, web archives) shows a blank ocean. Verified via full-page capture. | styles.css + script.js reveal logic |

### 2.3 MEDIUM — polish & consistency

| # | Finding |
|---|---|
| M1 | Mobile menu has only 5 links (Rings/Earrings/Necklaces/Bracelets/Bridal) — desktop has 11. No Our Story, Welded Forever, Gifts, Best Sellers, no booking shortcut. |
| M2 | Size "5" is pre-selected on ring PDPs — customers can order a size nobody chose. |
| M3 | Booking slots stop at 6 PM while studio hours say open till 7 PM. |
| M4 | Schema `sameAs` only lists Instagram; logo URL 404 (see H4). |
| M5 | Dead code: `initCarousel('picked-track'…)` targets elements that exist on no page; hero slider logic supports N slides but only 1 exists. Harmless, worth deleting during QA. |
| M6 | Product images are large PNGs (hero + banners). WebP would cut weight ~70%. |
| M7 | `studio@abhushan.com` and `+91 79 4001 2345` — confirm these are real and monitored before launch (see §4). |
| M8 | 404.html exists (good) — keep it consistent after the admin rename (Prompt 6). |

### 2.4 What is already good — do NOT let Antigravity redesign these

- Tiffany-style oval category & product imagery, ivory/charcoal/antique-gold palette, Playfair/Jost/Lucia BT type system — **all deployed and loading correctly** (font files verified 200, unlike KXM's R1).
- Virtual Try-On with camera + upload fallback, drag/scale/rotate, capture & share — genuinely impressive, keep untouched.
- Wishlist drawer with Undo, badge count, PDP hearts — solid, we only make "Move All to Bag" honest.
- Skip-to-content link, `noscript` hero fallbacks, width/height on images, focus management in drawers.
- Announcement ticker, trust-badge bar, editorial splits, studio SVG map, booking card design.

---

## 3. Strategy — "Make it sell, then make it sing"

**Phase A — Honesty & money path (Prompts 1–3):** fix the mobile menu, kill dead UI, dedupe EMI → then build a real bag with **WhatsApp checkout** (the conversion channel Indian fine-jewellery buyers actually use) → then wire every form to **Web3Forms** so bookings/newsletter/chat messages land in your email inbox with the customer's address reply-able.

**Phase B — Trust & findability (Prompts 4–5):** per-product SEO heads + clean schema pointing at the real deployment URL + share image; hero gets a real HTML headline/CTA and a mobile crop that hides the gibberish text.

**Phase C — Hardening & infra (Prompts 6–7):** admin portal out of public view, dead passwords removed, robots/sitemap/security headers with camera allowed for VTO.

**Phase D — Verify (Prompt 8):** grep-verified Definition of Done + manual click-through script.

**Guiding rules for every prompt**
1. No visual redesign — all new UI reuses the existing tokens (`--color-bg #FAF8F4`, `--color-text #322325`, `--color-gold #C08B5D`, `--color-border #E2DDD8`, Playfair Display / Jost / Cormorant).
2. No invented business data. Anything not yet real (WhatsApp number, email, passcode) is a clearly marked `OWNER-INPUT` placeholder — graceful degradation until you fill it.
3. Static-site only: vanilla JS/CSS files at repo root (matching existing structure). No build step, no framework.
4. PowerShell 5.1-safe verification only (`Select-String`, `Invoke-WebRequest -UseBasicParsing`, `try/catch`).
5. Antigravity **commits but never pushes** — you push via GitHub Desktop.

---

## 4. OWNER INPUT — fill these in BEFORE Prompt 2 & 3 (10 minutes)

| # | Item | Where it goes | If you skip it |
|---|---|---|---|
| O1 | **Web3Forms access key** — free: signup at web3forms.com with `studio@abhushan.com` (or any inbox you check), key arrives by email. Free tier = 250 submissions/month. | `NOTIFY_KEY` in `notify.js` (Prompt 3) | Booking/newsletter forms keep localStorage-only behaviour + show WhatsApp fallback |
| O2 | **WhatsApp business number** in international format, digits only, e.g. `9198XXXXXXXX` | `WHATSAPP_NUMBER` in `cart.js` + `notify.js` config block | "Send Order on WhatsApp" buttons hide themselves (graceful) |
| O3 | **Admin passphrase** — one strong passphrase you'll remember | Prompt 6 (replaces `admin123`/`abhushan2026`) | Prompt 6 leaves `abhushan2026` as the only remaining passcode |
| O4 | **New admin URL slug** — anything unguessable, e.g. `portal-ab91x4.html` | Prompt 6 file rename | Prompt 6 keeps `admin.html` (still noindex + no hints) |
| O5 | **Hero image, text-free** — regenerate `images/extras/hero_main.png` at 2400×1350 with **no lettering anywhere** (ask the image model: "no text, no letters, no typography"). Keep: candlelit chaise, model on the right, clean left third. | replaces same path | Prompt 5's overlay + mobile crop still hide most of the gibberish |
| O6 | **`images/og-image.jpg`** — 1200×630: hero crop + "Abhushan · Fine Gold Jewellery · Ahmedabad" set in Playfair | replaces 404 path | og:image falls back to hero_main.png (Prompt 4 wires this) |
| O7 | Confirm **real phone / email / socials**. If `+91 79 4001 2345` or `studio@abhushan.com` are placeholders, tell me and I'll issue a 2-line patch. Pinterest/Facebook profiles: create them or we keep the icons hidden (Prompt 1 hides until real). | — | Placeholder icons stay hidden |
| O8 | Before real launch: replace demo testimonials with real ones (with permission). Not blocking the prompts below. | — | — |

---

## 5. ANTIGRAVITY PROMPTS — feed them one at a time, in order

### PROMPT 1 — Mobile menu readability + dead-UI removal + EMI dedup + search pills

**Goal:** Fix the unreadable mobile menu at its root cause, remove the fake "Quick View" button, stop the duplicate EMI teaser on product pages, and make every search pill return results.

**Strict scope — touch ONLY:**
- `styles.css` (one z-index value)
- `script.js` (three surgical edits)
- The "Popular Searches" pill block (it exists twice: in the HTML of index.html + all 5 product pages, AND inside `injectSearchWidget()` in script.js — change both so they stay in sync)

**Do NOT touch:** Virtual Try-On code, wishlist logic, booking form, chat widget, any `<section>` markup, any design tokens, admin code.

**Steps:**
1. In `styles.css`, find the rule:
   ```css
   .overlay-bg { position: fixed; inset: 0; background: rgba(26, 23, 20, 0.6); backdrop-filter: blur(4px); z-index: 200; ... }
   ```
   Change `z-index: 200;` → `z-index: 90;` in that rule ONLY. (Root cause: the 60%-black overlay sits above the 100-z header, so the open mobile menu renders behind the blur. 90 keeps the dim below the header but above the page.)
2. In `styles.css`, append at the very end (new rule, does not affect anything else):
   ```css
   /* Mobile menu: guarantee readable contrast regardless of overlay state */
   .mobile-menu.open .mobile-nav-link { color: var(--color-text); opacity: 1; }
   ```
3. In `script.js`, inside `initMicroInteractions()`, delete the entire block that injects the dead Quick View button:
   ```js
   // 1. Inject Quick View Button into Product Cards
   const productWraps = document.querySelectorAll('.product-image-wrap');
   productWraps.forEach(wrap => { ... });
   ```
   (It creates `.quick-view-overlay-btn` with no click handler — dead UI.)
4. In `script.js`, inside the IIFE `initEMI`, immediately after the line
   `var priceEl = document.querySelector('.product-price-detail-tiffany'); if (!priceEl) return;`
   insert:
   ```js
   if (document.querySelector('.product-emi-container-tiffany')) return; // static EMI accordion already present on PDPs
   ```
5. Replace the five popular-search pill buttons (in `index.html`, in all five `product-*.html` files, and in the template string inside `injectSearchWidget()` in `script.js` — identical markup in all three places) with:
   ```html
   <button type="button" class="popular-tag-pill-tiffany" data-query="Rings">Rings</button>
   <button type="button" class="popular-tag-pill-tiffany" data-query="Necklaces">Necklaces</button>
   <button type="button" class="popular-tag-pill-tiffany" data-query="Earrings">Earrings</button>
   <button type="button" class="popular-tag-pill-tiffany" data-query="Bracelets">Bracelets</button>
   <button type="button" class="popular-tag-pill-tiffany" data-query="Gifts">Gifts</button>
   ```
6. In `script.js`, inside `searchCatalog`, add the keywords `"gift", "gifts", "wedding", "bridal"` to **every** entry's `keywords` array (append, don't replace existing keywords), and add `"welded", "forever", "permanent"` to the Sweet Nothing Bracelet entry. This makes the "Gifts" pill and everyday searches return all 5 products.

**Verify (PowerSpace… PowerShell 5.1):**
```powershell
Select-String -Path .\styles.css -Pattern "z-index:\s*90" | Select-String -SimpleMatch "overlay" -Context 0,0 -Quiet
Select-String -Path .\styles.css -Pattern "\.overlay-bg[\s\S]{0,200}z-index:\s*90" -Quiet
Select-String -Path .\script.js -Pattern "quick-view-overlay-btn" -Quiet   # must be False
Select-String -Path .\script.js -Pattern "product-emi-container-tiffany'\)\) return" -Quiet  # must be True
Select-String -Path .\index.html -Pattern 'data-query="Emerald Rings"' -Quiet  # must be False
Select-String -Path .\script.js -Pattern '"gifts"' -Quiet  # must be True
```
Then in the browser: open site on a ≤430px viewport → hamburger → the five links must be fully readable dark charcoal on ivory, dimmed page behind them, menu text NOT blurred.

**Visual check:** mobile menu open state; PDP price block shows exactly ONE "or ₹X/month with EMI" teaser row; Quick View hover gone on product cards.

**Commit:** `git add -A && git commit -m "fix: mobile menu layering, remove dead quick-view, dedupe EMI, searchable popular tags" && git log -1` — **never push.**

---

### PROMPT 2 — Real Bag (cart) with WhatsApp checkout + honest wishlist

**Goal:** Replace the fake "Add to Bag" with a working bag: size-aware items, drawer UI in the existing Tiffany design language, free-shipping progress, EMI teaser line, **checkout via WhatsApp** (primary) and **email reservation** (fallback). Make wishlist "Move All to Bag" actually move items.

**Strict scope — create 2 new files, edit 7 HTML files + 1 JS file:**
- CREATE `cart.css`, `cart.js` (full code below)
- EDIT `index.html` + all five `product-*.html`: add `<link>` + `<script>` tags and one tiny inline `addToBag` body change
- EDIT `script.js`: only the `#wl-move-all` handler block

**Do NOT touch:** styles.css, any section markup, VTO, booking, chat, admin.

**Step 1 — In each of the 6 pages (index + 5 PDPs):**
after the existing `<link rel="stylesheet" href="styles.css" />` add:
```html
<link rel="stylesheet" href="cart.css" />
```
and before the existing `<script src="script.js"></script>` add:
```html
<script src="cart.js"></script>
```

**Step 2 — In each of the five `product-*.html` files**, in the inline `<script>` near the footer, replace the whole `addToBag` function with:
```js
function addToBag(productName) {
  if (window.AbhushanCart) { window.AbhushanCart.addByName(productName); }
}
```
Also in each PDP's size selector, remove the `active` class from the first size button (customer must choose consciously):
`class="size-option-btn-tiffany active"` → `class="size-option-btn-tiffany"` (only for the pre-highlighted button).

**Step 3 — In `script.js`**, find the handler wired to `#wl-move-all` (inside `renderDrawerContent`) and replace its body with:
```js
moveAllBtn.addEventListener('click', function() {
  if (window.AbhushanCart && wishlist.length) {
    wishlist.forEach(function(p) { window.AbhushanCart.addFromWishlist(p.name); });
    wishlist = [];
    save();
    updateBadge();
    refreshDrawer();
    updateCardHearts();
    updatePDPHeart();
  }
});
```

**Step 4 — CREATE `cart.js` with EXACTLY this content** (fill `WHATSAPP_NUMBER` from owner input O2; leave the Web3Forms key — Prompt 3's notify.js handles email):

```js
/* =============================================================
   ABHUSHAN — Bag (cart) manager · Vanilla JS · localStorage
   WhatsApp checkout for Indian studio jewellery
   ============================================================= */
(function () {
  'use strict';
  var CONFIG = {
    WHATSAPP_NUMBER: 'OWNER-INPUT-919XXXXXXXXX', // digits only, no +
    CURRENCY: '₹',
    FREE_SHIP: 10000
  };
  var KEY = 'abhushan_cart_v1';
  var PRODUCTS = {
    'Threadbare Ring':       { price: 3999,  img: 'images/_Product%20Cards/prod_ring1.png',     href: 'product-threadbare-ring.html', category: 'Rings' },
    'Hammered Hoop Earring': { price: 5299,  img: 'images/_Product%20Cards/prod_earring1.png',  href: 'product-hammered-hoop.html',   category: 'Earrings' },
    'Greco Lariat':          { price: 32999, img: 'images/_Product%20Cards/prod_necklace1.png', href: 'product-greco-lariat.html',    category: 'Necklaces' },
    'Sweet Nothing Bracelet':{ price: 11299, img: 'images/_Product%20Cards/prod_bracelet1.png', href: 'product-sweet-nothing.html',   category: 'Bracelets' },
    'Tomboy Ring':           { price: 21999, img: 'images/_Product%20Cards/prod_ring2.png',     href: 'product-tomboy-ring.html',     category: 'Rings' }
  };
  var items = [];
  function load(){ try { items = JSON.parse(localStorage.getItem(KEY)) || []; } catch(e){ items = []; } }
  function save(){ try { localStorage.setItem(KEY, JSON.stringify(items)); } catch(e){} }
  function inr(n){
    var s = Math.ceil(n).toString();
    if (s.length <= 3) return CONFIG.CURRENCY + s;
    var last3 = s.slice(-3), rest = s.slice(0,-3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    return CONFIG.CURRENCY + rest + ',' + last3;
  }
  function subtotal(){ return items.reduce(function(t,i){ return t + i.price; }, 0); }
  function count(){ return items.length; }

  /* ---------- toast ---------- */
  var toastTimer = null;
  function toast(msg){
    var t = document.getElementById('bag-toast');
    if (!t) {
      t = document.createElement('div'); t.id = 'bag-toast'; t.className = 'bag-toast';
      t.setAttribute('role','status'); t.setAttribute('aria-live','polite');
      document.body.appendChild(t);
    }
    t.innerHTML = '<span>' + msg + '</span>';
    t.classList.add('visible');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ t.classList.remove('visible'); }, 2600);
  }

  /* ---------- header button ---------- */
  var btn = null, badge = null;
  function injectHeaderButton(){
    var right = document.querySelector('.nav-top-right');
    if (!right || document.getElementById('nav-bag-btn')) return;
    btn = document.createElement('button');
    btn.className = 'nav-bag-btn'; btn.id = 'nav-bag-btn';
    btn.type = 'button'; btn.setAttribute('aria-label','Open bag');
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 7h12l1.5 13.5a1 1 0 0 1-1 1.1H5.5a1 1 0 0 1-1-1.1L6 7z"/><path d="M9 10V6a3 3 0 0 1 6 0v4"/></svg>';
    badge = document.createElement('span');
    badge.className = 'bag-badge'; badge.id = 'bag-badge'; badge.setAttribute('aria-live','polite');
    badge.textContent = '0';
    btn.appendChild(badge);
    btn.addEventListener('click', openDrawer);
    right.appendChild(btn);
    updateBadge();
  }
  function updateBadge(){
    if (!badge) return;
    badge.textContent = count();
    badge.classList.toggle('visible', count() > 0);
  }

  /* ---------- drawer ---------- */
  var overlay = null, drawer = null;
  function buildShell(){
    overlay = document.createElement('div'); overlay.className = 'bag-overlay'; overlay.id = 'bag-overlay';
    overlay.addEventListener('click', closeDrawer);
    drawer = document.createElement('aside'); drawer.className = 'bag-drawer'; drawer.id = 'bag-drawer';
    drawer.setAttribute('role','dialog'); drawer.setAttribute('aria-modal','true'); drawer.setAttribute('aria-label','Your bag');
    document.body.appendChild(overlay); document.body.appendChild(drawer);
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer(); });
  }
  function render(){
    if (!drawer) return;
    var sub = subtotal(), n = count();
    var rows = items.map(function(i, idx){
      return '<div class="bag-item" style="animation-delay:' + (idx*0.05) + 's">'
        + '<a class="bag-item-thumb" href="' + i.href + '"><img src="' + i.img + '" alt="' + i.name + '" loading="lazy"></a>'
        + '<div class="bag-item-info"><p class="bag-item-name">' + i.name + '</p>'
        + (i.size ? '<p class="bag-item-size">Size ' + i.size + '</p>' : '')
        + '<p class="bag-item-price">' + inr(i.price) + '</p></div>'
        + '<button type="button" class="bag-item-remove" data-idx="' + idx + '" aria-label="Remove ' + i.name + '">&times;</button>'
        + '</div>';
    }).join('');
    var remain = CONFIG.FREE_SHIP - sub;
    var shipPct = Math.max(0, Math.min(100, (sub / CONFIG.FREE_SHIP) * 100));
    var shipBlock = n === 0 ? '' :
      '<div class="bag-ship">'
      + (remain > 0
          ? '<p>' + inr(remain) + ' away from <strong>free insured shipping</strong></p>'
          : '<p class="unlocked">✦ Free insured shipping unlocked</p>')
      + '<div class="bag-ship-bar"><span style="width:' + shipPct + '%"></span></div></div>';
    var emi = n === 0 ? '' : '<p class="bag-emi">or ' + inr(sub/12) + '/month with 12-month EMI at 0% interest</p>';
    var body = n === 0
      ? '<div class="bag-empty"><p class="bag-empty-title">Your bag is empty.</p><p class="bag-empty-sub">Solid gold, handcrafted in Ahmedabad, made to be worn every day.</p><a class="bag-cta bag-cta-secondary" href="index.html#section-products">Explore Collections</a></div>'
      : '<div class="bag-list">' + rows + '</div>'
        + shipBlock + emi
        + '<div class="bag-subtotal"><span>Subtotal</span><strong>' + inr(sub) + '</strong></div>'
        + '<div class="bag-ctas">'
        + (CONFIG.WHATSAPP_NUMBER.indexOf('OWNER-INPUT') === -1
            ? '<button type="button" class="bag-cta bag-cta-primary" id="bag-wa">Send Order on WhatsApp</button>'
            : '')
        + '<button type="button" class="bag-cta bag-cta-secondary" id="bag-email">Reserve by Email</button>'
        + '</div>'
        + '<p class="bag-note">We confirm every order personally within 2 hours · Mon–Sat 10 AM – 7 PM IST</p>';
    drawer.innerHTML = '<div class="bag-header"><h2 class="bag-title">Your Bag' + (n ? ' <span class="bag-count">(' + n + ')</span>' : '') + '</h2>'
      + '<button type="button" class="bag-close" id="bag-close" aria-label="Close bag">&times;</button></div>' + body;
    var c = document.getElementById('bag-close'); if (c) c.addEventListener('click', closeDrawer);
    drawer.querySelectorAll('.bag-item-remove').forEach(function(b){
      b.addEventListener('click', function(){
        items.splice(parseInt(b.getAttribute('data-idx'),10), 1); save(); updateBadge(); render();
      });
    });
    var wa = document.getElementById('bag-wa');
    if (wa) wa.addEventListener('click', checkoutWhatsApp);
    var em = document.getElementById('bag-email');
    if (em) em.addEventListener('click', checkoutEmail);
  }
  function openDrawer(){ if (!drawer) buildShell(); render(); overlay.classList.add('open'); drawer.classList.add('open'); document.body.style.overflow = 'hidden'; }
  function closeDrawer(){ if (!drawer) return; overlay.classList.remove('open'); drawer.classList.remove('open'); document.body.style.overflow = ''; }

  /* ---------- add flows ---------- */
  function add(name, size){
    var p = PRODUCTS[name]; if (!p) return;
    items.push({ name: name, price: p.price, img: p.img, href: p.href, size: size || null });
    save(); updateBadge(); render();
    toast('✓ ' + name + ' added to your bag');
    if (badge) { badge.classList.remove('pop'); void badge.offsetWidth; badge.classList.add('pop'); }
  }
  function addByName(name){
    var wrap = document.querySelector('.size-selector-wrap-tiffany');
    var chosen = document.querySelector('.size-option-btn-tiffany.active');
    if (wrap && !chosen) {
      wrap.classList.remove('shake'); void wrap.offsetWidth; wrap.classList.add('shake');
      toast('Please select a size first');
      return;
    }
    add(name, chosen ? chosen.textContent.trim() : null);
  }
  function addFromWishlist(name){ add(name, null); }

  /* ---------- checkout ---------- */
  function orderLines(){
    return items.map(function(i){ return '• ' + i.name + (i.size ? ' (Size ' + i.size + ')' : '') + ' — ' + inr(i.price); }).join('\n');
  }
  function checkoutWhatsApp(){
    if (!count()) return;
    var msg = 'Namaste Abhushan ✦\nI would like to order:\n\n' + orderLines()
      + '\n\nSubtotal: ' + inr(subtotal())
      + (subtotal() >= CONFIG.FREE_SHIP ? '\nFree insured shipping applied' : '')
      + '\n\nSent from abhushan-by-divyaraj.vercel.app';
    window.open('https://wa.me/' + CONFIG.WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  }
  function checkoutEmail(){
    if (!count()) return;
    if (window.AbhushanNotify && window.AbhushanNotify.order) {
      window.AbhushanNotify.order(items, subtotal(), inr);
    } else {
      toast('WhatsApp is the fastest way to order right now ✦');
      checkoutWhatsApp();
    }
  }

  load();
  injectHeaderButton();
  window.AbhushanCart = {
    add: add, addByName: addByName, addFromWishlist: addFromWishlist,
    open: openDrawer, close: closeDrawer, count: count, subtotal: subtotal, inr: inr, CONFIG: CONFIG
  };
})();
```

**Step 5 — CREATE `cart.css` with EXACTLY this content:**

```css
/* =============================================================
   ABHUSHAN — Bag drawer · matches design tokens in styles.css
   ============================================================= */
.bag-overlay {
  position: fixed; inset: 0; background: rgba(26,23,20,0.5);
  opacity: 0; pointer-events: none; transition: opacity .3s cubic-bezier(.25,.46,.45,.94);
  z-index: 9992;
}
.bag-overlay.open { opacity: 1; pointer-events: all; }
.bag-drawer {
  position: fixed; top: 0; right: 0; height: 100dvh; width: min(420px, 100vw);
  background: var(--color-bg, #FAF8F4); color: var(--color-text, #322325);
  z-index: 9993; transform: translateX(100%); transition: transform .38s cubic-bezier(.25,.46,.45,.94);
  display: flex; flex-direction: column; padding: 28px 26px; overflow-y: auto;
  box-shadow: -12px 0 48px rgba(0,0,0,.14);
}
.bag-drawer.open { transform: translateX(0); }
.bag-header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 18px; border-bottom: 1px solid var(--color-border, #E2DDD8); }
.bag-title { font-family: 'Playfair Display', Georgia, serif; font-weight: 400; font-size: 24px; margin: 0; letter-spacing: .01em; }
.bag-count { color: var(--color-gold, #C08B5D); font-size: 18px; }
.bag-close { background: none; border: none; font-size: 28px; line-height: 1; cursor: pointer; color: var(--color-text, #322325); padding: 4px 8px; }
.bag-list { flex: 0 1 auto; overflow-y: auto; margin: 6px 0 12px; }
.bag-item { display: flex; gap: 14px; align-items: center; padding: 14px 0; border-bottom: 1px solid var(--color-border, #E2DDD8); animation: bagIn .35s both; }
@keyframes bagIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.bag-item-thumb { width: 72px; height: 88px; flex: 0 0 auto; border-radius: 999px 999px 6px 6px; overflow: hidden; background: var(--color-beige, #E2D9CF); display: block; }
.bag-item-thumb img { width: 100%; height: 100%; object-fit: cover; }
.bag-item-info { flex: 1; }
.bag-item-name { margin: 0; font-size: 15px; letter-spacing: .02em; }
.bag-item-size { margin: 2px 0 0; font-size: 12px; color: var(--color-text-light, #6B6460); text-transform: uppercase; letter-spacing: .08em; }
.bag-item-price { margin: 6px 0 0; font-size: 14px; color: var(--color-text-light, #6B6460); }
.bag-item-remove { background: none; border: none; font-size: 20px; cursor: pointer; color: var(--color-text-muted, #9C9490); padding: 6px; }
.bag-item-remove:hover { color: var(--color-text, #322325); }
.bag-ship { margin: 14px 0 4px; }
.bag-ship p { margin: 0 0 6px; font-size: 12.5px; letter-spacing: .04em; color: var(--color-text-light, #6B6460); }
.bag-ship p.unlocked { color: var(--color-emerald, #226836); }
.bag-ship-bar { height: 3px; background: var(--color-border, #E2DDD8); border-radius: 2px; overflow: hidden; }
.bag-ship-bar span { display: block; height: 100%; background: var(--color-gold, #C08B5D); transition: width .4s ease; }
.bag-emi { margin: 10px 0 0; font-size: 12.5px; color: var(--color-text-light, #6B6460); font-style: italic; }
.bag-subtotal { display: flex; justify-content: space-between; align-items: baseline; padding: 16px 0 6px; font-size: 15px; letter-spacing: .05em; text-transform: uppercase; }
.bag-subtotal strong { font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: 500; }
.bag-ctas { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; }
.bag-cta { display: block; width: 100%; padding: 15px 18px; text-align: center; font-size: 12.5px; letter-spacing: .16em; text-transform: uppercase; cursor: pointer; transition: all .25s ease; border: 1px solid transparent; }
.bag-cta-primary { background: var(--color-gold, #C08B5D); color: #fff; }
.bag-cta-primary:hover { background: #a9764c; }
.bag-cta-secondary { background: transparent; color: var(--color-text, #322325); border-color: var(--color-text, #322325); }
.bag-cta-secondary:hover { background: var(--color-text, #322325); color: #fff; }
.bag-note { margin: 14px 0 0; font-size: 11.5px; text-align: center; color: var(--color-text-muted, #9C9490); letter-spacing: .03em; }
.bag-empty { text-align: center; padding: 56px 8px; }
.bag-empty-title { font-family: 'Playfair Display', Georgia, serif; font-size: 22px; margin: 0 0 8px; }
.bag-empty-sub { font-size: 13.5px; color: var(--color-text-light, #6B6460); margin: 0 0 22px; line-height: 1.6; }
.bag-empty .bag-cta { display: inline-block; width: auto; }
.nav-bag-btn { position: relative; background: none; border: none; cursor: pointer; color: inherit; padding: 6px; display: inline-flex; }
.bag-badge { position: absolute; top: -2px; right: -4px; min-width: 16px; height: 16px; border-radius: 8px; background: var(--color-gold, #C08B5D); color: #fff; font-size: 10px; line-height: 16px; text-align: center; padding: 0 4px; opacity: 0; transform: scale(.6); transition: all .25s ease; }
.bag-badge.visible { opacity: 1; transform: scale(1); }
.bag-badge.pop { animation: bagPop .35s ease; }
@keyframes bagPop { 40% { transform: scale(1.35); } 100% { transform: scale(1); } }
.bag-toast { position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%) translateY(12px); background: #1a1714; color: #fff; padding: 13px 26px; font-family: 'Jost', sans-serif; font-size: 13px; letter-spacing: .05em; z-index: 10002; opacity: 0; transition: all .35s ease; pointer-events: none; }
.bag-toast.visible { opacity: 1; transform: translateX(-50%) translateY(0); }
.size-selector-wrap-tiffany.shake { animation: sizeShake .4s ease; }
@keyframes sizeShake { 20%, 60% { transform: translateX(-5px); } 40%, 80% { transform: translateX(5px); } }
@media (max-width: 480px) { .bag-drawer { padding: 22px 18px; } }
```

**Verify (PowerShell 5.1):**
```powershell
Select-String -Path .\cart.js -Pattern "window.AbhushanCart" -Quiet                 # True
Select-String -Path .\cart.css -Pattern "\.bag-drawer" -Quiet                       # True
Select-String -Path .\index.html -Pattern 'href="cart.css"' -Quiet                  # True
Select-String -Path .\product-tomboy-ring.html -Pattern 'src="cart.js"' -Quiet      # True
Select-String -Path .\product-*.html -Pattern "window.AbhushanCart.addByName" -Quiet # True for all 5
Select-String -Path .\script.js -Pattern "AbhushanCart.addFromWishlist" -Quiet      # True
node --check .\cart.js   # if node available; must print no errors
```
Browser click-through: PDP → choose size → Add to Bag → badge increments → drawer slides in → remove item works → wishlist Move All to Bag fills the drawer → empty state renders. Confirm no console errors.

**Commit:** `git add -A && git commit -m "feat: real bag with size capture, free-shipping progress, WhatsApp checkout; wishlist move-all wired" ` — **never push.**

---

### PROMPT 3 — Forms that actually reach you (Web3Forms) + honest chat

**Goal:** Every booking, newsletter signup and offline chat message must land in the owner's email inbox (reply-able), while keeping the existing success UI. The chat robot becomes honest about being an assistant and offers WhatsApp.

**Strict scope — CREATE `notify.js`; EDIT `script.js` (4 handler blocks) and `index.html` + 5 PDPs (one `<script>` tag each). Do NOT touch cart.js/cart.css from Prompt 2, styles.css, VTO, admin, any section markup.**

**Step 1 — CREATE `notify.js` with EXACTLY this content** (fill `KEY` from owner input O1, `WHATSAPP_NUMBER` from O2):

```js
/* =============================================================
   ABHUSHAN — Notification relay · Web3Forms (email delivery)
   Graceful: if KEY is not configured, everything degrades to
   localStorage-only + WhatsApp fallback, never blocks the user.
   ============================================================= */
(function () {
  'use strict';
  var CONFIG = {
    KEY: 'OWNER-INPUT-WEB3FORMS-KEY',
    WHATSAPP_NUMBER: 'OWNER-INPUT-919XXXXXXXXX', // digits only, no +
    ENDPOINT: 'https://api.web3forms.com/submit'
  };
  function ready() { return CONFIG.KEY.indexOf('OWNER-INPUT') === -1; }
  function send(subject, fields, replyTo) {
    if (!ready()) return Promise.resolve({ ok: false, skipped: true });
    var payload = Object.assign({
      access_key: CONFIG.KEY,
      subject: subject,
      from_name: 'Abhushan Website',
      botcheck: ''
    }, fields);
    if (replyTo) payload.replyto = replyTo;
    return fetch(CONFIG.ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) { return r.json(); }).catch(function () { return { ok: false }; });
  }
  function whatsappLink(text) {
    return 'https://wa.me/' + CONFIG.WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text);
  }
  window.AbhushanNotify = { send: send, ready: ready, whatsappLink: whatsappLink,
    order: function (items, sub, inr) {
      var lines = items.map(function (i) { return '• ' + i.name + (i.size ? ' (Size ' + i.size + ')' : '') + ' — ' + inr(i.price); }).join('\n');
      send('Order reservation — ' + inr(sub), {
        order_items: lines, subtotal: inr(sub), page: location.href
      }).then(function () {
        alert('Reservation sent! We will confirm within 2 hours (Mon–Sat 10–7 IST).');
      });
    }
  };
})();
```

**Step 2 — In each of the 6 pages (index + 5 PDPs)**, after the Prompt 2 `<script src="cart.js"></script>` line and before `<script src="script.js"></script>`, add:
```html
<script src="notify.js"></script>
```

**Step 3 — EDIT `script.js` — booking form.** The form currently has TWO submit listeners (one saves to localStorage + toast; one inside `initMicroInteractions` shows spinner/success). Consolidate:
- In the FIRST booking handler (the one that builds `newBooking`), keep the localStorage save, and immediately after `localStorage.setItem('abhushan_appointments', JSON.stringify(appointments));` insert:
```js
if (window.AbhushanNotify) {
  window.AbhushanNotify.send('Studio booking ' + bookingId + ' — ' + service, {
    booking_id: bookingId, name: name, email: email, phone: phone,
    date: date, time: time, service: service, notes: notes
  }, email).then(function (res) {
    if (!res || !res.ok) {
      showToast('Saved! For instant confirmation, also WhatsApp us ✦');
      if (window.AbhushanNotify && window.AbhushanNotify.whatsappLink && !window.AbhushanNotify.ready()) {
        // key not configured yet — surface WhatsApp fallback once
        console.info('Web3Forms key missing: set OWNER-INPUT in notify.js');
      }
    }
  });
}
```
- Leave the second (spinner/success) handler untouched — the visuals already work.

**Step 4 — EDIT `script.js` — footer newsletter.** Find the boot section (near `initApp`) and ADD a handler (new block right before `function initNewsletterPopup()` definition or at the end of the IIFE, same scope):
```js
(function initFooterSubscribe() {
  var form = document.getElementById('footer-subscribe-form');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var input = form.querySelector('input[type="email"]');
    var email = input ? input.value.trim() : '';
    if (!email) return;
    var list = [];
    try { list = JSON.parse(localStorage.getItem('abhushan_newsletter_emails')) || []; } catch (err) {}
    list.push({ email: email, date: new Date().toISOString(), source: 'footer' });
    localStorage.setItem('abhushan_newsletter_emails', JSON.stringify(list));
    if (window.AbhushanNotify) {
      window.AbhushanNotify.send('Newsletter signup — Inner Circle', { email: email, source: 'footer' }, email);
    }
    input.value = '';
    if (typeof showToast === 'function') showToast('Welcome to the Inner Circle ✦');
  });
})();
```

**Step 5 — EDIT `script.js` — newsletter popup.** Inside `#newsletter-popup-form` submit handler, after `localStorage.setItem('abhushan_newsletter_emails', ...)` insert:
```js
if (window.AbhushanNotify) {
  window.AbhushanNotify.send('Newsletter signup — popup', { email: email, source: 'popup' }, email);
}
```

**Step 6 — EDIT `script.js` — chat honesty + delivery.**
a) Replace the `consultantReplies` array (5 canned strings) with ONE honest auto-reply used every time:
```js
const consultantReplies = [
  "I'm the Abhushan studio assistant — for a personal reply about gold, sizing or custom work, WhatsApp us and a goldsmith will answer within studio hours (Mon–Sat 10–7 IST). You can also book a studio visit below."
];
```
b) In the offline form handler (`#chat-offline-form` submit), after `localStorage.setItem('abhushan_chat_form', ...)` insert:
```js
if (window.AbhushanNotify) {
  window.AbhushanNotify.send('Chat message (offline) — ' + name, { name: name, email: email, message: msg }, email);
}
```
c) In the pre-chat form handler (`#chat-prechat-form` submit), after `localStorage.setItem('abhushan_chat_form', ...)` insert:
```js
if (window.AbhushanNotify) {
  window.AbhushanNotify.send('Chat request — ' + topic, { name: name, email: email, topic: topic }, email);
}
```

**Step 7 — Chat header WhatsApp button.** In `injectChatWidget()`'s `container.innerHTML`, inside `.chat-header-info`, below `.chat-status-row`, add:
```html
<a class="chat-wa-btn" href="#" id="chat-wa-btn" target="_blank" rel="noopener">WhatsApp the Studio</a>
```
and right after `document.body.appendChild(container);` add:
```js
var waBtn = document.getElementById('chat-wa-btn');
if (waBtn && window.AbhushanNotify) {
  waBtn.setAttribute('href', window.AbhushanNotify.whatsappLink('Namaste Abhushan ✦ I have a question about your jewellery.'));
  if (window.AbhushanNotify.ready() === false) { /* still show — number may be configured even if key isn't */ }
}
```
and append to `styles.css`… **wait — styles.css is out of scope here**, so instead append the one rule to `cart.css` (already loaded on all 6 pages):
```css
/* Chat WhatsApp CTA (Prompt 3) */
.chat-wa-btn { display: inline-block; margin-top: 8px; padding: 8px 14px; background: var(--color-gold, #C08B5D); color: #fff !important; font-size: 11.5px; letter-spacing: .12em; text-transform: uppercase; text-decoration: none; border-radius: 2px; }
.chat-wa-btn:hover { background: #a9764c; }
```

**Verify (PowerShell 5.1):**
```powershell
Select-String -Path .\notify.js -Pattern "api.web3forms.com" -Quiet                  # True
Select-String -Path .\index.html -Pattern 'src="notify.js"' -Quiet                   # True
Select-String -Path .\product-tomboy-ring.html -Pattern 'src="notify.js"' -Quiet     # True
Select-String -Path .\script.js -Pattern "initFooterSubscribe" -Quiet                # True
Select-String -Path .\script.js -Pattern "studio assistant" -Quiet                   # True
node --check .\notify.js                                                              # no errors
```
Browser: submit booking with a real email you control → check inbox (after O1 filled; before O1, verify the toast "Saved! For instant confirmation, also WhatsApp us" appears and no console errors). Footer ➔ no page reload, toast appears. Chat shows WhatsApp button.

**Commit:** `git add -A && git commit -m "feat: web3forms relay for bookings/newsletter/chat, honest chat assistant with WhatsApp CTA" ` — **never push.**

---

### PROMPT 4 — Real SEO: per-product heads, clean schema, working share image

**Goal:** Every page gets its own title/description/canonical/OG, every schema URL points at the real deployment, social shares show an image. No new design.

**Strict scope — `<head>` sections + footer social icons only. Do NOT touch any visible body content except the two social icon anchors.**

**Step 1 — index.html `<head>`:**
- Replace every `https://abhushan.com` with `https://abhushan-by-divyaraj.vercel.app` (canonical, og:url, twitter:url, JSON-LD urls).
- Replace `<meta property="og:image" content="images/og-image.jpg" />` and the twitter:image equivalent with:
  ```html
  <meta property="og:image" content="https://abhushan-by-divyaraj.vercel.app/images/og-image.jpg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  ```
  (If owner input O6 isn't done yet, use `images/extras/hero_main.png` in the content instead — same absolute prefix.)
- In the **Organization** schema: replace `"logo": "https://abhushan.com/images/logo.png"` with `"logo": "https://abhushan-by-divyaraj.vercel.app/images/favicon.png"`.
- In the **JewelryStore** schema: delete the `"telephone": "+91-79-XXXXXXXX",` line entirely (better absent than placeholder), replace `"image": "https://abhushan.com/images/studio.jpg"` with `"image": "https://abhushan-by-divyaraj.vercel.app/images/studio_interior.png"`, replace `"streetAddress": "101, Luxury Arcade, CG Road",` with `"streetAddress": "101 Heritage Arcade, CG Road, Navrangpura",`, replace `"postalCode": "380009"` with `"postalCode": "380001"`, and in `openingHoursSpecification` change `"opens": "11:00"` → `"opens": "10:00"` and `"closes": "20:00"` → `"closes": "19:00"` — so the machine-readable data matches what humans read on the page.
- In each of the **5 Product** schemas: set `"url"` to the real product page, e.g. `"url": "https://abhushan-by-divyaraj.vercel.app/product-threadbare-ring.html"`, and prefix each `"image"` with `https://abhushan-by-divyaraj.vercel.app/`.

**Step 2 — Each of the 5 product pages gets its own head.** All five currently ship the homepage head (homepage title, homepage description, 5 Product schemas + FAQPage). Replace the whole `<head>` content between the `<meta charset>` line and `</head>` with this template, filling the `{{PLACEHOLDERS}}` from the table below:

```html
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{{TITLE}}</title>
  <meta name="description" content="{{DESC}}" />
  <link rel="canonical" href="https://abhushan-by-divyaraj.vercel.app/{{FILE}}" />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  <meta property="og:type" content="product" />
  <meta property="og:url" content="https://abhushan-by-divyaraj.vercel.app/{{FILE}}" />
  <meta property="og:title" content="{{TITLE}}" />
  <meta property="og:description" content="{{DESC}}" />
  <meta property="og:image" content="https://abhushan-by-divyaraj.vercel.app/{{IMG}}" />
  <meta property="og:site_name" content="Abhushan" />
  <meta property="og:locale" content="en_IN" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{{TITLE}}" />
  <meta name="twitter:description" content="{{DESC}}" />
  <meta name="twitter:image" content="https://abhushan-by-divyaraj.vercel.app/{{IMG}}" />
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Jost:wght@300;400;500&family=Playfair+Display:ital,wght@0,300;0,400;1,300;1,400&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="styles.css" />
  <link rel="stylesheet" href="cart.css" />
  <link rel="icon" type="image/png" href="images/favicon.png" />
  <link rel="icon" type="image/svg+xml" href="images/favicon.svg" />
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "{{NAME}}",
    "description": "{{DESC}}",
    "image": "https://abhushan-by-divyaraj.vercel.app/{{IMG}}",
    "brand": { "@type": "Brand", "name": "Abhushan" },
    "offers": {
      "@type": "Offer",
      "price": "{{PRICE}}",
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
      "url": "https://abhushan-by-divyaraj.vercel.app/{{FILE}}"
    }
  }
  </script>
```

| {{FILE}} | {{NAME}} | {{TITLE}} | {{PRICE}} | {{IMG}} |
|---|---|---|---|---|
| product-threadbare-ring.html | Threadbare Ring | Threadbare Ring — 18K Solid Gold Stacking Ring \| Abhushan | 3999 | images/_Product%20Cards/prod_ring1.png |
| product-hammered-hoop.html | Hammered Hoop Earring | Hammered Hoop Earrings — Hand-Hammered 18K Gold \| Abhushan | 5299 | images/_Product%20Cards/prod_earring1.png |
| product-greco-lariat.html | Greco Lariat | Greco Lariat Necklace — 22K Solid Gold \| Abhushan | 32999 | images/_Product%20Cards/prod_necklace1.png |
| product-sweet-nothing.html | Sweet Nothing Bracelet | Sweet Nothing Bracelet — Delicate 18K Gold Chain \| Abhushan | 11299 | images/_Product%20Cards/prod_bracelet1.png |
| product-tomboy-ring.html | Tomboy Ring | Tomboy Ring — Bold Brushed 18K Gold Band \| Abhushan | 21999 | images/_Product%20Cards/prod_ring2.png |

`{{DESC}}` values (taken from the on-page copy — do not invent new claims):
- Threadbare: `A whisper of gold. An 18K solid gold stacking ring, barely there, impossible to forget. Handcrafted in our Ahmedabad studio.`
- Hammered Hoop: `Hand-hammered 18K gold hoops that catch light differently every hour of the day. Handcrafted in Ahmedabad.`
- Greco Lariat: `Inspired by the stepwells of Gujarat. Adjustable drop lariat in 22K solid gold, handcrafted in Ahmedabad.`
- Sweet Nothing: `A single delicate 18K gold chain that says everything without speaking. Handcrafted in Ahmedabad.`
- Tomboy: `Bold width, soft edges. A solid 18K gold band with a flat square-edge profile and hand-brushed matte finish. For people who don't do dainty.`

⚠️ Keep the `<link rel="stylesheet" href="cart.css" />` line ONLY if Prompt 2 was applied first (it adds it anyway) — if Prompt 2 already added it, don't duplicate.

**Step 3 — Footer social placeholders (all 7 pages):** delete the two dead anchors —
```html
<a href="https://www.pinterest.com/abhushan_placeholder/" ...>...</a>
<a href="https://www.facebook.com/abhushan_placeholder/" ...>...</a>
```
(keep Instagram). One icon until the real profiles exist.

**Verify (PowerShell 5.1):**
```powershell
Select-String -Path .\*.html -Pattern "abhushan.com/" -Quiet                      # False (no bare abhushan.com refs)
Select-String -Path .\product-tomboy-ring.html -Pattern "<title>Tomboy Ring" -Quiet   # True
Select-String -Path .\product-*.html -Pattern '"@type":\s*"Product"' -Quiet       # exactly 1 match per file
Select-String -Path .\index.html -Pattern "380001" -Quiet                          # True
Select-String -Path .\index.html -Pattern "abhushan_placeholder" -Quiet            # False
```
Then: share `https://abhushan-by-divyaraj.vercel.app/product-tomboy-ring.html` in a WhatsApp draft — a product image + product title must preview (after you push & deploy; verify again post-deploy).

**Commit:** `git add -A && git commit -m "seo: per-product titles/canonical/OG, real deployment URLs in schema, NAP consistency, drop placeholder socials" ` — **never push.**

---

### PROMPT 5 — Hero that converts + no-JS resilience + polish details

**Goal:** Give the hero a real HTML headline/CTAs (and stop depending on the baked-in image text), hide the AI-gibberish crop on mobile, and make the page not collapse when JS fails. Plus three small polish fixes.

**Strict scope — index.html hero section + styles.css (append-only rules) + script.js (one class toggle + one slot fix). Nothing else.**

**Step 1 — Hero overlay.** In `index.html`, inside `<section class="hero-section-tiffany" id="hero-slider">`, right AFTER the closing `</div>` of `.hero-image-container-tiffany`, insert:
```html
<div class="hero-overlay-content-tiffany">
  <p class="hero-eyebrow-tiffany">Handcrafted in Ahmedabad · Since 2004</p>
  <h1 class="hero-headline-tiffany">Your Heritage,<br>in Every Ornament</h1>
  <div class="hero-cta-row-tiffany">
    <a href="#section-products" class="hero-btn-tiffany hero-btn-solid-tiffany">Explore Collections</a>
    <a href="#booking-section" class="hero-btn-tiffany hero-btn-ghost-tiffany">Book a Studio Visit</a>
  </div>
</div>
```
(Headline deliberately mirrors the intended slogan with correct spelling — the baked-in image text says "heritags/ornernent".)

**Step 2 — styles.css append (end of file):**
```css
/* ---------- Hero overlay (Prompt 5) ---------- */
.hero-overlay-content-tiffany {
  position: absolute; left: 6vw; bottom: 10vh; z-index: 3;
  max-width: 560px; color: #fff;
}
.hero-eyebrow-tiffany { margin: 0 0 14px; font-size: 12px; letter-spacing: .28em; text-transform: uppercase; opacity: .85; }
.hero-headline-tiffany { margin: 0 0 26px; font-family: 'Playfair Display', Georgia, serif; font-weight: 400; font-size: clamp(34px, 5vw, 64px); line-height: 1.08; text-shadow: 0 2px 24px rgba(0,0,0,.35); }
.hero-cta-row-tiffany { display: flex; gap: 14px; flex-wrap: wrap; }
.hero-btn-tiffany { display: inline-block; padding: 15px 30px; font-size: 12px; letter-spacing: .18em; text-transform: uppercase; text-decoration: none; transition: all .3s var(--ease, ease); }
.hero-btn-solid-tiffany { background: var(--color-gold, #C08B5D); color: #fff; }
.hero-btn-solid-tiffany:hover { background: #a9764c; }
.hero-btn-ghost-tiffany { border: 1px solid rgba(255,255,255,.65); color: #fff; }
.hero-btn-ghost-tiffany:hover { background: rgba(255,255,255,.14); }
/* Mobile: crop the bottom of the hero (bakes-in gibberish text lives there) */
@media (max-width: 768px) {
  .hero-bg-img { object-position: 62% 18%; }
  .hero-overlay-content-tiffany { left: 6vw; right: 6vw; bottom: 7vh; }
}
```
Note: `hero-section-tiffany` must have `position: relative;` — if not already present, add `position: relative;` to that existing rule in styles.css (verify first with a grep; don't duplicate).

**Step 3 — JS-failure resilience.** The reveal system hides content (`opacity:0`) until IntersectionObserver adds classes. If JS never runs, the page stays blank below the hero.
- In ALL 7 HTML files, as the FIRST line inside `<head>`, add:
  ```html
  <script>document.documentElement.className += ' js';</script>
  ```
- In `styles.css`, find the `.fade-in-up {` rule (and any `reveal-on-scroll`/`reveal-active` initial-hidden rules — grep for `opacity: 0` occurrences tied to those classes) and prefix each selector with `.js ` so hidden states only apply when JS is running. Example:
  `/* was */ .fade-in-up { opacity: 0; transform: translateY(28px); ... }`
  `/* now */ .js .fade-in-up { opacity: 0; transform: translateY(28px); ... }`
  Keep every `.visible` / `.reveal-active` / `.active` (shown-state) rule unchanged.

**Step 4 — Booking slot fix.** In `index.html` and all 5 PDPs, in the `#booking-time` select, after the `05:00 PM - 06:00 PM` option add:
```html
<option value="06:00 PM - 07:00 PM">06:00 PM - 07:00 PM</option>
```
(matches the studio's posted 10–7 hours).

**Step 5 — Wishlist drawer empty-state CTA is `index.html#section-products`** — correct on every page, leave as is. No action.

**Verify (PowerShell 5.1):**
```powershell
Select-String -Path .\index.html -Pattern "hero-overlay-content-tiffany" -Quiet   # True
Select-String -Path .\styles.css -Pattern "\.js \.fade-in-up" -Quiet              # True
Select-String -Path .\index.html -Pattern "06:00 PM - 07:00 PM" -Quiet            # True
Select-String -Path .\product-greco-lariat.html -Pattern "06:00 PM - 07:00 PM" -Quiet  # True
```
Browser with JS disabled (DevTools → Disable JavaScript, hard reload): full homepage content must be visible (no blank ocean). With JS on: animations play as before; hero shows headline + two CTAs; on iPhone width the gibberish text is out of frame.

**Commit:** `git add -A && git commit -m "feat: hero headline/CTA overlay, mobile hero crop, no-js content resilience, 6-7pm slot" ` — **never push.**

---

### PROMPT 6 — Admin portal hardening (out of public view)

**Goal:** Stop advertising the admin entrance and passwords to the whole internet, without breaking Divyaraj's actual workflow. Dashboard features (stats, search, status flow, CSV export, Clear All) stay exactly as they are.

**Strict scope — rename 1 file, edit that file + remove admin remnants from index.html and the 5 product pages. Do NOT touch cart/notify/VTO/booking.**

**Step 1 — Rename.** Rename `admin.html` to the unguessable slug from owner input O4 (default: **`portal-ab91x4.html`**). Keep its content otherwise unchanged for now.

**Step 2 — Inside the renamed file:**
- Add `<meta name="robots" content="noindex, nofollow" />` right after the viewport meta.
- In the login handler, replace the accepted-password test:
  `if (enteredPassword === 'admin123' || enteredPassword === 'abhushan2026') {`
  with (owner input O3):
  `if (enteredPassword === 'OWNER-INPUT-NEW-PASSPHRASE') {`
- Remove any placeholder/hint text near the password input (there is none here, but verify no "e.g." hints remain anywhere).

**Step 3 — Remove ALL public admin remnants from `index.html` and the five `product-*.html`:**
1. Delete the entire `<!-- Admin Passcode Modal -->` block (`<div class="admin-modal-overlay" id="admin-modal-overlay">…</div>`).
2. In the footer legal line, change
   `<p class="footer-legal"><span id="admin-trigger" style="cursor: pointer; user-select: none;">©</span> 2026 Abhushan · …`
   to `<p class="footer-legal">© 2026 Abhushan · Ahmedabad, Gujarat, India · All Rights Reserved</p>`
3. In `script.js`, delete the whole `ADMIN PORTAL PASSCODE MODAL & AUTHENTICATION` section (the `adminTrigger`/`adminModal`/`adminLoginForm` listeners and the redirect to `admin.html`). Guard the rest of the IIFE so nothing after it breaks (the section is self-contained; removal is safe — verify no other references to `adminTrigger` remain).

**Step 4 — Consistency sweep:** grep all files for `admin.html`, `admin-trigger`, `admin-modal`, `admin123`, `abhushan2026` — every hit outside the renamed portal file must be gone. The renamed portal file keeps its own login (Step 2) and gains no inbound links (accessed by typing the URL only).

**Verify (PowerShell 5.1):**
```powershell
Test-Path .\portal-ab91x4.html        # True
Test-Path .\admin.html                # False
Select-String -Path .\*.html -Pattern "admin123|abhushan2026|admin-modal|admin-trigger" -Quiet   # False (portal file excluded if renamed; check it contains neither old password)
Select-String -Path .\portal-ab91x4.html -Pattern "noindex" -Quiet    # True
Select-String -Path .\script.js -Pattern "admin123" -Quiet            # False
```

**Commit:** `git add -A && git commit -m "security: rename admin portal to unguessable path, noindex, remove public modal + hardcoded passwords" ` — **never push.**
*(Known limitation, documented on purpose: the portal remains client-side/localStorage. Until a backend or Vercel Pro password protection exists, treat dashboard data as convenience, not source of truth — Prompt 3 already emails you every booking. Upgrade path: Vercel Pro password / Cloudflare Access / serverless basic-auth middleware.)*

---

### PROMPT 7 — Infrastructure: robots, sitemap, security headers

**Goal:** Search engines get a clean map; browsers get standard security headers; the Virtual Try-On's camera keeps working.

**Strict scope — CREATE 3 new root files. Do NOT edit any existing file.**

**Step 1 — CREATE `robots.txt`:**
```
User-agent: *
Allow: /
Disallow: /portal-ab91x4.html

Sitemap: https://abhushan-by-divyaraj.vercel.app/sitemap.xml
```

**Step 2 — CREATE `sitemap.xml`:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://abhushan-by-divyaraj.vercel.app/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>https://abhushan-by-divyaraj.vercel.app/product-threadbare-ring.html</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://abhushan-by-divyaraj.vercel.app/product-hammered-hoop.html</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://abhushan-by-divyaraj.vercel.app/product-greco-lariat.html</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://abhushan-by-divyaraj.vercel.app/product-sweet-nothing.html</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://abhushan-by-divyaraj.vercel.app/product-tomboy-ring.html</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>
</urlset>
```

**Step 3 — CREATE `vercel.json`:**
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(self), microphone=(), geolocation=()" }
      ]
    }
  ]
}
```
Rationale: `camera=(self)` is REQUIRED by the Virtual Try-On (`navigator.mediaDevices.getUserMedia`); no CSP on purpose — the site relies on inline scripts/styles, and a token CSP would need `unsafe-inline` everywhere, adding risk syntax errors for zero gain. No `Cache-Control` overrides — Vercel's static defaults are correct.

**Verify (PowerShell 5.1):**
```powershell
try { (Invoke-WebRequest -Uri "https://jsonformatter.org/json-validate" -UseBasicParsing -Method Head).StatusCode } catch { }
Get-Content .\vercel.json | ConvertFrom-Json | Out-Null; "JSON OK"
Select-String -Path .\robots.txt -Pattern "Sitemap" -Quiet   # True
```
(Push & deploy once, then confirm live: `Invoke-WebRequest -UseBasicParsing https://abhushan-by-divyaraj.vercel.app/robots.txt`, and check response headers contain `X-Content-Type-Options: nosniff`.)

**Commit:** `git add -A && git commit -m "infra: robots.txt, sitemap.xml, vercel.json security headers (camera allowed for VTO)" ` — **never push.**

---

### PROMPT 8 — Final QA sweep (read-only + micro-cleanup)

**Goal:** Confirm every prior prompt landed; remove two harmless dead code paths; leave the repo clean.

**Steps:**
1. **Dead code removal in `script.js`** (safe deletions only):
   - The `initCarousel('picked-track', …)` and `initCarousel('new-track', …)` calls + their no-op internal returns (targets exist on no page). Keep the `initCarousel` function definition itself if referenced elsewhere — grep first; if unreferenced after call removal, delete the function too.
   - The commented-out `imageMap` placeholder array can stay (documents intent) — no action.
2. **Full-site grep gate:**
```powershell
Select-String -Path .\script.js -Pattern "picked-track|new-track" -Quiet      # False
Select-String -Path .\*.html -Pattern "coming soon to your bag" -Quiet        # False (old fake bag copy gone)
Select-String -Path .\script.js -Pattern "OWNER-INPUT" -Quiet                 # False (you filled notify.js/cart.js configs)
Select-String -Path .\cart.js -Pattern "OWNER-INPUT" -Quiet                   # False
node --check .\script.js; node --check .\cart.js; node --check .\notify.js    # all silent
```
3. **Manual click-through (desktop 1440 + iPhone width):**
   - Home → hero CTAs scroll correctly; ticker pauses on hover; search: "Gifts" returns 5 results; wishlist heart → badge → Move All to Bag → bag badge grows.
   - PDP → no size preselected → Add to Bag without size = shake + toast → choose size → Add to Bag → drawer → WhatsApp button opens wa.me with correct items (after O2) → Reserve by Email posts (after O1).
   - Booking form → spinner → Confirmed → success message → email received (after O1).
   - Mobile menu readable; chat opens; WhatsApp CTA visible; VTO opens camera or upload fallback.
   - 404 page renders, nav toasts work, no admin references.
   - Console: zero errors on all 7 pages.
4. **Lighthouse spot-check** (Chrome DevTools) on index + one PDP. Targets (informational, not gating): Performance ≥ 70 mobile (hero PNG is the big lever — owner input O5/O6 + future WebP), Accessibility ≥ 90, SEO ≥ 95.

**Commit:** `git add -A && git commit -m "chore: QA sweep, remove dead carousel code" ` — **never push.** Then, and only then, push everything via GitHub Desktop and watch the Vercel deploy finish before testing live URLs.

---

### PROMPT 9 (OPTIONAL — only when ready) — Instagram section

When you want social proof on the homepage: add a `#section-instagram` strip above the footer using **LightWidget** (free, no login-wall for viewers) or **SnapWidget**: embed a 6-tile grid linking to `instagram.com/divyraj.creates`, lazy-load the widget script, and gate it behind a `data-` attribute so it never blocks page load. Ask me for the full snippet when you're ready — not included here because it needs your widget ID.

---

## 6. Definition of Done (after Prompt 8 + push + deploy)

| # | Check | Pass condition |
|---|---|---|
| 1 | Mobile menu | Links fully readable (dark on ivory, no blur above them) on ≤430px |
| 2 | Add to Bag | Adds item, badge updates, no "coming soon" toast anywhere |
| 3 | Size handling | Rings require explicit size selection; size shows in drawer & WhatsApp text |
| 4 | Bag checkout | WhatsApp draft opens with itemized order + subtotal; Email reservation posts |
| 5 | Wishlist | "Move All to Bag" fills the bag, then empties wishlist |
| 6 | Booking | Owner receives email with booking ID + reply-to customer; spinner/success UI intact |
| 7 | Newsletter | Footer + popup both deliver; popup still grants WELCOME10 |
| 8 | Chat | Honest assistant copy + WhatsApp button; offline messages delivered |
| 9 | EMI | Exactly one EMI teaser per PDP; no bank-name claims without a real partner |
| 10 | SEO | Unique title/canonical per page; Rich Results Test passes Product schema on PDPs |
| 11 | Sharing | WhatsApp/OG preview shows image + title (verify post-deploy) |
| 12 | Schema | No placeholder phone; NAP matches visible address/hours; no 404 schema images |
| 13 | Hero | Headline/CTAs render; gibberish text not visible on mobile |
| 14 | No-JS | Content visible with JavaScript disabled |
| 15 | Admin | Old URL 404s; new URL noindex; no public hints; old passwords rejected |
| 16 | Infra | robots.txt + sitemap live; security headers present; VTO camera still works |
| 17 | Console | Zero errors on all 7 pages, desktop + mobile |
| 18 | Hygiene | No `OWNER-INPUT` strings left in repo; no `admin123`/`abhushan2026` anywhere |

## 7. Out of scope (deliberately) — roadmap for later

1. **Real payments/checkout** (Razorpay/Cashfree) — needs a backend or payment-link flow; WhatsApp checkout is the correct first step for a studio business. Revisit when order volume justifies it.
2. **Server-side admin with database** (Supabase/Vercel KV) — replaces localStorage dashboard; keep Prompt 3's email delivery as the interim source of truth.
3. **WebP/AVIF image pass** — after owner input O5/O6 regenerate assets; ~70% page-weight win.
4. **Collection/category pages** (the `data-coming-soon` nav links) — when catalog grows past ~12 pieces; nav toast is honest meanwhile.
5. **Real EMI** via payment gateway's EMI API — removes all "0% / bank partners" copy risk in one stroke.
6. **Analytics** (Plausible or GA4) — one script tag when you want numbers.
7. **Real testimonials/photos** — required before public launch (O8).

*End of pack — 8 prompts + 1 optional. Feed them in order, push once at the end.*

