# ABHUSHAN — ANTIGRAVITY PROMPT — PHASE 4

> Repo: `C:\Users\levol\Desktop\OLD LAPTOP ARCHIEVE\Abhushan` (static HTML/CSS/JS, deploys via GitHub Desktop push → Vercel)
> Written after a full audit of the CURRENT live deployment (Phase 3 is already live). Every fix below is evidence-based with verified class names, ids and line anchors. Locate code by the quoted patterns, never by line number alone.

---

## 0) ROLE & MISSION

You are a senior front-end engineer on the Abhushan jewellery site. Execute Steps 1–7 exactly as written, in order. Do not improvise, do not refactor unrelated code, do not change the visual language (Playfair Display / Jost / gold-on-cream) beyond what is requested. If a step cannot be completed exactly as written, SKIP it, note it in the final report, and continue — never invent scope.

## 1) GROUND RULES (non-negotiable)

- Shell is **Windows PowerShell 5.1**. No PS7-only features (no `-SkipHttpErrorCheck`, no ternary).
- `git` is NOT on PATH. Always use:
  ```powershell
  $git = "C:\Users\levol\AppData\Local\GitHubDesktop\app-3.6.4\resources\app\git\cmd\git.exe"
  ```
- After every JS edit: `node --check .\cart.js` (and `node --check .\script.js` if you touched it). Zero output = pass.
- Files are UTF-8. If rewriting from PowerShell, use `[System.IO.File]::WriteAllText($path, $text, (New-Object System.Text.UTF8Encoding($false)))`.
- No emojis, no decorative glyphs, no eyebrow micro-labels. The `×` close glyph and `•` list bullet are allowed (functional).
- **NEVER run `git push`.** The owner pushes via GitHub Desktop.

## 2) SCOPE LOCK (STRICT)

You may EDIT only these 4 files:
- `cart.js`
- `cart.css`
- `styles.css`
- `admin.html`

Nothing else. No new files. FORBIDDEN: touching `notify.js` / `script.js` / any HTML page / images / configs; editing `vercel.json`; any form of `git push`.

## 3) CONTEXT — CURRENT ARCHITECTURE (verified live, do not rebuild)

- `cart.js` builds the bag drawer (`window.AbhushanCart`). Items are `{ name, price, img, href, size }` — one entry per add, **no quantity field** (keep it that way). `CONFIG` (top of file): `WHATSAPP_NUMBER: '919979787087'`, `CURRENCY: '₹'`, `FREE_SHIP: 10000`. Key `abhushan_cart_v1` in localStorage. The drawer currently renders TWO CTAs: `#bag-wa` "Send Order on WhatsApp" and `#bag-email` "Reserve by Email", wired to `checkoutWhatsApp()` / `checkoutEmail()`.
- `checkoutEmail()` calls `window.AbhushanNotify.send(...)` (notify.js = Web3Forms relay, key `10c7b958-4d2a-411b-ab73-fb254ad36c34`, endpoint `https://api.web3forms.com/submit`, returns the parsed JSON response where success = `res.success === true`). **This is why the order email has no customer details: only `order_items`, `subtotal`, `page` are sent today.**
- `admin.html` is a standalone password-gated portal ("Admin Appointment Portal"). It reads `localStorage['abhushan_appointments']` (written by the homepage booking form in `script.js`) into a stats grid + searchable/filterable table + CSV export + clear-all. **It has NO orders view — orders never write anywhere, which is exactly why the portal shows no orders.**
- No `font-variant` / `font-feature-settings` rules exist anywhere in `styles.css` — the up/down digits come from the fonts' default **oldstyle figures** (Cormorant Garamond headings and similar), not from any explicit rule.

---

## STEP 1 — NUMERALS: stop digits from rendering up/down (oldstyle figures → lining figures)

**Problem:** Numbers across the site render with digits sitting at different heights (3/4/5/7/9 drop below the line, 6/8 rise). The owner wants all digits on one even row.

**1a.** Append to the **end** of `styles.css`:

```css
/* ===== PHASE 4 — LINING FIGURES: all digits on one even row ===== */
html {
  font-variant-numeric: lining-nums;
  -webkit-font-feature-settings: "lnum" 1;
  font-feature-settings: "lnum" 1;
}
button, input, select, textarea {
  font-variant-numeric: lining-nums;
  font-feature-settings: "lnum" 1;
}
/* numeric-heavy UI: guarantee even digits even if a font ignores lnum */
.product-price,
.product-price-detail-tiffany,
.bag-item-price,
.bag-subtotal strong,
.bag-emi,
.bag-ship p,
.price-section-title,
.stat-num,
.ck-line,
.ck-row,
.ck-row strong,
.ck-order-id,
.size-option-btn-tiffany,
.size-label-tiffany {
  font-variant-numeric: lining-nums;
  font-feature-settings: "lnum" 1;
}
```

(`.ck-*` classes belong to the new checkout modal built in Steps 3–5; adding them now is intentional.)

**1b.** `admin.html` is standalone and does not load `styles.css` — add the same rule inside its `<style>` block:

```css
    /* PHASE 4 — lining figures in the portal */
    html, button, input, select, textarea {
      font-variant-numeric: lining-nums;
      font-feature-settings: "lnum" 1;
    }
```

