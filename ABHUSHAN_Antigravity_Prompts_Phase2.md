# ABHUSHAN — Antigravity Prompt Pack · PHASE 2 (Prompts 3–8)

**Generated:** 25 Sep 2026
**Status:** Prompts 1–2 from the previous file are DONE and committed (`a87da91`, `36a7ba6`).
**This file supersedes Prompts 3–9 of the previous file.** Do NOT run old Prompts 3–9. This file is now the single source of truth.

---

## 0. HOW TO USE THIS FILE (for Divyaraj)

1. Paste Antigravity **one prompt at a time**, in order: 3 → 4 → 5 → 6 → 7 → 8.
2. Say exactly: *"Execute PROMPT 3 only. Follow every step. Run the verification. Commit. Do not push. Then stop and report."*
3. After each prompt finishes: quick-check the visuals (each prompt has a visual checklist), then move to the next prompt.
4. When ALL prompts are done: push via GitHub Desktop → Vercel auto-deploys → run the live checklist in Appendix D.
5. If any step fails or a visual looks broken: screenshot it, send it to me, I write a one-shot fix prompt.

---

## 1. OWNER INPUTS — already baked into the prompts below

| Input | Value | Where it goes |
|---|---|---|
| Web3Forms access key | `10c7b958-4d2a-411b-ab73-fb254ad36c34` | `notify.js` (Prompt 3) |
| WhatsApp number (intl, digits only) | `919979787087` | `notify.js`, `cart.js`, chat widget (Prompt 3) |
| WhatsApp display format on site | `+91 99797 87087` | Story page, footer (Prompts 3–4) |

No placeholders remain anywhere in this file. Antigravity does not need to ask you for anything.

---

## 2. GLOBAL RULES — Antigravity must acknowledge these before every prompt

- **PowerShell 5.1 only.** Use `Select-String`, `Invoke-WebRequest -UseBasicParsing`, `try/catch`. Never use PS7-only flags (`-SkipHttpErrorCheck`, ternary `? :`, `-AsPlainText`).
- **NEVER `git push`.** Commit locally only. The owner pushes via GitHub Desktop.
- Git binary path on this machine:
  `C:\Users\levol\AppData\Local\GitHubDesktop\app-3.6.4\resources\app\git\cmd\git.exe`
- **Never write files with PS 5.1 `Set-Content -Encoding UTF8`** — it writes a BOM and corrupts Unicode. For file writes use `[System.IO.File]::WriteAllText($path, $text, [System.Text.UTF8Encoding]::new($false))` or Node.js `fs.writeFileSync(f, c, 'utf8')`. Node.js is available (`node --check` works) — prefer Node for any multi-file text transform.
- **Keep everything from Prompts 1–2 working:** mobile menu layering, search pills (Rings / Necklaces / Earrings / Bracelets / Gifts), EMI dedup, `cart.js` + `cart.css` bag system, wishlist move-all. Do not regress them.
- **Design language of this site (protect it):** warm ivory background, gold accent `#C08B5D`, elegant serif display headings, quiet small-caps links with underline-on-hover, oval product imagery, class suffix `-tiffany`. New pages/classes must match this language.
- **Clean-copy rule (owner directive, applies to ALL customer-facing output):** no emojis, no decorative arrows or pointer glyphs (`→ ➔ » › ✓ ✦` etc.), no eyebrow/kicker labels above headings, no square/rectangle tag chips or badges, no `alert()` popups. Use `showToast()` or inline messages only.
- **No AI mentions** anywhere customer-facing. No invented certifications or fake guarantees. Prices always in `₹` with Indian formatting (`₹12,499`).
- Run `node --check` on every `.js` file you touch, before committing.

---

## PROMPT 3 — Forms that actually deliver (Web3Forms) + honest chat + real WhatsApp number

*(This replaces the old Prompt 3 entirely — the real key and number are now baked in.)*

**Goal:** Every booking, newsletter signup, and offline chat message lands in the owner's email inbox via Web3Forms (reply-able). The chat robot becomes honest about being an assistant and offers WhatsApp. The bag's WhatsApp checkout uses the real studio number.

**Strict scope — CREATE `notify.js`; EDIT `script.js` (4 blocks), `cart.js` (number only), `cart.css` (one rule), `index.html` + 5 PDPs (one script tag each). Do NOT touch styles.css, the VTO, admin, or any section markup.**

**Step 1 — CREATE `notify.js` with EXACTLY this content:**

```js
/* =============================================================
   ABHUSHAN — Notification relay · Web3Forms (email delivery)
   Key is live. If Web3Forms is unreachable, everything falls
   back to localStorage + WhatsApp — the user is never blocked.
   ============================================================= */
(function () {
  'use strict';
  var CONFIG = {
    KEY: '10c7b958-4d2a-411b-ab73-fb254ad36c34',
    WHATSAPP_NUMBER: '919979787087', // digits only, no +
    ENDPOINT: 'https://api.web3forms.com/submit'
  };
  function send(subject, fields, replyTo) {
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
  window.AbhushanNotify = { send: send, whatsappLink: whatsappLink, CONFIG: CONFIG };
})();
```

**Step 2 — In each of the 6 pages** (`index.html` + the 5 `product-*.html`), add between the `cart.js` and `script.js` script tags:

```html
<script src="notify.js"></script>
```

**Step 3 — EDIT `script.js` — booking form.** In the booking submit handler that builds `newBooking`, immediately after `localStorage.setItem('abhushan_appointments', JSON.stringify(appointments));` insert:

```js
if (window.AbhushanNotify) {
  window.AbhushanNotify.send('Studio booking ' + bookingId + ' — ' + service, {
    booking_id: bookingId, name: name, email: email, phone: phone,
    date: date, time: time, service: service, notes: notes
  }, email);
}
```

**Step 4 — EDIT `script.js` — footer newsletter.** Add this block at the end of the main IIFE (same scope as `initApp`):

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
    if (typeof showToast === 'function') showToast('Welcome to the Inner Circle');
  });
})();
```

**Step 5 — EDIT `script.js` — newsletter popup.** Inside the `#newsletter-popup-form` submit handler, after its `localStorage.setItem(...)` line insert:

```js
if (window.AbhushanNotify) {
  window.AbhushanNotify.send('Newsletter signup — popup', { email: email, source: 'popup' }, email);
}
```

**Step 6 — EDIT `script.js` — chat honesty + delivery.**
a) Replace the `consultantReplies` array (the canned strings) with exactly one honest reply used every time:

```js
const consultantReplies = [
  "I'm the Abhushan studio assistant — a real goldsmith replies on WhatsApp within studio hours (Mon–Sat 10–7 IST). Tap the WhatsApp button above, or leave a message below and we'll email you back."
];
```

b) In the offline form handler (`#chat-offline-form` submit), after its `localStorage.setItem('abhushan_chat_form', ...)` line insert:

```js
if (window.AbhushanNotify) {
  window.AbhushanNotify.send('Chat message (offline) — ' + name, { name: name, email: email, message: msg }, email);
}
```

c) In the pre-chat form handler (`#chat-prechat-form` submit), after its `localStorage.setItem('abhushan_chat_form', ...)` line insert:

```js
if (window.AbhushanNotify) {
  window.AbhushanNotify.send('Chat request — ' + topic, { name: name, email: email, topic: topic }, email);
}
```

d) In `injectChatWidget()`'s `container.innerHTML`, inside `.chat-header-info`, below `.chat-status-row`, add:

```html
<a class="chat-wa-btn" href="#" id="chat-wa-btn" target="_blank" rel="noopener">WhatsApp the Studio</a>
```

and right after `document.body.appendChild(container);` add:

```js
var waBtn = document.getElementById('chat-wa-btn');
if (waBtn && window.AbhushanNotify) {
  waBtn.setAttribute('href', window.AbhushanNotify.whatsappLink('Namaste Abhushan — I have a question about your jewellery.'));
}
```

**Step 7 — EDIT `cart.js` — real WhatsApp number.** Replace every `wa.me/<digits>` occurrence so the checkout goes to the real number. Run (PowerShell 5.1):

```powershell
$c = Get-Content .\cart.js -Raw
$c = $c -replace 'wa\.me/\d+', 'wa.me/919979787087'
[System.IO.File]::WriteAllText((Resolve-Path .\cart.js).Path, $c, [System.Text.UTF8Encoding]::new($false))
```

**Step 8 — EDIT `cart.js` — no `alert()`.** If the Prompt 2 reservation flow uses `alert(...)`, replace that call with `showToast('Reservation sent — we confirm within 2 hours (Mon–Sat 10–7 IST)')`.

**Step 9 — APPEND to `cart.css`:**

```css
/* Chat WhatsApp CTA (Prompt 3) */
.chat-wa-btn { display: inline-block; margin-top: 8px; padding: 8px 14px; background: var(--color-gold, #C08B5D); color: #fff !important; font-size: 11.5px; letter-spacing: .12em; text-transform: uppercase; text-decoration: none; border-radius: 2px; }
.chat-wa-btn:hover { background: #a9764c; }
```

**Verify (PowerShell 5.1):**

```powershell
Select-String -Path .\notify.js -Pattern "10c7b958-4d2a-411b-ab73-fb254ad36c34" -Quiet        # True
Select-String -Path .\notify.js -Pattern "919979787087" -Quiet                                # True
Select-String -Path .\index.html -Pattern 'src="notify.js"' -Quiet                            # True
Select-String -Path .\product-tomboy-ring.html -Pattern 'src="notify.js"' -Quiet              # True
Select-String -Path .\cart.js -Pattern "wa\.me/919979787087" -Quiet                           # True
Select-String -Path .\cart.js -Pattern "alert\(" -Quiet                                       # False
Select-String -Path .\script.js -Pattern "initFooterSubscribe" -Quiet                         # True
Select-String -Path .\script.js -Pattern "studio assistant" -Quiet                            # True
node --check .\notify.js; node --check .\script.js; node --check .\cart.js                    # all clean
```

**Visual check:** open `index.html` with `Ctrl+Shift+R`. Submit the studio booking form with your own email — no console errors, toast appears. Open the chat — the honest assistant message + "WhatsApp the Studio" button is visible and opens `wa.me/919979787087`. Footer subscribe: no reload, toast appears. Bag → WhatsApp checkout opens a chat with the itemized order aimed at the real number.

**Commit:** `feat: web3forms delivery on booking/newsletter/chat, honest chat assistant, real WhatsApp number everywhere` — **never push.**

---

## PROMPT 4 — Real navigation: every navbar item opens a real page; zero "Coming Soon"

**Goal:** All 11 navbar items — Gifts, New, Best Sellers, Jewelry, Welded Forever, Necklaces, Earrings, Rings, Bracelets, Weddings, Our Story — open real, working pages. Every "coming soon" toast/stub in the codebase is deleted. The homepage category ovals link to the same pages.

**Strict scope — CREATE `collection.html` and `story.html`; EDIT all existing HTML files (nav/footer hrefs only), `script.js` (delete the coming-soon handler). Do NOT touch cart logic, notify.js, EMI, VTO, admin.**

**Step 1 — Audit the dead ends (PowerShell 5.1):**

```powershell
Select-String -Path .\*.html,.\*.js -Pattern "coming soon" -AllMatches
Select-String -Path .\*.js -Pattern "comingSoon|coming-soon|showComingSoon" -AllMatches
```

Record every hit — every one of them must be gone by Step 6.

**Step 2 — CREATE `collection.html`.** Clone `index.html` as the base (same `<head>`, same header markup with the new nav hrefs from Step 5, same footer, same includes: `styles.css`, `cart.css`, `cart.js`, `notify.js`, `script.js`). Then replace the main content with:

- A quiet category head: `<h1 id="collection-title">` with the category title + `<p id="collection-intro">` one sentence of intro (small, centered, max-width 640px). No eyebrow label above the H1, no chips, no emoji.
- An empty `<div id="collection-grid" class="product-grid-tiffany"></div>` that reuses the EXACT product-card markup/classes already used on the homepage "Chosen For You" grid.
- Before `</body>`, a `<script>` with the category config and renderer:

```js
(function () {
  var CATEGORIES = {
    'jewelry':        { title: 'All Jewelry',        intro: 'Every piece on one bench-worn shelf.',       filter: function () { return true; } },
    'new':            { title: 'New',                intro: 'Fresh off the bench — the newest pieces first.', filter: function (p) { return p.isNew; } },
    'best-sellers':   { title: 'Best Sellers',       intro: 'The pieces that keep leaving the studio.',   filter: function (p) { return p.isBestseller; } },
    'gifts':          { title: 'Gifts',              intro: 'Small, certain joys — ready to be given.',   filter: function (p) { return p.tags.indexOf('gifts') !== -1; } },
    'welded-forever': { title: 'Welded Forever',     intro: 'Chains measured to you and welded shut — no clasp, no taking it off.', filter: function (p) { return p.tags.indexOf('welded-forever') !== -1; } },
    'necklaces':      { title: 'Necklaces',          intro: 'Chains, lockets, and layers built to last.', filter: function (p) { return p.tags.indexOf('necklaces') !== -1; } },
    'earrings':       { title: 'Earrings',           intro: 'Studs, hoops, drops — and everything between.', filter: function (p) { return p.tags.indexOf('earrings') !== -1; } },
    'rings':          { title: 'Rings',              intro: 'From everyday bands to statement solitaires.', filter: function (p) { return p.tags.indexOf('rings') !== -1; } },
    'bracelets':      { title: 'Bracelets',          intro: 'Adjustable classics and welded circles alike.', filter: function (p) { return p.tags.indexOf('bracelets') !== -1; } },
    'weddings':       { title: 'Weddings',           intro: 'For the day everything begins — and every day after.', filter: function (p) { return p.tags.indexOf('weddings') !== -1; } }
  };
  var slug = new URLSearchParams(location.search).get('c') || 'jewelry';
  var cat = CATEGORIES[slug] || CATEGORIES['jewelry'];
  document.title = cat.title + ' — Abhushan';
  var md = document.querySelector('meta[name="description"]');
  if (md) md.setAttribute('content', cat.intro);
  var h1 = document.getElementById('collection-title');
  var intro = document.getElementById('collection-intro');
  if (h1) h1.textContent = cat.title;
  if (intro) intro.textContent = cat.intro;
  var products = (window.ABHUSHAN_PRODUCTS || []);
  var list = products.filter(cat.filter);
  // render cards with the same markup used by the homepage grid.
  // If the homepage grid has a render function (from Prompt 2 work), call it; otherwise
  // build cards by cloning the existing card DOM pattern exactly.
})();
```

- The renderer must produce cards identical in structure and classes to the homepage product cards (oval image, name, one-line italic description, price, link to the product PDP). Do not invent a new card design.
- If a filter matches zero products, that is a Phase bug to fix in Prompt 5 — but still render the grid frame gracefully (no JS error).
- The inline script must be placed AFTER the `script.js` include (last thing before `</body>`) so `window.ABHUSHAN_PRODUCTS` is defined when it runs.

**Step 3 — CREATE `story.html`.** Same head/header/footer/includes. Main content (no eyebrow labels, no chips, no emoji, generous whitespace, max-width 720px text column):

- `<h1>Our Story</h1>`
- Section 1 (reuse the existing copy from the homepage "Goldsmiths, Not Marketers" section — do not invent conflicting facts: Ahmedabad workshop, founder Divyaraj learned goldsmithing from traditional master craftsmen in Gujarat, one bench and one torch, hand-finish every piece in the same neighborhood, no outsourcing, no dropshipping).
- Section 2 — "What we make": two short paragraphs on everyday 18k pieces and the Welded Forever studio ritual (measured to the wrist, welded shut in the studio).
- Section 3 — founder quote in the existing pull-quote style: "— Divyaraj, Founder & Head Goldsmith" (reuse the existing quote text from the homepage if present).
- Section 4 — "Visit the studio": two sentences + one WhatsApp link styled like existing text links, pointing to `https://wa.me/919979787087?text=Namaste%20Abhushan%20—%20I%20would%20like%20to%20book%20a%20studio%20visit.` Display the number as `+91 99797 87087`.
- `<title>Our Story — Abhushan</title>` and a proper meta description.

**Step 4 — CREATE the central product catalog in `script.js`.** At the very top of `script.js` (before the main IIFE) define:

```js
window.ABHUSHAN_PRODUCTS = [
  // The 5 existing products, harvested from the live PDPs. VERIFY each
  // name / price / image path against the actual product pages before committing.
  { slug: 'threadbare-ring', name: 'Threadbare Ring',        price: 3999,  desc: 'A whisper of gold, 18k, barely there, impossible to forget.',            img: '<real path from PDP>', tags: ['rings'],     sizes: [] },
  { slug: 'hammered-hoop',   name: 'Hammered Hoop Earring',  price: 5299,  desc: 'Hand-hammered texture catches light differently every hour of the day.',  img: '<real path>',          tags: ['earrings'],  sizes: [] },
  { slug: 'greco-lariat',    name: 'Greco Lariat',           price: 32999, desc: 'Inspired by the stepwells of Gujarat. Adjustable drop. 22k gold.',        img: '<real path>',          tags: ['necklaces'], sizes: [] },
  { slug: 'sweet-nothing',   name: 'Sweet Nothing Bracelet', price: 11299, desc: 'A single delicate chain that says everything without speaking.',         img: '<real path>',          tags: ['bracelets', 'gifts'], sizes: [] },
  { slug: 'tomboy-ring',     name: 'Tomboy Ring',            price: 21999, desc: 'Bold width, soft edges. For people who don\'t do dainty.',               img: '<real path>',          tags: ['rings'],     sizes: [] }
];
```

Use the REAL image paths from the existing pages, and copy the italic card lines exactly as the homepage already shows them. Prompt 5 will extend this array with 12 more products plus `isNew` / `isBestseller` flags.

**Step 5 — REWIRE every nav/footer link in ALL existing HTML files.** The mapping (exact):