**1c.** Verify visually after deploy: prices, cart totals, phone numbers, stats digits, size buttons, EMI line. If ANY element still shows up/down digits (the font lacks lining glyphs entirely), give THAT selector `font-family: 'Jost', sans-serif;` as the last-resort override and note it in the final report. Do not change any other font.

---

## STEP 2 — ONE CHECKOUT BUTTON (replace the two manual CTAs)

**2a. CONFIG.** In `cart.js`, extend the top `CONFIG` object (it currently has `WHATSAPP_NUMBER`, `CURRENCY`, `FREE_SHIP`) by adding one line:

```js
    SHIP_FEE: 199
```
(Flat insured shipping ₹199 below the free-shipping threshold of ₹10,000 — edit this number later if the owner changes policy.)

**2b. CTA markup.** In `cart.js` inside `render()`, find the exact block:

```js
        + '<div class="bag-ctas">'
        + (CONFIG.WHATSAPP_NUMBER.indexOf('OWNER-INPUT') === -1
            ? '<button type="button" class="bag-cta bag-cta-primary" id="bag-wa">Send Order on WhatsApp</button>'
            : '')
        + '<button type="button" class="bag-cta bag-cta-secondary" id="bag-email">Reserve by Email</button>'
        + '</div>'
```

Replace it with:

```js
        + '<div class="bag-ctas">'
        + '<button type="button" class="bag-cta bag-cta-primary" id="bag-checkout">Checkout</button>'
        + '</div>'
```

**2c. CTA listeners.** In the same `render()`, find:

```js
    var wa = document.getElementById('bag-wa');
    if (wa) wa.addEventListener('click', checkoutWhatsApp);
    var em = document.getElementById('bag-email');
    if (em) em.addEventListener('click', checkoutEmail);
```

Replace with:

```js
    var co = document.getElementById('bag-checkout');
    if (co) co.addEventListener('click', openCheckout);
```

**2d. Remove the old functions.** Delete the entire `checkoutWhatsApp()` and `checkoutEmail()` functions (they live under the `/* ---------- checkout ---------- */` comment, together with `orderLines()` — KEEP `orderLines()` if Steps 3–5 reference it, otherwise remove it too; the new code below brings its own builders). Keep the `/* ---------- checkout ---------- */` comment as the section header for the new code.

After this step, `cart.js` must contain NO references to `bag-wa`, `bag-email`, `Reserve by Email`, or `Send Order on WhatsApp`.

---

## STEP 3 — CHECKOUT MODAL (invoice + customer details, Cancel / Order)

All code below goes INSIDE the existing cart.js IIFE, under the `/* ---------- checkout ---------- */` section (after the `closeDrawer()` function or where the old checkout functions were). Add this one helper next to the other utilities if `esc()` does not already exist in cart.js:

```js
  function esc(s){
    return String(s).replace(/[&<>"']/g, function(c){
      return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c];
    });
  }
```

**3a. Shell + invoice filling:**

```js
  /* ---------- checkout modal (Phase 4) ---------- */
  var ckOverlay = null;

  function shipFor(sub){ return sub >= CONFIG.FREE_SHIP ? 0 : CONFIG.SHIP_FEE; }

  function buildCheckoutShell(){
    if (ckOverlay) return;
    ckOverlay = document.createElement('div');
    ckOverlay.className = 'ck-overlay';
    ckOverlay.id = 'ck-overlay';
    ckOverlay.innerHTML =
      '<div class="ck-modal" role="dialog" aria-modal="true" aria-labelledby="ck-title">'
      + '<div class="ck-head"><h2 id="ck-title">Checkout</h2>'
      + '<button type="button" class="ck-close" id="ck-close" aria-label="Close checkout">&times;</button></div>'
      + '<div class="ck-body">'
      + '<div class="ck-invoice"><h3 class="ck-h3">Order Summary</h3><div id="ck-lines"></div>'
      + '<div class="ck-row"><span>Subtotal</span><strong id="ck-sub"></strong></div>'
      + '<div class="ck-row"><span>Insured shipping</span><strong id="ck-ship"></strong></div>'
      + '<div class="ck-row ck-total"><span>Total</span><strong id="ck-total"></strong></div></div>'
      + '<form id="ck-form" novalidate>'
      + '<h3 class="ck-h3">Your Details</h3>'
      + '<p class="ck-why">We use these only to confirm and deliver your order.</p>'
      + '<label class="ck-field">Full name<input type="text" name="ck-name" autocomplete="name" placeholder="Your full name"></label>'
      + '<label class="ck-field">Phone (WhatsApp)<input type="tel" name="ck-phone" inputmode="numeric" autocomplete="tel" placeholder="10-digit mobile number"></label>'
      + '<label class="ck-field">Email<input type="email" name="ck-email" autocomplete="email" placeholder="you@example.com"></label>'
      + '<label class="ck-field">Delivery address<input type="text" name="ck-address" autocomplete="street-address" placeholder="House / street / area"></label>'
      + '<div class="ck-two">'
      + '<label class="ck-field">City<input type="text" name="ck-city" placeholder="City"></label>'
      + '<label class="ck-field">PIN code<input type="text" name="ck-pin" inputmode="numeric" placeholder="6-digit PIN"></label>'
      + '</div>'
      + '<label class="ck-field">Notes — size, gift wrap, occasion<input type="text" name="ck-notes" placeholder="Anything we should know"></label>'
      + '<p class="ck-error" id="ck-error" role="alert"></p>'
      + '</form>'
      + '</div>'
      + '<div class="ck-foot">'
      + '<button type="button" class="bag-cta bag-cta-secondary" id="ck-cancel">Cancel</button>'
      + '<button type="button" class="bag-cta bag-cta-primary" id="ck-place">Order</button>'
      + '</div>'
      + '</div>';
    document.body.appendChild(ckOverlay);
    document.getElementById('ck-close').addEventListener('click', closeCheckout);
    document.getElementById('ck-cancel').addEventListener('click', closeCheckout);
    ckOverlay.addEventListener('click', function(e){ if (e.target === ckOverlay) closeCheckout(); });
    document.getElementById('ck-place').addEventListener('click', placeOrder);
  }

  function fillInvoice(){
    var el = document.getElementById('ck-lines');
    if (el) el.innerHTML = items.map(function(i){
      return '<div class="ck-line"><span>' + esc(i.name) + (i.size ? ' · Size ' + esc(i.size) : '') + '</span><span>' + inr(i.price) + '</span></div>';
    }).join('');
    var sub = subtotal(), ship = shipFor(sub);
    document.getElementById('ck-sub').textContent = inr(sub);
    document.getElementById('ck-ship').textContent = ship === 0 ? 'Free' : inr(ship);
    document.getElementById('ck-total').textContent = inr(sub + ship);
  }

  function openCheckout(){
    if (!count()) return;
    buildCheckoutShell();
    fillInvoice();
    var err = document.getElementById('ck-error');
    if (err) err.textContent = '';
    closeDrawer();
    ckOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    var first = ckOverlay.querySelector('input[name="ck-name"]');
    if (first) setTimeout(function(){ first.focus(); }, 120);
  }

  function closeCheckout(){
    if (!ckOverlay) return;
    ckOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }
```

---

## STEP 4 — ORDER PIPELINE (validate → record → email with FULL customer details → confirm)

**4a. Builders + order id:**

```js
  function orderId(){
    var d = new Date();
    var ymd = d.getFullYear() + ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2);
    return 'ABH-' + ymd + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
  }

  function orderLinesText(o){
    return o.items.map(function(i){
      return '• ' + i.name + (i.size ? ' (Size ' + i.size + ')' : '') + ' — ' + inr(i.price);
    }).join('\n');
  }

  function orderEmailText(o){
    var c = o.customer;
    return 'NEW ORDER — Abhushan Studio\n'
      + 'Order ID: ' + o.id + '\n'
      + 'Placed: ' + new Date(o.at).toLocaleString('en-IN') + '\n\n'
      + 'CUSTOMER\nName: ' + c.name + '\nPhone: ' + c.phone + '\nEmail: ' + c.email + '\n'
      + 'Address: ' + (c.address || '—') + (c.city ? ', ' + c.city : '') + (c.pin ? ' — ' + c.pin : '') + '\n'
      + 'Notes: ' + (c.notes || '—') + '\n\n'
      + 'ITEMS\n' + orderLinesText(o) + '\n\n'
      + 'Subtotal: ' + inr(o.subtotal) + '\n'
      + 'Shipping: ' + (o.shipping === 0 ? 'Free (insured)' : inr(o.shipping)) + '\n'
      + 'ORDER TOTAL: ' + inr(o.total) + '\n\n'
      + 'Source: ' + (o.page || 'website');
  }

  function orderWhatsappText(o){
    var c = o.customer;
    return 'Namaste Abhushan — my order ' + o.id + '\n\n'
      + 'Name: ' + c.name + '\nPhone: ' + c.phone + '\n'
      + (c.address ? 'Address: ' + c.address + (c.city ? ', ' + c.city : '') + (c.pin ? ' — ' + c.pin : '') + '\n' : '')
      + '\nItems:\n' + orderLinesText(o)
      + '\n\nSubtotal: ' + inr(o.subtotal)
      + '\nShipping: ' + (o.shipping === 0 ? 'Free' : inr(o.shipping))
      + '\nTotal: ' + inr(o.total)
      + (c.notes ? '\nNotes: ' + c.notes : '');
  }
```

**4b. placeOrder():**