| Navbar item | href |
|---|---|
| Gifts | `collection.html?c=gifts` |
| New | `collection.html?c=new` |
| Best Sellers | `collection.html?c=best-sellers` |
| Jewelry | `collection.html?c=jewelry` |
| Welded Forever | `collection.html?c=welded-forever` |
| Necklaces | `collection.html?c=necklaces` |
| Earrings | `collection.html?c=earrings` |
| Rings | `collection.html?c=rings` |
| Bracelets | `collection.html?c=bracelets` |
| Weddings | `collection.html?c=weddings` |
| Our Story | `story.html` |

Apply to: desktop navbar, mobile slide-out menu, footer link columns, and the five homepage category ovals ("Find What You're Looking For"). Use a Node script (not PS string ops) for the multi-file replace, e.g. match `href="#"` anchors by their visible text (`>Gifts<`, `>Our Story<`, etc.) and rewrite the href. Do not break the mobile-menu class hooks that Prompt 1 relies on.

**Step 6 — DELETE the coming-soon machinery.** Remove the toast handler(s) found in Step 1 from `script.js` and any `data-coming-soon` attributes from HTML. Nothing may intercept the nav clicks anymore — they are real links.

**Verify (PowerShell 5.1):**

```powershell
Select-String -Path .\*.html,.\*.js -Pattern "coming soon" -Quiet                       # False
Select-String -Path .\script.js -Pattern "comingSoon|showComingSoon" -Quiet             # False
Select-String -Path .\collection.html -Pattern "ABHUSHAN_PRODUCTS|CATEGORIES" -Quiet    # True
Select-String -Path .\story.html -Pattern "919979787087" -Quiet                         # True
Select-String -Path .\index.html -Pattern 'collection\.html\?c=rings' -Quiet            # True
node --check .\script.js                                                                 # clean
```

Then in the browser: click every one of the 11 navbar items (desktop + mobile menu) — each opens its page, no toast. Every category page renders with a title; grids may be sparse until Prompt 5 fills them (Rings/Necklaces/Earrings should already show products).

**Visual check:** collection pages match the site's ivory/gold serif language; the oval category cards on the homepage now navigate; mobile menu links work.

**Commit:** `feat: working collection pages for all categories, Our Story page, nav fully wired, coming-soon removed` — **never push.**

---

## PROMPT 5 — Catalog expansion: fill every empty category with real products, images, and PDPs

**Goal:** After this prompt, every collection page shows at least 3 products. 12 new products get real imagery, real copy, real PDPs, working Add-to-Bag, and search coverage. "New" and "Best Sellers" become curated, populated views.

**Strict scope — EDIT the product catalog in `script.js` (or wherever `ABHUSHAN_PRODUCTS` lives after Prompt 4) and `cart.js` (price map); CREATE 12 `product-*.html` files + download images into `assets/img/products/`. Do NOT redesign existing cards or pages.**

**Step 1 — Audit the catalog.** Find the product array (grep `ABHUSHAN_PRODUCTS`, `addByName`, product names like `Threadbare Ring`). Count per tag. Existing 5 products: Threadbare Ring (rings), Tomboy Ring (rings), Hammered Hoop Earring (earrings), Greco Lariat (necklaces), Sweet Nothing Bracelet (bracelets). Empty or thin: gifts, welded-forever, weddings, new, best-sellers (as filtered views).