```js
  function placeOrder(){
    if (!count() || !ckOverlay) return;
    var get = function(n){
      var el = ckOverlay.querySelector('[name="' + n + '"]');
      return el ? el.value.trim() : '';
    };
    var name = get('ck-name');
    var phone = get('ck-phone').replace(/[\s\-]/g, '').replace(/^\+91/, '');
    var email = get('ck-email');
    var address = get('ck-address'), city = get('ck-city');
    var pin = get('ck-pin').replace(/\s/g, ''), notes = get('ck-notes');
    var err = document.getElementById('ck-error');

    var problems = [];
    if (name.length < 2) problems.push('your full name');
    if (!/^[6-9]\d{9}$/.test(phone)) problems.push('a valid 10-digit mobile number');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) problems.push('a valid email address');
    if (pin && !/^\d{6}$/.test(pin)) problems.push('a valid 6-digit PIN (or leave it empty)');
    if (problems.length){
      err.textContent = 'Please enter ' + problems.join(', ') + '.';
      return;
    }
    err.textContent = '';

    var btn = document.getElementById('ck-place');
    btn.disabled = true;
    btn.textContent = 'Placing order\u2026';

    var ship = shipFor(subtotal());
    var order = {
      id: orderId(),
      at: new Date().toISOString(),
      customer: { name: name, phone: phone, email: email, address: address, city: city, pin: pin, notes: notes },
      items: items.map(function(i){ return { name: i.name, price: i.price, size: i.size || null }; }),
      subtotal: subtotal(),
      shipping: ship,
      total: subtotal() + ship,
      status: 'new',
      page: location.href
    };

    /* 1) local record — this is what the Admin Portal Orders tab reads */
    try {
      var arr = JSON.parse(localStorage.getItem('abhushan_orders_v1') || '[]');
      arr.push(order);
      localStorage.setItem('abhushan_orders_v1', JSON.stringify(arr));
    } catch (e) {}

    /* 2) email the studio — Web3Forms via notify.js, now WITH full customer details */
    var emailPromise = (window.AbhushanNotify && window.AbhushanNotify.send)
      ? window.AbhushanNotify.send(
          'New Order ' + order.id + ' — ' + order.customer.name,
          {
            order_id: order.id,
            name: order.customer.name,
            phone: order.customer.phone,
            email: order.customer.email,
            address: (order.customer.address + (order.customer.city ? ', ' + order.customer.city : '') + (order.customer.pin ? ' — ' + order.customer.pin : '')) || '—',
            notes: order.customer.notes || '—',
            order_items: orderLinesText(order).replace(/• /g, ''),
            order_subtotal: inr(order.subtotal),
            order_shipping: order.shipping === 0 ? 'Free (insured)' : inr(order.shipping),
            order_total: inr(order.total),
            message: orderEmailText(order)
          },
          order.customer.email
        )
      : Promise.resolve({ success: false });

    /* 3) clear bag, close checkout, show confirmation */
    items = [];
    save();
    updateBadge();
    render();
    closeCheckout();
    btn.disabled = false;
    btn.textContent = 'Order';
    showConfirmation(order, emailPromise);
  }
```

Notes: `replyto` (3rd argument of `AbhushanNotify.send`) is set to the customer's email, so the owner can hit Reply on the order email and answer the customer directly. The bag is cleared AFTER the order object snapshot is captured, so the confirmation and WhatsApp summary always show the full order even with an emptied bag.

---

## STEP 5 — CONFIRMATION POPUP (+ "Send order summary via WhatsApp")

**5a. cart.js — confirmation modal:**

```js
  /* ---------- confirmation popup (Phase 4) ---------- */
  var ckConfirm = null;

  function buildConfirmShell(){
    if (ckConfirm) return;
    ckConfirm = document.createElement('div');
    ckConfirm.className = 'ck-overlay';
    ckConfirm.id = 'ck-confirm-overlay';
    ckConfirm.innerHTML =
      '<div class="ck-modal ck-confirm" role="dialog" aria-modal="true" aria-labelledby="ckc-title">'
      + '<div class="ck-checkmark" aria-hidden="true"><span></span></div>'
      + '<h2 id="ckc-title">Order received</h2>'
      + '<p class="ck-order-id">Order ID: <strong id="ckc-id"></strong></p>'
      + '<p class="ck-confirm-sub" id="ckc-sub"></p>'
      + '<div class="ck-confirm-summary" id="ckc-summary"></div>'
      + '<div class="ck-foot">'
      + '<button type="button" class="bag-cta bag-cta-secondary" id="ck-wa">Send order summary via WhatsApp</button>'
      + '<button type="button" class="bag-cta bag-cta-primary" id="ck-done">Done</button>'
      + '</div>'
      + '</div>';
    document.body.appendChild(ckConfirm);
    document.getElementById('ck-done').addEventListener('click', function(){
      ckConfirm.classList.remove('open');
      document.body.style.overflow = '';
      toast('Thank you — your order is with the studio');
    });
  }

  function showConfirmation(order, emailPromise){
    buildConfirmShell();
    document.getElementById('ckc-id').textContent = order.id;
    document.getElementById('ckc-summary').innerHTML =
      order.items.map(function(i){
        return '<div class="ck-line"><span>' + esc(i.name) + (i.size ? ' · Size ' + esc(i.size) : '') + '</span><span>' + inr(i.price) + '</span></div>';
      }).join('')
      + '<div class="ck-row ck-total"><span>Total (incl. shipping)</span><strong>' + inr(order.total) + '</strong></div>';
    ckConfirm.classList.add('open');
    document.body.style.overflow = 'hidden';

    var waBtn = document.getElementById('ck-wa');
    waBtn.onclick = function(){
      var url = (window.AbhushanNotify && window.AbhushanNotify.whatsappLink)
        ? window.AbhushanNotify.whatsappLink(orderWhatsappText(order))
        : 'https://wa.me/' + CONFIG.WHATSAPP_NUMBER + '?text=' + encodeURIComponent(orderWhatsappText(order));
      window.open(url, '_blank', 'noopener');
    };

    var sub = document.getElementById('ckc-sub');
    sub.textContent = 'Sending your order to the studio\u2026';
    emailPromise.then(function(res){
      if (res && res.success === true) {
        sub.textContent = 'Your order has been emailed to the studio. We confirm personally within 2 hours · Mon–Sat 10 AM – 7 PM IST.';
      } else {
        sub.innerHTML = 'The studio email could not be sent just now — please tap <strong>Send order summary via WhatsApp</strong> so we receive your order. We confirm within 2 hours · Mon–Sat 10 AM – 7 PM IST.';
      }
    });
  }
```

**5b. cart.css — checkout + confirmation styles.** Append to the **end** of `cart.css`:

```css
/* ===== PHASE 4 — CHECKOUT MODAL + CONFIRMATION ===== */
.ck-overlay { position: fixed; inset: 0; background: rgba(30,22,18,.5); z-index: 210; display: flex; align-items: flex-end; justify-content: center; opacity: 0; pointer-events: none; transition: opacity .25s ease; }
.ck-overlay.open { opacity: 1; pointer-events: auto; }
.ck-modal { background: #FFFDFB; width: min(560px, 100%); max-height: 92vh; overflow-y: auto; padding: 22px 22px 18px; transform: translateY(16px); transition: transform .25s ease; }
.ck-overlay.open .ck-modal { transform: translateY(0); }
@media (min-width: 640px) { .ck-overlay { align-items: center; } .ck-modal { border-radius: 4px; } }
.ck-head { display: flex; justify-content: space-between; align-items: center; margin: 0 0 14px; }
.ck-head h2 { font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: 500; margin: 0; }
.ck-close { background: none; border: 0; font-size: 26px; line-height: 1; cursor: pointer; color: var(--color-text-light, #6B6460); padding: 4px 8px; }
.ck-h3 { font-size: 12px; letter-spacing: .18em; text-transform: uppercase; color: var(--color-text-light, #6B6460); margin: 0 0 10px; font-weight: 500; }
.ck-invoice { border: 1px solid var(--color-border, #E2DDD8); padding: 14px; margin: 0 0 18px; background: #fff; }
.ck-line { display: flex; justify-content: space-between; gap: 12px; font-size: 13.5px; padding: 5px 0; color: var(--color-text, #322325); }
.ck-row { display: flex; justify-content: space-between; font-size: 13.5px; padding: 8px 0 0; margin-top: 6px; border-top: 1px solid var(--color-border, #E2DDD8); color: var(--color-text-light, #6B6460); }
.ck-row strong { font-family: 'Playfair Display', Georgia, serif; font-size: 16px; color: var(--color-text, #322325); }
.ck-row.ck-total strong { font-size: 20px; }
.ck-field { display: block; font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: var(--color-text-light, #6B6460); margin: 0 0 12px; }
.ck-field input { display: block; width: 100%; margin-top: 6px; padding: 12px; font-size: 14px; font-family: 'Jost', sans-serif; letter-spacing: normal; text-transform: none; border: 1px solid var(--color-border, #E2DDD8); background: #fff; color: var(--color-text, #322325); box-sizing: border-box; }
.ck-field input:focus { outline: none; border-color: var(--color-gold, #C08B5D); }
.ck-two { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.ck-why { font-size: 12.5px; color: var(--color-text-light, #6B6460); margin: 0 0 12px; }
.ck-error { color: #A33B2E; font-size: 13px; min-height: 18px; margin: 4px 0 0; }
.ck-foot { display: flex; gap: 10px; margin-top: 16px; }
.ck-foot .bag-cta { flex: 1; }
.ck-confirm { text-align: center; }
.ck-checkmark { width: 56px; height: 56px; margin: 6px auto 14px; border-radius: 50%; border: 1.5px solid var(--color-emerald, #226836); position: relative; }
.ck-checkmark span { position: absolute; left: 17px; top: 15px; width: 20px; height: 11px; border-left: 2px solid var(--color-emerald, #226836); border-bottom: 2px solid var(--color-emerald, #226836); transform: rotate(-45deg); }
.ck-confirm h2 { font-family: 'Playfair Display', Georgia, serif; font-weight: 500; font-size: 24px; margin: 0 0 6px; }
.ck-order-id { font-size: 12px; letter-spacing: .14em; text-transform: uppercase; color: var(--color-text-light, #6B6460); margin: 0 0 10px; }
.ck-order-id strong { color: var(--color-gold, #C08B5D); letter-spacing: .08em; }
.ck-confirm-sub { font-size: 13.5px; line-height: 1.6; color: var(--color-text-light, #6B6460); margin: 0 0 14px; }
.ck-confirm-summary { border: 1px solid var(--color-border, #E2DDD8); padding: 12px 14px; text-align: left; background: #fff; }
```

---

## STEP 6 — ADMIN PORTAL: Orders tab (records, status, CSV)

`admin.html` currently has: auth gate → dashboard with (1) `<section class="stats-grid">`, (2) `<section class="toolbar-wrap">` with `#search-input` / `#status-filter` / export / clear buttons, (3) `<section class="table-container">` with `#appointments-table`. All its JS is inline in the same file.

**6a. Wrap the appointments view.** Wrap those three `<section>` elements together in one container:

```html
<div id="appointments-section">
  <!-- existing stats-grid section -->
  <!-- existing toolbar-wrap section -->
  <!-- existing table-container section -->
</div>
```