**Step 2 — Add the 12 products from APPENDIX A below** (exact names, prices, descriptions — use them verbatim; they are already in the site's voice and comply with the clean-copy rule). Each product object needs: `slug`, `name`, `price` (number, INR), `desc` (the italic one-liner), `descLong` (the 2–3 sentence PDP paragraph), `img` (`assets/img/products/<file>`), `tags` (array — see Appendix A), `sizes` where relevant (rings/bangles: 6 sizes like existing PDPs; chains: length options), and the `isNew` / `isBestseller` flags exactly as given in Appendix A.

**Step 3 — Download the images (PowerShell 5.1, `-UseBasicParsing`):**

```powershell
New-Item -ItemType Directory -Force -Path .\assets\img\products | Out-Null
$dl = @(
  @('suno-bangle.jpg',        'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/60e833e19f85.jpg'),
  @('dhoon-chain.jpg',        'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/de78f08369e4.jpg'),
  @('amulet-charm.jpg',       'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/43809853c670.png'),
  @('forever-fine.jpg',       'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/45902be7c1d3.jpg'),
  @('forever-beaded.jpg',     'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/5906f97f1e91.jpg'),
  @('forever-charm-link.jpg', 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/a7eb4b41974b.jpg'),
  @('saadiya-set.jpg',        'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/0968081a703f.jpg'),
  @('choora-bangles.jpg',     'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/866d32d9f0a2.jpg'),
  @('vachan-rings.jpg',       'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/f103ec4893a1.jpg'),
  @('moonsilver-pendant.jpg', 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/bc74fcd5d7ec.png'),
  @('sunhera-chain.jpg',      'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/03dc3bdf8220.jpg'),
  @('nazar-charm.jpg',        'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/4cb382088740.jpg')
)
foreach ($pair in $dl) {
  try {
    Invoke-WebRequest -UseBasicParsing -Uri $pair[1] -OutFile (Join-Path .\assets\img\products $pair[0]) -TimeoutSec 60
    Write-Output "OK $($pair[0])"
  } catch { Write-Output "FAIL $($pair[0])" }
}
```

Then **view each downloaded image** (you have vision — open the files). If any image shows a competitor brand name, watermark, or unrelated subject, replace it with its backup from APPENDIX B, or if you have your own image-generation capability, generate a replacement in this style instead: warm ivory/linen setting, natural window light, single piece centered, no text in image, portrait 3:4.

**Step 4 — CREATE 12 PDPs** by cloning `product-tomboy-ring.html` (the current, post-Prompt-3 version with all includes). For each: update `<title>`, meta description, breadcrumb name, product image, price (`₹` Indian format), italic one-liner, long description, size row (rings/bangles: the 6 size buttons, none pre-selected with `active`; chains: length options; see Appendix A), and the wired `addToBag('<Name>')`. For the three Welded Forever PDPs, the secondary CTA is "Book a Welding Session" linking to `https://wa.me/919979787087?text=Namaste%20Abhushan%20—%20I%20want%20to%20book%20a%20welding%20session.` Their primary button stays "Add to Bag" (they are products). Ensure every cloned PDP keeps `cart.css`, `cart.js`, `notify.js`, `script.js` includes and the post-Prompt-4 nav hrefs.

**Step 5 — EDIT `cart.js`.** Add all 12 names + prices to the product map that `addByName` uses, so the bag, free-shipping progress, and WhatsApp checkout all show correct prices for new products.

**Step 6 — EDIT `searchCatalog` in `script.js`.** Add keyword coverage for every new product name and its category words (bangle, welded, wedding, bridal, gift, charm, nazar, pendant, chain) so the search overlay returns them.

**Step 7 — Verify zero empty collections** with a quick Node count across `ABHUSHAN_PRODUCTS` tags: `jewelry`, `rings`, `necklaces`, `earrings`, `bracelets`, `welded-forever`, `weddings`, `gifts` must each have ≥3; `new` and `best-sellers` must each have exactly 6.

**Verify (PowerShell 5.1):**

```powershell
Get-ChildItem .\assets\img\products | Measure-Object                     # Count = 12
Select-String -Path .\cart.js -Pattern "Suno Bangle|Moonsilver Pendant|Saadiya Bridal Set" -Quiet   # True
Select-String -Path .\script.js -Pattern "Suno Bangle|Nazar Charm|Vachan Ring Set" -Quiet           # True
Select-String -Path .\product-saadiya-set.html -Pattern "addToBag" -Quiet                            # True
Select-String -Path .\product-forever-fine.html -Pattern "wa\.me/919979787087" -Quiet                # True
node --check .\script.js; node --check .\cart.js                                                     # clean
```

**Visual check:** open each of the 10 collection pages — every grid has ≥3 cards, images load, prices formatted `₹12,499`. Open 3 new PDPs — Add to Bag works, bag badge increments, size validation still fires. Search "gift", "bangle", "bridal" return new products. No console errors.

**Commit:** `feat: 12 new products with imagery and PDPs; all categories populated; new and best-seller curation` — **never push.**

---
## PROMPT 6 — Design normalization: sizes and spacing, white hero icons, strip eyebrows / chips / emoji / arrows

**Goal:** The site stops feeling bloated and oversized. Sections return to normal height. Every icon over the dark hero is white. Eyebrow labels, boxed tag chips, emojis, and decorative arrows/pointers are gone everywhere. Keep the site's warm ivory/gold serif identity and its signature oval imagery.

**Strict scope — EDIT `styles.css`, all HTML files (deletions only), `script.js` (toast/UI strings only). Do NOT touch `notify.js`, `cart.js` logic, or the PDP structure.**

**Step 1 — Spacing and type tokens.** Append to the end of `styles.css` (keeps override priority without hunting existing rules):

```css
/* ===== Phase 2 — normalization tokens (Prompt 6) ===== */
:root {
  --ab-container: 1200px;
  --ab-section-y: clamp(56px, 7vw, 88px);
  --ab-h1: clamp(2.25rem, 4.5vw, 3.4rem);
  --ab-h2: clamp(1.75rem, 3vw, 2.5rem);
  --ab-h3: clamp(1.25rem, 2vw, 1.5rem);
  --ab-body: 16.5px;
}
.section-tiffany, [class*="section"] { padding-top: var(--ab-section-y); padding-bottom: var(--ab-section-y); }
h1 { font-size: var(--ab-h1); }
h2 { font-size: var(--ab-h2); }
h3 { font-size: var(--ab-h3); }
body { font-size: var(--ab-body); }
```

Then audit and fix the actual offenders (do not blind-apply — verify visually):
- `Select-String -Path .\styles.css -Pattern "min-height:\s*(100|90|80)vh"` — anything that is not the main hero becomes `min-height: auto` (or a sane cap like 480px).
- `Select-String -Path .\styles.css -Pattern "padding(-top|-bottom)?:\s*(1[2-9]|[2-9]\d)rem"` — clamp hits to `var(--ab-section-y)`.
- `Select-String -Path .\styles.css -Pattern "font-size:\s*(4\.\d|[5-9])rem"` — cap at `var(--ab-h1)` unless it is the hero H1 (max `3.4rem`).
- Remove empty spacer elements or fixed-height gaps over 120px between homepage sections (the homepage currently has long dead stretches).
- Card grid gaps normalize to 24–32px; paragraph measure capped at 75ch.

**Step 2 — White hero icons.** The header icons that sit over the dark painted hero (hamburger, search, heart, bag) and any scroll/arrow cue inside the hero must render pure white. Append:

```css
/* Phase 2 — white icons over dark hero (Prompt 6) */
.hero-tiffany .site-header svg,
.hero-tiffany ~ * .site-header svg,
.site-header--over-hero svg,
.mobile-nav-toggle svg { color: #FFFFFF; stroke: #FFFFFF; }
.site-header--over-hero .icon-btn, .site-header--over-hero button { color: #FFFFFF; }
.site-header--over-hero svg { filter: drop-shadow(0 1px 2px rgba(0,0,0,.45)); }
```

Adapt selectors to the REAL class names present in `index.html` (inspect the header/hero markup first). The goal, tested on mobile 390px AND desktop: search and heart icons on the dark hero are clearly white and readable; when the sticky header sits on the cream body background it must stay dark — if the site uses one fixed header for both states, prefer `mix-blend-mode: difference` on the icons or a scroll-state class toggle; choose whichever the existing markup supports with the least code.

**Step 3 — Delete ALL eyebrow labels.** Search: `Select-String -Path .\*.html -Pattern "eyebrow|overline|kicker|section-label|small-caps" -AllMatches`. Also search for the known instances like `SINCE 2004`. Delete the elements (and their CSS rules). Where an eyebrow sat directly above a heading, restore balanced spacing with the section's existing rhythm — do not leave a hole.

**Step 4 — Delete boxed tag chips on product cards** (the small rectangles like `ABHUSHAN CLASSIC`, `BEST SELLER`, `ABHUSHAN ORIGINAL` above product names):

```powershell
Select-String -Path .\*.html -Pattern "ABHUSHAN CLASSIC|BEST SELLER|ABHUSHAN ORIGINAL" -AllMatches
```

Delete the chip elements and their CSS. **Do NOT delete functional controls** (size option buttons, Add to Bag, filters). The bestseller/classic information stays as product DATA (the `isBestseller` flags from Prompt 5), it just no longer renders as a badge.

**Step 5 — Emoji and decorative-arrow purge.** CREATE `scripts/strip-decorations.mjs` with the script in APPENDIX C.2 and run `node scripts/strip-decorations.mjs`. It cleans `*.html` files only (not JS/CSS, to protect code). Then manually sweep user-facing strings in `script.js` and `cart.js` (toasts, chat replies, button labels): remove `✦` and any remaining emoji/arrows by hand. Re-run `node --check` on both.

**Step 6 — Decorative icon cleanup.** Remove inline SVGs / icon spans that exist purely as decoration (sparkles, diamonds, arrows inside links like `Shop Now →`, pointer glyphs in lists). KEEP functional icons: hamburger, search, heart/wishlist, bag, close X, chat bubble, WhatsApp contact glyph. Unify kept icons to `stroke-width: 1.5` and `currentColor`. Buttons that lost an arrow keep plain, uppercase, letter-spaced text with the existing underline style.

**Verify (PowerShell 5.1 + Node):**

```powershell
Select-String -Path .\styles.css -Pattern "min-height:\s*(100|90|80)vh" -AllMatches      # hero only
Select-String -Path .\*.html -Pattern "eyebrow|overline|kicker" -Quiet                   # False
Select-String -Path .\*.html -Pattern "ABHUSHAN CLASSIC|BEST SELLER|ABHUSHAN ORIGINAL" -Quiet   # False
node --check .\script.js; node --check .\cart.js                                          # clean
```

```powershell
node -e "const fs=require('fs');let n=0;for(const f of fs.readdirSync('.').filter(x=>x.toLowerCase().endsWith('.html'))){const c=fs.readFileSync(f,'utf8');const m=c.match(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}]/gu);if(m){console.log('DECOR',f,m.length);n++}}console.log(n?'FAIL':'CLEAN')"   # CLEAN
```

**Visual check (mobile 390px + desktop):** hero icons white and readable; homepage has no dead stretches — each section breathes but does not yawn; no eyebrow labels anywhere; product cards show image, name, italic line, price — no boxed chips; no emojis or arrows anywhere; bag flow still works; mobile menu still readable (Prompt 1 intact).

**Commit:** `refactor: spacing and type normalization, white hero icons, removed eyebrows chips emoji and decorative arrows` — **never push.**

---

## PROMPT 7 — Encoding repair: kill the mojibake (Â, â‚¹, âž”) and charset hygiene

**Goal:** Zero double-encoded characters anywhere. All prices render as proper `₹`. All files are clean UTF-8 with `<meta charset="utf-8">` present.

**Strict scope — CREATE `scripts/fix-encoding.mjs`; run it on `*.html`, `*.js`, `*.css`. Nothing else changes.**

**Step 1 — CREATE `scripts/fix-encoding.mjs` with the script in APPENDIX C.1** (it fixes `â‚¹` → `₹`, `â€™` → `'`, the two dash variants, quotes, ellipsis, `âž”` and other arrow artifacts removed, `Â` artifacts cleaned, stray C1 control bytes dropped) and run:

```powershell
node scripts/fix-encoding.mjs
```

**Step 2 — Charset audit.** Every `*.html` must have `<meta charset="utf-8">` as the FIRST tag inside `<head>`. Add it where missing (Node script, one pass).

**Verify (PowerShell 5.1 + Node):**

```powershell
node -e "const fs=require('fs');const bad=['\u00E2\u201A\u00B9','\u00E2\u20AC\u2019','\u00E2\u20AC\u0153','\u00E2\u017E\u201D','\u00C2\u00A0','\u00E2\u20AC\u201C','\u00E2\u20AC\u201D'];let n=0;for(const f of fs.readdirSync('.').filter(x=>/\.(html|js|css)$/.test(x.toLowerCase()))){const c=fs.readFileSync(f,'utf8');bad.forEach(b=>{if(c.includes(b)){console.log('MOJIBAKE',f);n++}})};console.log(n?'FAIL':'CLEAN')"   # CLEAN
Select-String -Path .\index.html -Pattern '<meta charset="utf-8">' -Quiet               # True
node --check .\script.js; node --check .\cart.js; node --check .\notify.js              # clean
```

**Visual check:** all prices across homepage cards, collection pages, PDPs, and the bag drawer show `₹` correctly; apostrophes and dashes look human ("don't", "—"); no `Â`, `â`, arrows, or boxes anywhere; search "₹" nothing breaks.

**Commit:** `fix: utf-8 mojibake cleanup, charset normalization across all files` — **never push.**

---

## PROMPT 8 — Final QA sweep (read-mostly) + micro-fixes

**Goal:** One careful pass over the whole site before push. Fix only small, obvious defects; report anything bigger instead of improvising.

**Checklist (execute in order, report results for each):**

1. `node --check .\script.js; node --check .\cart.js; node --check .\notify.js` — plus every new PDP's inline script loads without console errors (open each page, DevTools console = zero errors).
2. Cart flow end-to-end on `product-saadiya-set.html`: no size pre-selected, refuse-without-size works, add works, drawer shows ₹48,999, free-shipping progress correct, WhatsApp checkout message contains item + price + size.
3. Booking form submits → toast, no console error. (Owner will confirm email arrival after push — Web3Forms delivers to the address tied to the access key.)
4. Chat: honest assistant reply, "WhatsApp the Studio" opens `wa.me/919979787087`.
5. All 11 navbar items open real pages on desktop AND mobile menu; homepage ovals navigate; footer links resolve (no `href="#"` left in nav/footer).
6. All 10 collection pages have ≥3 products; `new` and `best-sellers` show 6 each.
7. Popular search pills still work (`Rings`, `Gifts` etc.); search finds new products.
8. 404 page: pills synced, no mojibake, links resolve.
9. Mobile pass at 390px and 768px: hero, menu, collection grid, PDP, bag drawer — nothing overflows horizontally, nothing oversized.
10. Mojibake scan (Prompt 7 verify) returns zero; emoji scan returns zero.
11. Titles are unique and sensible on every page.

**Commit (only if micro-fixes were needed):** `chore: final QA micro-fixes before push` — **never push.**

---

# APPENDICES

## APPENDIX A — The 12 new products (use copy verbatim)

Voice rule: match the existing catalog's tone (short, warm, material-honest). No emojis, no arrows, no fake claims.

| # | slug | Name | Price | Tags | desc (card italic) | descLong (PDP paragraph) | Sizes | Flags |
|---|------|------|-------|------|--------------------|--------------------------|-------|-------|
| 1 | suno-bangle | Suno Bangle | 13999 | bracelets, gifts | A hand-beaten bangle, warm as afternoon light. | Made on the same bench as our rings, the Suno carries the hammer marks of the hand that finished it. Wear it alone when the day asks for quiet, or stack it in threes when you want some noise. Water-safe, made for everyday wear. | 2.4, 2.6, 2.8 in | isNew |
| 2 | dhoon-chain | Dhoon Chain Bracelet | 8999 | bracelets, gifts | A fine curb chain with a hidden pearl clasp. | The Dhoon is the bracelet equivalent of a kept promise — fine curb links, a single freshwater pearl hidden in the clasp, visible only to the wearer. It layers with everything you already own. | 16, 17, 18, 19 cm | — |
| 3 | amulet-charm | Amulet Charm Bracelet | 15499 | bracelets, gifts, best-sellers | Five small charms gathered on one fine chain. | An eye, a bell, a lotus, a sun, a star — five charms our workshop has cast for years, now on one adjustable chain. Given with meaning, worn with everything. | adjustable | isBestseller |
| 4 | forever-fine | Forever Chain — Fine | 7499 | welded-forever, bracelets, new | Our thinnest welded chain, measured to your wrist. | The original Welded Forever circle: a whisper-fine chain measured to you and welded shut in the studio. No clasp, no taking it off — just a quiet ring of gold that goes where you go. Book a welding session and we'll fit you in forty minutes. | fitted in studio | isNew |
| 5 | forever-beaded | Forever Chain — Beaded | 9999 | welded-forever, bracelets, new | Tiny gold beads on a chain welded shut to you. | Little spheres of gold catch light all day on our beaded welded chain. Like every Forever piece it is measured to your wrist and welded shut at the fitting — water-safe, gym-proof, and made for never taking it off. | fitted in studio | isNew |
| 6 | forever-charm-link | Forever Charm Link | 12499 | welded-forever, bracelets, new | The welded chain for one small charm. | For people who want their Forever chain to say one thing: a star, a heart, an initial, permanently part of the circle. Choose your charm at the fitting; we weld it on before your eyes. | fitted in studio | isNew |
| 7 | saadiya-set | Saadiya Bridal Set | 48999 | weddings, necklaces | A bridal necklace and earring set in warm gold. | Hand-finished in our Ahmedabad workshop for the day everything begins, the Saadiya pairs a mid-weight bridal necklace with matching earrings — traditional at heart, light enough to wear from the morning ceremony to the last dance. | — | — |
| 8 | choora-bangles | Choora Bond Bangles (Pair) | 31999 | weddings, bracelets | A pair of hand-engraved bangles for both wrists. | Engraved by hand, the Choora pair carries the old pattern our master craftsman learned in Gujarat — made in gold that is traditional in spirit but light enough to dance in. Sold as a pair, boxed for gifting. | 2.4, 2.6, 2.8 in | — |
| 9 | vachan-rings | Vachan Ring Set (His & Hers) | 39499 | weddings, rings, gifts | Two wedding bands made together on one bench. | The Vachan set is two bands shaped in the same sitting — hers a little softer, his a little heavier — and engraved inside with the words you choose. Made to be exchanged, then worn for decades. | 6–14 (each) | — |
| 10 | moonsilver-pendant | Moonsilver Pendant | 6499 | gifts, necklaces, new | A crescent and one pearl on a fine gold chain. | The Moonsilver pairs a small gold crescent with a single freshwater pearl — the gift that says "you are my calm" without saying anything at all. Arrives in our cotton-lined box with a handwritten card, ready to give. | 40 + 5 cm extender | isNew |
| 11 | sunhera-chain | Sunhera Fine Chain | 7499 | gifts, necklaces | A whisper-thin gold chain that goes with everything. | Including nothing at all. The Sunhera is the safest beautiful bet in our gift shelf — a fine, strong, hand-finished chain that layers under lockets or shines alone. | 40, 45, 50 cm | — |
| 12 | nazar-charm | Nazar Charm | 4499 | gifts, necklaces, best-sellers, new | A tiny gold eye charm — protection, folded into beauty. | Our most-gifted piece for people you love: a small gold eye on a fine chain, hand-set and ready to give. Comes boxed with a card that explains the tradition, for when they ask what it means. | 45 cm | isNew, isBestseller |

**"New" collection (isNew, 6):** Forever Fine, Forever Beaded, Forever Charm Link, Suno Bangle, Moonsilver Pendant, Nazar Charm.
**"Best Sellers" (isBestseller, 6):** Threadbare Ring, Hammered Hoop Earring, Greco Lariat, Sweet Nothing Bracelet, Amulet Charm Bracelet, Nazar Charm. (Set these flags on the existing 4 products too.)
**Gifts tag** also goes on: Sweet Nothing Bracelet (existing).

## APPENDIX B — Image download map + backups

Primary images are listed in PROMPT 5 Step 3. If a download fails or an image looks off (watermark, competitor brand, wrong subject), use the backup in the same style:

| Product file | Backup URL |
|---|---|
| suno-bangle.jpg | `https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/d0a36c82e367.jpg` |
| dhoon-chain.jpg | `https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/b9a71189e2fd.jpg` |
| amulet-charm.jpg | `https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/b10bd9fa14a8.webp` |
| forever-fine.jpg | `https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/a7eb4b41974b.jpg` (then back up forever-charm-link with `b9a71189e2fd.jpg`) |
| forever-beaded.jpg | `https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/b9a71189e2fd.jpg` |
| saadiya-set.jpg | `https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/94f645111641.jpg` |
| choora-bangles.jpg | `https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/d0a36c82e367.jpg` |
| vachan-rings.jpg | `https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/2624176e44c1.jpg` (use right half if the collage reads poorly) |
| moonsilver-pendant.jpg | `https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/f5bac543e9eb.jpg` |
| sunhera-chain.jpg | `https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/bc74fcd5d7ec.png` |
| nazar-charm.jpg | `https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/f5bac543e9eb.jpg` |

Final check on images: open the homepage and all collection pages — images must look like one coherent brand (warm, natural light, no watermarks, no text baked into images).

## APPENDIX C — Scripts for Antigravity to create

### C.1 `scripts/fix-encoding.mjs` (Prompt 7)

```js
import fs from 'fs';
import path from 'path';

const MAP = new Map([
  // Each key is the mojibake of one real character (UTF-8 bytes mis-read as cp1252).
  ['\u00E2\u201A\u00B9', '\u20B9'],   // mojibake of the rupee sign
  ['\u00E2\u017E\u201D', ''],          // mojibake of the heavy arrow glyph - removed entirely
  ['\u00E2\u20AC\u2019', '\u2019'],    // right single quote (apostrophe)
  ['\u00E2\u20AC\u2018', '\u2018'],    // left single quote
  ['\u00E2\u20AC\u0153', '\u201C'],    // left double quote
  ['\u00E2\u20AC\u201D', '\u2014'],    // em dash
  ['\u00E2\u20AC\u201C', '\u2013'],    // en dash
  ['\u00E2\u20AC\u00A6', '\u2026'],    // ellipsis
  ['\u00E2\u20AC\u00A2', '\u2022'],    // bullet
  ['\u00E2\u20AC\u00B9', '\u2039'],    // left single guillemet
  ['\u00E2\u20AC\u00BA', '\u203A'],    // right single guillemet
  ['\u00E2\u201E\u00A2', '\u2122'],    // trademark
  // Safety net: same sequences when the third byte was kept as a C1 control
  ['\u00E2\u20AC\u0093', '\u2013'],
  ['\u00E2\u20AC\u0094', '\u2014'],
  ['\u00E2\u20AC\u0098', '\u2018'],
  ['\u00E2\u20AC\u0099', '\u2019'],
  ['\u00E2\u20AC\u009C', '\u201C'],
  ['\u00E2\u20AC\u009D', '\u201D'],
  ['\u00C2\u00A0', ' '],                // non-breaking space artifact -> normal space
  ['\u00C2\u00B0', '\u00B0'], ['\u00C2\u00AE', '\u00AE'], ['\u00C2\u00A9', '\u00A9'],
  ['\u00C2\u00AB', '\u00AB'], ['\u00C2\u00BB', '\u00BB'], ['\u00C2\u00B7', '\u00B7'],
  ['\u00C2\u00B4', '\u00B4'], ['\u00C2\u00B8', '\u00B8']
]);

function fixText(t) {
  for (const [k, v] of MAP) t = t.split(k).join(v);
  t = t.replace(/[\u0090-\u009F\u0080-\u008F]/g, '');  // stray C1 controls
  t = t.replace(/\u00C2(?![\u0080-\u00BF])/g, '');      // lone Â
  return t;
}

const exts = ['.html', '.js', '.css'];
const skipDirs = new Set(['node_modules', '.git', 'assets']);
let changed = 0;
function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    const st = fs.statSync(p);
    if (st.isDirectory()) { if (!skipDirs.has(f)) walk(p); continue; }
    if (!exts.includes(path.extname(f).toLowerCase())) continue;
    const before = fs.readFileSync(p, 'utf8');
    const after = fixText(before);
    if (after !== before) { fs.writeFileSync(p, after, 'utf8'); changed++; console.log('fixed:', p); }
  }
}
walk('.');
console.log('files changed:', changed);
```

### C.2 `scripts/strip-decorations.mjs` (Prompt 6, HTML only)

```js
import fs from 'fs';
import path from 'path';
// Emojis, pictographs, dingbats, arrows, variation selectors, ZWJ - stripped from HTML.
const DECOR = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2190}-\u{21FF}\u{FE00}-\u{FE0F}\u{200D}\u{203C}\u{2049}\u{2764}\u{2B50}]/gu;
let changed = 0;
function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    const st = fs.statSync(p);
    if (st.isDirectory()) { if (f !== 'node_modules' && f !== '.git' && f !== 'assets' && f !== 'scripts') walk(p); continue; }
    if (!f.toLowerCase().endsWith('.html')) continue;
    const before = fs.readFileSync(p, 'utf8');
    const after = before.replace(DECOR, '');
    if (after !== before) { fs.writeFileSync(p, after, 'utf8'); changed++; console.log('cleaned:', p); }
  }
}
walk('.');
console.log('files changed:', changed);
```

Note: the order of the two scripts does not matter, but always re-run `node --check` on every JS file after any script pass, and visually spot-check one page per run.

## APPENDIX D — After ALL prompts: push and verify live

1. Open GitHub Desktop → you should see 6 local commits (Prompt 3 through 8).
2. Push to origin. Vercel auto-deploys in ~1 minute.
3. Live checks on the Vercel URL:
   - Navbar: all 11 items open real pages (no coming-soon toast anywhere).
   - Collection pages all populated; new PDPs open; Add to Bag works.
   - Booking form: submit once with your real email → the Web3Forms email should arrive in the inbox tied to the access key (check spam too). If nothing arrives after 10 minutes, tell me — we test the key directly.
   - Chat: honest assistant + WhatsApp button; bag checkout opens WhatsApp to +91 99797 87087.
   - Prices show proper ₹ everywhere; no Â / â artifacts; no emojis; no eyebrow labels; hero icons white on mobile.
   - Phone: page speed feels fine; images under ~1 MB each (Antigravity should keep downloaded images as-is unless one is heavier — then compress to width 1600px).