**6b. Tab bar.** Immediately above `#appointments-section` (inside the dashboard wrapper, after the `<h1>Abhushan Studio Portal</h1>` header), add:

```html
    <div class="admin-tabs">
      <button type="button" class="admin-tab active" id="tab-appointments">Appointments</button>
      <button type="button" class="admin-tab" id="tab-orders">Orders</button>
    </div>
```

**6c. Orders section.** Directly after `#appointments-section`, add (hidden by default):

```html
    <div id="orders-section" style="display: none;">
      <div class="orders-banner">
        Orders placed in THIS browser appear here automatically (localStorage). Orders placed on a
        customer's device reach you by EMAIL (Web3Forms) — that email is the master record for those.
        Every order email now contains the customer's name, phone, email, address and notes.
      </div>
      <section class="stats-grid">
        <div class="stat-card total"><div class="stat-label">Total Orders</div><div class="stat-num" id="ostat-total">0</div></div>
        <div class="stat-card pending"><div class="stat-label">New</div><div class="stat-num" id="ostat-new">0</div></div>
        <div class="stat-card approved"><div class="stat-label">Delivered</div><div class="stat-num" id="ostat-delivered">0</div></div>
        <div class="stat-card completed"><div class="stat-label">Revenue</div><div class="stat-num" id="ostat-revenue">0</div></div>
      </section>
      <section class="toolbar-wrap">
        <input type="text" id="order-search" class="search-input" placeholder="Search by order ID, name, phone, email..." />
        <select id="order-status-filter" class="filter-select">
          <option value="all">All statuses</option>
          <option value="new">New</option>
          <option value="confirmed">Confirmed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button type="button" id="btn-orders-export">Export CSV</button>
        <button type="button" id="btn-orders-refresh">Refresh</button>
        <button type="button" id="btn-orders-clear">Clear Orders</button>
      </section>
      <section class="table-container">
        <table id="orders-table">
          <thead>
            <tr>
              <th>Order ID</th><th>Placed</th><th>Customer</th><th>Phone</th>
              <th>Email</th><th>Items</th><th>Total</th><th>Status</th><th></th>
            </tr>
          </thead>
          <tbody id="orders-body"></tbody>
        </table>
        <div id="orders-empty" class="empty-state" style="display:none;">
          <p>No orders yet. Place a test order from the website in this browser, or wait for customer order emails.</p>
        </div>
      </section>
    </div>
```

Reuse the site's existing admin styling: the new sections deliberately reuse `stats-grid`, `stat-card`, `toolbar-wrap`, `search-input`, `filter-select`, `table-container` and the same `<button>` styling as the existing appointments toolbar buttons — copy the exact button classes from the existing toolbar markup onto the three new buttons so they match. Add this CSS to admin.html's `<style>` block:

```css
    /* PHASE 4 — tabs + orders */
    .admin-tabs { display: flex; gap: 8px; margin: 0 0 18px; }
    .admin-tab { padding: 10px 18px; border: 1px solid #ddd; background: #fff; cursor: pointer; font-size: 14px; border-radius: 4px; }
    .admin-tab.active { background: #1c1c1c; color: #fff; border-color: #1c1c1c; }
    .orders-banner { background: #FFF7E8; border: 1px solid #EAD9B0; color: #7A5B1E; padding: 10px 14px; border-radius: 4px; font-size: 13.5px; margin: 0 0 14px; line-height: 1.5; }
    #orders-table select.order-status { padding: 4px 6px; font-size: 13px; }
    #orders-table .ord-items { font-size: 12.5px; line-height: 1.45; text-align: left; }
    #orders-table .ord-del { background: none; border: 1px solid #e3b7b7; color: #A33B2E; border-radius: 4px; cursor: pointer; padding: 4px 8px; font-size: 12px; }
```

**6d. Orders JS.** Add at the END of admin.html's inline `<script>` (after the existing appointments code):

```js
      /* ===== PHASE 4 — ORDERS TAB ===== */
      const ORDERS_KEY = 'abhushan_orders_v1';
      const ORDER_STATUSES = ['new', 'confirmed', 'shipped', 'delivered', 'cancelled'];
      const tabAppointments = document.getElementById('tab-appointments');
      const tabOrders = document.getElementById('tab-orders');
      const appointmentsSection = document.getElementById('appointments-section');
      const ordersSection = document.getElementById('orders-section');
      const ordersBody = document.getElementById('orders-body');
      const ordersEmpty = document.getElementById('orders-empty');
      const orderSearch = document.getElementById('order-search');
      const orderStatusFilter = document.getElementById('order-status-filter');

      function getOrders() {
        try { return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]'); }
        catch (e) { return []; }
      }
      function saveOrders(list) {
        localStorage.setItem(ORDERS_KEY, JSON.stringify(list));
      }
      function orderMoney(n) {
        return '₹' + Number(n).toLocaleString('en-IN');
      }
      function orderItemsText(items) {
        return (items || []).map(i => i.name + (i.size ? ' (Size ' + i.size + ')' : ''));
      }
      function renderOrders() {
        const all = getOrders();
        const q = (orderSearch.value || '').trim().toLowerCase();
        const st = orderStatusFilter.value;
        const list = all.filter(o => {
          if (st !== 'all' && (o.status || 'new') !== st) return false;
          if (!q) return true;
          const hay = [o.id, o.customer && o.customer.name, o.customer && o.customer.phone,
                       o.customer && o.customer.email].join(' ').toLowerCase();
          return hay.indexOf(q) !== -1;
        });
        ordersBody.innerHTML = '';
        list.slice().reverse().forEach(o => {
          const tr = document.createElement('tr');
          const itemsTxt = orderItemsText(o.items).join(', ') || '—';
          const when = o.at ? new Date(o.at).toLocaleString('en-IN') : '—';
          const sel = '<select class="order-status" data-id="' + o.id + '">'
            + ORDER_STATUSES.map(s => '<option value="' + s + '"' + ((o.status || 'new') === s ? ' selected' : '') + '>'
              + s.charAt(0).toUpperCase() + s.slice(1) + '</option>').join('')
            + '</select>';
          tr.innerHTML =
            '<td>' + o.id + '</td>' +
            '<td>' + when + '</td>' +
            '<td>' + (o.customer ? o.customer.name : '—') + '</td>' +
            '<td>' + (o.customer ? o.customer.phone : '—') + '</td>' +
            '<td>' + (o.customer ? o.customer.email : '—') + '</td>' +
            '<td class="ord-items">' + itemsTxt + '</td>' +
            '<td>' + orderMoney(o.total) + '</td>' +
            '<td>' + sel + '</td>' +
            '<td><button type="button" class="ord-del" data-id="' + o.id + '">Delete</button></td>';
          ordersBody.appendChild(tr);
        });
        ordersEmpty.style.display = list.length ? 'none' : 'block';
        renderOrderStats(all);
      }
      function renderOrderStats(all) {
        document.getElementById('ostat-total').textContent = all.length;
        document.getElementById('ostat-new').textContent = all.filter(o => (o.status || 'new') === 'new').length;
        document.getElementById('ostat-delivered').textContent = all.filter(o => o.status === 'delivered').length;
        const rev = all.filter(o => o.status !== 'cancelled')
                       .reduce((s, o) => s + (Number(o.total) || 0), 0);
        document.getElementById('ostat-revenue').textContent = orderMoney(rev);
      }
      ordersBody.addEventListener('change', e => {
        const sel = e.target.closest('select.order-status');
        if (!sel) return;
        const list = getOrders();
        const o = list.find(x => x.id === sel.getAttribute('data-id'));
        if (o) { o.status = sel.value; saveOrders(list); renderOrders(); }
      });
      ordersBody.addEventListener('click', e => {
        const btn = e.target.closest('.ord-del');
        if (!btn) return;
        if (!window.confirm('Delete order ' + btn.getAttribute('data-id') + '? This cannot be undone.')) return;
        saveOrders(getOrders().filter(x => x.id !== btn.getAttribute('data-id')));
        renderOrders();
      });
      orderSearch.addEventListener('input', renderOrders);
      orderStatusFilter.addEventListener('change', renderOrders);
      document.getElementById('btn-orders-refresh').addEventListener('click', renderOrders);
      document.getElementById('btn-orders-clear').addEventListener('click', () => {
        if (!window.confirm('This will wipe the local orders database on this browser. Continue?')) return;
        saveOrders([]);
        renderOrders();
      });
      document.getElementById('btn-orders-export').addEventListener('click', () => {
        const rows = [['Order ID', 'Placed', 'Name', 'Phone', 'Email', 'Address', 'Items', 'Subtotal', 'Shipping', 'Total', 'Status', 'Notes']];
        getOrders().forEach(o => rows.push([
          o.id, o.at || '', o.customer && o.customer.name || '', o.customer && o.customer.phone || '',
          o.customer && o.customer.email || '',
          [o.customer && o.customer.address, o.customer && o.customer.city, o.customer && o.customer.pin].filter(Boolean).join(' '),
          orderItemsText(o.items).join(' | '), o.subtotal, o.shipping, o.total, o.status || 'new',
          o.customer && o.customer.notes || ''
        ]));
        const csv = rows.map(r => r.map(c => '"' + String(c == null ? '' : c).replace(/"/g, '""') + '"').join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'abhushan_orders_' + new Date().toISOString().split('T')[0] + '.csv');
        document.body.appendChild(link);
        link.click();
        link.remove();
      });
      function showTab(which) {
        const isOrders = which === 'orders';
        tabOrders.classList.toggle('active', isOrders);
        tabAppointments.classList.toggle('active', !isOrders);
        ordersSection.style.display = isOrders ? 'block' : 'none';
        appointmentsSection.style.display = isOrders ? 'none' : 'block';
        if (isOrders) renderOrders();
      }
      tabAppointments.addEventListener('click', () => showTab('appointments'));
      tabOrders.addEventListener('click', () => showTab('orders'));
      // re-render orders when the tab becomes visible after login
      const ordersObserver = new MutationObserver(() => {
        if (ordersSection.style.display !== 'none') renderOrders();
      });
      ordersObserver.observe(ordersSection, { attributes: true, attributeFilter: ['style'] });
```

If any helper name above collides with an existing const/function in admin.html (e.g. `ordersEmpty`), rename the new one (`ordEmpty`) — verify with `Select-String -Path .\admin.html -Pattern 'const ordersEmpty'` that it appears only once.

---

## STEP 7 — VERIFICATION SWEEP (PowerShell 5.1 — run everything, paste outputs into the final report)

```powershell
$git = "C:\Users\levol\AppData\Local\GitHubDesktop\app-3.6.4\resources\app\git\cmd\git.exe"

Write-Output "== 1. JS syntax =="
node --check .\cart.js
# expect: no output

Write-Output "== 2. Old dual CTAs gone =="
Select-String -Path .\cart.js -Pattern 'bag-wa|bag-email|Reserve by Email|Send Order on WhatsApp'
# expect: no output

Write-Output "== 3. New checkout wired =="
Select-String -Path .\cart.js -Pattern 'bag-checkout|openCheckout|placeOrder|buildCheckoutShell|showConfirmation'
# expect: all present

Write-Output "== 4. Order pipeline =="
Select-String -Path .\cart.js -Pattern 'abhushan_orders_v1|SHIP_FEE|orderEmailText|orderWhatsappText|replyto|AbhushanNotify'
# expect: all present; the email payload includes name/phone/email/address fields

Write-Output "== 5. WhatsApp number intact everywhere =="
Get-ChildItem *.js,*.html | Select-String -Pattern 'wa\.me/(\d+)'
# expect: every match is wa.me/919979787087

Write-Output "== 6. Lining figures =="
Select-String -Path .\styles.css -Pattern 'lining-nums'
Select-String -Path .\admin.html -Pattern 'lining-nums'
# expect: present in both

Write-Output "== 7. Admin orders tab =="
Select-String -Path .\admin.html -Pattern 'abhushan_orders_v1|tab-orders|orders-section|btn-orders-export'
# expect: all present

Write-Output "== 8. Confirm modal styles =="
Select-String -Path .\cart.css -Pattern 'ck-overlay|ck-modal|ck-confirm'
# expect: present

Write-Output "== 9. Git status =="
& $git status --short
# expect: only cart.js, cart.css, styles.css, admin.html modified
```

---

## VISUAL CHECKLIST (browser, desktop + 390px mobile)

Numerals:
- [ ] Prices, cart totals, EMI line, size buttons, phone numbers, admin stats — ALL digits sit on one even row (no up/down oldstyle figures) on the homepage, a PDP, the bag drawer, and the admin portal.

Bag & checkout:
- [ ] Bag drawer shows ONE primary button: "Checkout". The old "Send Order on WhatsApp" / "Reserve by Email" buttons are gone.
- [ ] Checkout opens a clean modal: Order Summary (each item with size + price, subtotal, insured shipping Free/₹199, Total) + Your Details form (name, phone, email, address, city, PIN, notes) + Cancel / Order at the bottom.
- [ ] Submitting empty/invalid shows inline red messages (name, 10-digit phone, valid email, 6-digit PIN) and does NOT place the order.
- [ ] Tapping Order briefly shows "Placing order…", then the confirmation popup: green check, "Order received", Order ID (ABH-YYYYMMDD-XXXX), item summary with total, status line ("Your order has been emailed to the studio…"), and two buttons: "Send order summary via WhatsApp" + "Done".
- [ ] The bag is now empty (count badge 0) but the confirmation still lists the full order.
- [ ] "Send order summary via WhatsApp" opens wa.me/919979787087 prefilled with order ID, name, phone, items, total, notes.
- [ ] Done closes the popup with a thank-you toast. Cancel in checkout closes the modal without ordering.

Email & admin portal:
- [ ] Place a REAL test order → the studio inbox receives an email with subject "New Order ABH-… — <customer name>" containing: Order ID, name, phone, email, address/city/PIN, notes, items with sizes, subtotal, shipping, ORDER TOTAL, source URL. (Reply-To should be the customer's email.)
- [ ] Open `admin.html` → passcode → portal shows two tabs: Appointments | Orders.
- [ ] Orders tab shows the test order with ALL customer details, total, status "New"; stats update (Total Orders / New / Delivered / Revenue).
- [ ] Changing status persists after Refresh; search by name/phone/order ID works; Export CSV downloads all details; Delete and Clear Orders work.
- [ ] The banner explains: same-browser orders appear automatically; customer-device orders arrive by email (master record).
- [ ] Appointments tab still works exactly as before (book a test appointment to confirm).

Console: zero JS errors on homepage, PDP, bag → checkout → confirmation flow, and admin.html.

---

## COMMIT (and stop — NEVER push)

```powershell
$git = "C:\Users\levol\AppData\Local\GitHubDesktop\app-3.6.4\resources\app\git\cmd\git.exe"
& $git add -A
& $git commit -m "Phase 4: lining numerals, one-click checkout with customer details, order confirmation + WhatsApp summary, admin Orders tab"
```

Do NOT run `git push`. The owner reviews and pushes via GitHub Desktop; Vercel deploys automatically.

---

## FINAL REPORT FORMAT

End with a short report containing:
1. Steps completed (1–7) and any step SKIPPED with the reason.
2. Whether any numeric element still rendered oldstyle after Step 1 and which selector you overrode.
3. The full output of the Step 7 verification block.
4. Files changed (`git show --stat HEAD`).
