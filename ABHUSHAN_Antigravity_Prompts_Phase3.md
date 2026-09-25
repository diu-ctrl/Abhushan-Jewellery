# ABHUSHAN — ANTIGRAVITY PROMPT — PHASE 3

> Repo: `C:\Users\levol\Desktop\OLD LAPTOP ARCHIEVE\Abhushan` (static HTML/CSS/JS, deploys via GitHub Desktop push → Vercel)
> This prompt was written after a full audit of the CURRENT live site (abhushan-by-divyaraj.vercel.app). Every fix below is evidence-based: file names, class names and rough line numbers come from the live deployment. Line numbers may drift by a few lines — ALWAYS locate code by the quoted pattern (class name / text), never by line number alone.

---

## 0) ROLE & MISSION

You are a senior front-end engineer on the Abhushan jewellery site. Execute Steps 1–11 exactly as written, in order. Do not improvise, do not refactor unrelated code, do not change the visual design language (Tiffany-style editorial: Playfair Display headings, Jost body, gold accents, cream background) beyond what is requested. If a step cannot be completed exactly as written, SKIP it, note it in the final report, and continue with the next step — never invent scope.

## 1) GROUND RULES (non-negotiable)

- Shell is **Windows PowerShell 5.1**. No PS7-only features (no `-SkipHttpErrorCheck`, no ternary operator).
- `git` is NOT on PATH. Always use:
  ```powershell
  $git = "C:\Users\levol\AppData\Local\GitHubDesktop\app-3.6.4\resources\app\git\cmd\git.exe"
  ```
- After every JS edit, run: `node --check .\script.js` and `node --check .\cart.js`. Zero output = pass.
- All files are UTF-8. If you ever rewrite a file from PowerShell, use:
  ```powershell
  [System.IO.File]::WriteAllText($path, $text, (New-Object System.Text.UTF8Encoding($false)))
  ```
- Prices: `₹` + Indian formatting, e.g. `₹4,800`. Never introduce mojibake (`â‚¹`, `Â`, `âž”`).
- Do NOT add emojis, decorative glyphs, "eyebrow" micro-labels, or boxed chip labels anywhere.
- **NEVER run `git push`.** The owner pushes via GitHub Desktop.

## 2) SCOPE LOCK (STRICT)

You may EDIT only these existing files:
- `index.html`, `story.html`, `404.html`, `collection.html`
- All 17 `product-*.html` files (greco-lariat, hammered-hoop, sweet-nothing, threadbare-ring, tomboy-ring, suno-bangle, dhoon-chain, amulet-charm, forever-fine, forever-beaded, forever-charm-link, saadiya-set, choora-bangles, vachan-rings, moonsilver-pendant, sunhera-chain, nazar-charm)
- `styles.css`, `script.js`, `cart.css`
- You may CREATE only: `privacy.html`

FORBIDDEN: editing `vercel.json`/any config, deleting or renaming images, adding CDN/npm dependencies, renaming files, touching any file not listed above, and **any form of `git push`**.

## 3) CONTEXT — ALREADY DONE, DO NOT REDO

The live site already has all of the following working. Do not touch or rebuild them:
- Cart system (`cart.js`, `window.AbhushanCart`), free-shipping bar, WhatsApp checkout — WhatsApp number is already `919979787087` everywhere (verify only, Step 9).
- `collection.html` catalog: 17 products in `window.ABHUSHAN_PRODUCTS` (top of `script.js`), all 10 categories populated (`?c=necklaces`, `?c=rings`, `?c=welded-forever`, etc.).
- Desktop nav (11 items) on every page already points to `collection.html?c=...` and `story.html`.
- All 17 product pages exist and are reachable.
- No mojibake was found in the current files (verify only, Step 9).

---

## STEP 1 — HERO: remove the white borders above and below the hero image

**Problem:** The hero currently shows a thin white/cream strip at the top and bottom of the hero image. The hero image itself is clean (dark edges) — the strips come from layout, not the PNG.

**1a.** In `index.html`, the hero is `<section class="hero-section-tiffany" id="hero-slider">` (near the top of `<body>`, before the fixed header). Confirm the structure is: `.hero-image-container-tiffany` → `img.hero-bg-img` (src `images/extras/hero_main.png`) + `.hero-overlay-tiffany` + hero content.

**1b.** In `styles.css` find `.hero-section-tiffany` (~line 2407). It is `height: 100vh`. Replace that rule and the related rules so the hero is guaranteed edge-to-edge with NO white strips. Add this override block at the **end** of `styles.css`:

```css
/* ===== PHASE 3 FIX — HERO FULL-BLEED, NO WHITE BORDERS ===== */
.hero-section-tiffany {
  height: 100vh;                 /* fallback */
  height: 100svh;                /* small-viewport height: kills the bottom strip on mobile */
  margin: 0;
  padding: 0;
  border: 0;
  box-shadow: none;
}
.hero-image-container-tiffany {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  overflow: hidden;
}
.hero-bg-img {
  position: absolute;
  inset: -3% 0;                  /* crops 3% top+bottom: guarantees no white hairline of any origin */
  width: 100%;
  height: 106%;
  object-fit: cover;
  object-position: center;
  transform: none;
}
```

**1c.** Root-cause check: search `styles.css` for any rule that gives the hero or its direct neighbours a top/bottom border, margin, or padding that could show `--color-bg` (cream) above/below the hero — e.g. search `Select-String -Path .\styles.css -Pattern 'hero' -Context 2,2` and inspect every match that mentions `border`, `margin`, `padding`. Remove the offending declarations (keep a comment `/* removed in Phase 3: white strip source */`). The CSS override above already masks any residual hairline, but the root cause must also be cleaned where found. Report in the final summary what the source was.

**1d.** Do not change the hero content (brand title, overlay) — only the borders/strips.

---

## STEP 2 — The three big horizontal blocks → three compact VERTICAL cards

**Problem:** On the homepage, "The Emerald Edit", "Icons & Amulets" and "Goldsmiths, Not Marketers" are three huge full-width horizontal blocks stacked one after another. They must become three small, side-by-side VERTICAL (portrait) rectangles — compact size and spacing.

**2a.** In `index.html` locate and DELETE these three blocks (locate by class, not line number):
- Block 1: the `<div class="split-editorial-tiffany">` containing `<h3 class="split-story-title-tiffany">The Emerald Edit</h3>` (one whole `.split-editorial-tiffany` block — "Left Image, Right Text" story 1).
- Block 2: the `<div class="split-editorial-tiffany">` containing `<h3 class="split-story-title-tiffany">Icons &amp; Amulets</h3>` (story 2).
- Block 3: the `<section class="section-story-tiffany" id="section-story" aria-label="Our Story">` containing `<h2 class="story-title-tiffany">Goldsmiths, Not Marketers</h2>` — delete this entire homepage section. The full founder story already lives on `story.html`, so nothing is lost.
- Before deleting block 3, scan all HTML for `href="#section-story"` and re-point any such link to `story.html`.

**2b.** In the position where Block 1 was, INSERT this new compact section:

```html
<!-- ========== THREE EDITS (compact vertical cards — Phase 3) ========== -->
<section class="edits-row-tiffany" id="three-edits" aria-label="Featured edits">
  <a class="edit-card-tiffany" href="collection.html?c=necklaces">
    <span class="edit-card-media-tiffany"><img src="images/stories/cat_editorial_split.png" alt="The Emerald Edit" width="800" height="1000" loading="lazy" decoding="async"></span>
    <span class="edit-card-title-tiffany">The Emerald Edit</span>
    <span class="edit-card-sub-tiffany">Hand-set stones, heirloom build</span>
  </a>
  <a class="edit-card-tiffany" href="collection.html?c=gifts">
    <span class="edit-card-media-tiffany"><img src="images/stories/editorial_right.png" alt="Icons and Amulets" width="800" height="1000" loading="lazy" decoding="async"></span>
    <span class="edit-card-title-tiffany">Icons &amp; Amulets</span>
    <span class="edit-card-sub-tiffany">Charms that carry weight</span>
  </a>
  <a class="edit-card-tiffany" href="story.html">
    <span class="edit-card-media-tiffany"><img src="images/Brand Experience Grid/editorial_left.png" alt="Goldsmiths, Not Marketers" width="800" height="1000" loading="lazy" decoding="async"></span>
    <span class="edit-card-title-tiffany">Goldsmiths, Not Marketers</span>
    <span class="edit-card-sub-tiffany">Made at the bench, since day one</span>
  </a>
</section>
```

The three image paths above are already used elsewhere on the site — verify each file exists in `images/` (e.g. `Get-Item "images\stories\cat_editorial_split.png"`). If one is missing, substitute any existing editorial image from the site that suits the card. Never invent a path.

**2c.** Append to the **end** of `styles.css`:

```css
/* ===== PHASE 3 — THREE EDITS: compact vertical cards ===== */
.edits-row-tiffany {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: stretch;
  gap: 14px;
  padding: 40px 20px 8px;
  max-width: 720px;
  margin: 0 auto;
}
.edit-card-tiffany {
  flex: 0 1 200px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #FFFFFF;
  border: 1px solid var(--color-border, #E7E1D8);
  padding: 14px 14px 16px;
  text-align: left;
  transition: transform .25s ease, box-shadow .25s ease;
}
.edit-card-tiffany:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(0,0,0,.08); }
.edit-card-media-tiffany { display: block; aspect-ratio: 3 / 4; overflow: hidden; }
.edit-card-media-tiffany img { width: 100%; height: 100%; object-fit: cover; display: block; }
.edit-card-title-tiffany {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 15px;
  letter-spacing: .04em;
  color: var(--color-text, #1c1c1c);
}
.edit-card-sub-tiffany {
  font-family: 'Jost', sans-serif;
  font-size: 11.5px;
  line-height: 1.45;
  color: var(--color-text-light, #6b6b6b);
}
@media (max-width: 640px) {
  .edits-row-tiffany { gap: 10px; padding: 28px 14px 4px; }
  .edit-card-tiffany { flex: 1 1 0; padding: 10px 10px 12px; }
  .edit-card-title-tiffany { font-size: 13px; }
  .edit-card-sub-tiffany { display: none; }
}
```

---

## STEP 3 — WELDED FOREVER PDPs: duplicate "Book a Welding Session" + fake "Fitted in Studio" size

**Problem (verified on live):** Exactly three product pages are broken:
- `product-forever-fine.html`
- `product-forever-beaded.html`
- `product-forever-charm-link.html`

In each of these three files:
1. The string `Book a Welding Session` appears **TWICE** in the buy panel (two stacked CTAs — one standalone full-width anchor, and one anchor that misuses `class="btn-vto-trigger-tiffany"`).
2. The size selector's ONLY option button reads `Fitted in Studio` — so the block renders "Select Size / Fitted in Studio", which is wrong. These are custom-fitted welded chains; there is no size to pick.

**3a. Deduplicate the CTA.** In each of the three files, keep exactly ONE "Book a Welding Session" anchor — the standalone block (full-width, gold border, ~line 1397 in the live file):
```html
<div style="margin-top: 14px;"><a href="https://wa.me/919979787087?text=Namaste%20Abhushan%20%E2%80%94%20I%20want%20to%20book%20a%20welding%20session." target="_blank" rel="noopener" style="display: block; width: 100%; text-align: center; padding: 14px 18px; border: 1px solid var(--color-gold); color: var(--color-gold); font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; text-decoration: none;">Book a Welding Session</a></div>
```
DELETE the second one — the anchor with `class="btn-vto-trigger-tiffany"` that links to the same wa.me welding-session URL. Do not touch any other element in the actions row (Add to Bag, wishlist, VTO trigger button must all survive).

**3b. Remove the fake size selector.** In each of the three files, DELETE the entire block:
```html
<div class="size-selector-wrap-tiffany">
  <span class="size-label-tiffany">Select Size</span>
  <div class="size-options-tiffany">
  <button type="button" class="size-option-btn-tiffany" onclick="selectSize(this)">Fitted in Studio</button>
  </div>
</div>
```
(whitespace may differ — match by `size-selector-wrap-tiffany` + the `Fitted in Studio` option) and REPLACE it with:
```html
<p class="welded-note-tiffany">Measured to you and welded shut in the studio — no clasp, ever. Fitting takes about forty minutes.</p>
```

No JS change is needed: `cart.js → addByName()` only demands a size when a `.size-selector-wrap-tiffany` exists on the page; with the block removed, Add to Bag adds the item with no size, which is correct for these pieces.

**3c. Append to the end of `styles.css`:**
```css
/* ===== PHASE 3 — WELDED FOREVER FIT NOTE ===== */
.welded-note-tiffany {
  font-size: 12px;
  line-height: 1.55;
  color: var(--color-text-light, #6b6b6b);
  font-style: italic;
  margin: 6px 0 10px;
}
```

**3d.** Re-check the other 14 product pages: every `product-*.html` must contain the string `Book a Welding Session` at most ONCE, and no size option anywhere may read `Fitted in Studio` (other welded pages that legitimately use options like `Standard (40 cm)` are correct — leave them).

---

## STEP 4 — LOGO: tapping "Abhushan" on ANY page lands on the homepage hero

**Problem:** The header logo link exists (`<a ... class="logo-link" id="logo-link">`) but points to `index.html` — it must land on the HERO of the landing page. The hero's anchor id is `hero-slider` (on `<section class="hero-section-tiffany" id="hero-slider">`).

**4a.** In `index.html` (the logo anchor, `id="logo-link"`, ~line 4436): change `href="index.html"` → `href="#hero-slider"`.

**4b.** In EVERY other page (`story.html`, `404.html`, `collection.html`, all 17 `product-*.html`): find the anchor with `id="logo-link"` and change its `href="index.html"` → `href="index.html#hero-slider"`.

**4c.** Append to the end of `styles.css` (safe even if duplicated):
```css
/* ===== PHASE 3 — LOGO ALWAYS RETURNS TO HERO ===== */
html { scroll-behavior: smooth; }
a.logo-link { text-decoration: none; color: inherit; display: inline-block; }
```

**4d.** Verify:
```powershell
Get-ChildItem *.html | ForEach-Object { $m = Select-String -Path $_.FullName -Pattern 'id="logo-link".*href="([^"]*)"' ; if ($m) { Write-Output ($_.Name + " -> " + $m.Matches[0].Groups[1].Value) } }
```
Expected: `index.html -> #hero-slider`; every other file → `index.html#hero-slider`.

---

## STEP 5 — BROKEN LINKS: Our Story misdirect, /privacy 404, placeholder socials

**5a. "Read Our Story" misdirected (verified on live).** In `index.html` (~line 12164):
```html
<a href="#booking-section" class="experience-link-tiffany">Read Our Story</a>
```
→ change to:
```html
<a href="story.html" class="experience-link-tiffany">Read Our Story</a>
```
Leave the neighbouring `Book a Session` and `Start a Custom Piece` links (they correctly target `#booking-section`).

**5b. Scan every page for other misdirected story links:**
```powershell
Get-ChildItem *.html | Select-String -Pattern 'Read Our Story|Read our story'
Get-ChildItem *.html | Select-String -Pattern 'href="#section-story"'
```
Every "Read Our Story" link and every `#section-story` anchor must point to `story.html`.

**5c. Privacy Policy is a 404 (verified live).** All pages link `href="/privacy"` (footer, twice per page) and no privacy page exists. CREATE `privacy.html` in the repo root: a clean, standalone page with the same `<head>` essentials (`<meta charset="UTF-8">`, viewport, title `Privacy Policy — Abhushan`, `styles.css` + `cart.css`), the SAME header and footer markup copied from `index.html` (logo link must use `index.html#hero-slider` per Step 4), and this main content:

```html
<main id="maincontent" style="max-width: 760px; margin: 0 auto; padding: 120px 24px 80px;">
  <h1 style="font-family: 'Playfair Display', Georgia, serif; font-weight: 400; font-size: clamp(26px, 4vw, 40px); margin: 0 0 24px;">Privacy Policy</h1>
  <p style="font-size: 15px; line-height: 1.7; color: var(--color-text-light, #555);">Abhushan respects your privacy. This page explains, in plain language, what we collect and what we never do.</p>
  <h2 style="font-family: 'Playfair Display', Georgia, serif; font-weight: 400; font-size: 20px; margin: 28px 0 10px;">What we collect</h2>
  <p style="font-size: 15px; line-height: 1.7; color: var(--color-text-light, #555);">Only what you give us: your name, contact details and messages when you book a welding session, enquire, or subscribe. Your bag and wishlist live in your own browser (localStorage) — we never see them until you send them to us.</p>
  <h2 style="font-family: 'Playfair Display', Georgia, serif; font-weight: 400; font-size: 20px; margin: 28px 0 10px;">How it is used</h2>
  <p style="font-size: 15px; line-height: 1.7; color: var(--color-text-light, #555);">Solely to answer you, confirm appointments, and — if you subscribed — share occasional studio news. Enquiries are delivered through Web3Forms to the studio inbox. We never sell, rent or trade your details.</p>
  <h2 style="font-family: 'Playfair Display', Georgia, serif; font-weight: 400; font-size: 20px; margin: 28px 0 10px;">Your choices</h2>
  <p style="font-size: 15px; line-height: 1.7; color: var(--color-text-light, #555);">Write to us anytime to view, correct or delete your details, or to unsubscribe. Contact: WhatsApp +91 99797 87087.</p>
</main>
```
Then in ALL pages that currently link `/privacy` (footer: `href="/privacy"` and `id="fl-privacy"`), change `href="/privacy"` → `href="privacy.html"` (relative path — `/privacy` 404s on Vercel).

**5d. Placeholder social links (verified live).** In the footer of `index.html` (and the same footer markup on every other page), DELETE these two anchors entirely:
- `<a href="https://www.pinterest.com/abhushan_placeholder/" ... class="social-link" aria-label="Pinterest">` (with its inner icon/svg)
- `<a href="https://www.facebook.com/abhushan_placeholder/" ... class="social-link" aria-label="Facebook">` (with its inner icon/svg)
Keep the real Instagram link (`https://www.instagram.com/divyraj.creates`). If other pages contain the same placeholder anchors, remove them there too. Do not add new social links.

**5e. Whole-site dead-link audit:**
```powershell
Get-ChildItem *.html | Select-String -Pattern 'href="#"'
Get-ChildItem *.html | Select-String -Pattern 'href="/'
```
- Every `href="#"` must be removed or given a real target (the only allowed in-page anchors: `#hero-slider` on index's logo, `#booking-section` where a booking section exists on that page).
- Every root-relative `href="/..."` must be changed to a relative file (`privacy.html`) or a full `https://` URL.
- Every `href="product-....html"` / `collection.html?c=...` / `story.html` must match an existing file (all 17 product files exist — do not create new ones).

---

## STEP 6 — 404 PAGE: cart & wishlist buttons are dead there

**Problem (verified live):** `404.html` is the only page that does NOT load `cart.js`/`cart.css`, so the bag and wishlist buttons do nothing on it.

**6a.** In `404.html`:
- Add `<link rel="stylesheet" href="cart.css">` immediately AFTER the existing `styles.css` link.
- Add `<script src="cart.js"></script>` immediately BEFORE the existing `<script src="script.js"></script>`.

**6b.** While there, confirm `404.html`'s logo link was updated per Step 4b and its footer `/privacy` link per Step 5c.

---

## STEP 7 — WEB3FORMS: wire the booking & newsletter forms (key + graceful fallback)

**Problem (verified live):** No form on the site actually delivers anywhere. The studio's Web3Forms access key must be wired in.

- Key: `10c7b958-4d2a-411b-ab73-fb254ad36c34`
- Endpoint: `POST https://api.web3forms.com/submit` (JSON body)
- Fallback when the send fails: save the payload to `localStorage` key `abhushan_form_fallback` AND offer a prefilled WhatsApp link to `919979787087`.

**7a. Booking form — inject into the EXISTING handler (do NOT add a second listener).**
`script.js` already intercepts `#booking-form` submits in TWO places (one near ~line 585: `bookingForm.addEventListener('submit', (e) => { e.preventDefault(); ...`, and a second near ~line 1862 inside the modal/booking flow). In EACH of those handlers, immediately AFTER the `e.preventDefault();` line, insert:

```js
      // PHASE 3 — deliver booking to the studio inbox (Web3Forms), graceful on failure
      (function () {
        var fd = {};
        Array.prototype.forEach.call(bookingForm.elements, function (el) {
          if (el.name && el.type !== 'submit' && el.type !== 'button') fd[el.name] = el.value;
        });
        fd.access_key = '10c7b958-4d2a-411b-ab73-fb254ad36c34';
        fd.subject = 'Abhushan — Welding Session Booking';
        fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(fd)
        }).catch(function () {
          try {
            var store = JSON.parse(localStorage.getItem('abhushan_form_fallback') || '[]');
            fd._savedAt = new Date().toISOString();
            fd._form = 'booking';
            store.push(fd);
            localStorage.setItem('abhushan_form_fallback', JSON.stringify(store));
          } catch (err) {}
        });
      })();
```

Notes: this is fire-and-forget so the existing success UI (popup/reset) keeps working untouched. The same-variable name `bookingForm` is used at both handler sites, so the snippet works in both. Do not modify the rest of either handler.

**7b. Newsletter/subscribe forms — NEW wiring (they currently have NO submit handler).**
Append this to the **end** of `script.js`:

```js
/* ===== PHASE 3 — WEB3FORMS: newsletter/subscribe forms ===== */
(function () {
  'use strict';
  var WA_NUMBER = '919979787087';

  Array.prototype.forEach.call(document.querySelectorAll('.footer-subscribe-form'), function (form) {
    if (form.__web3wired) return;
    form.__web3wired = true;

    var key = form.querySelector('input[name="access_key"]');
    if (!key) {
      key = document.createElement('input');
      key.type = 'hidden';
      key.name = 'access_key';
      form.appendChild(key);
    }
    key.value = '10c7b958-4d2a-411b-ab73-fb254ad36c34';

    var subj = form.querySelector('input[name="subject"]');
    if (!subj) {
      subj = document.createElement('input');
      subj.type = 'hidden';
      subj.name = 'subject';
      form.appendChild(subj);
    }
    subj.value = 'Abhushan — Newsletter Subscribe';

    var status = form.querySelector('.web3-status');
    if (!status) {
      status = document.createElement('p');
      status.className = 'web3-status';
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      form.appendChild(status);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var emailEl = form.querySelector('input[type="email"], input[name="email"]');
      if (!emailEl || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim())) {
        status.textContent = 'Please enter a valid email address.';
        return;
      }
      var payload = {};
      Array.prototype.forEach.call(form.elements, function (el) {
        if (el.name && el.type !== 'submit' && el.type !== 'button') payload[el.name] = el.value;
      });
      status.textContent = 'Sending\u2026';
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (!res.success) throw new Error(res.message || 'Send failed');
          status.textContent = 'Thank you \u2014 you\u2019re on the list.';
          form.reset();
        })
        .catch(function () {
          try {
            var store = JSON.parse(localStorage.getItem('abhushan_form_fallback') || '[]');
            payload._savedAt = new Date().toISOString();
            payload._form = 'subscribe';
            store.push(payload);
            localStorage.setItem('abhushan_form_fallback', JSON.stringify(store));
          } catch (err) {}
          status.innerHTML = 'We couldn\u2019t reach the studio just now. ' +
            '<a href="https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent('Namaste Abhushan — I\'d like studio news and early access.') + '" target="_blank" rel="noopener">Join via WhatsApp instead</a>.';
        });
    });
  });
})();
```

If the newsletter POPUP on the homepage contains its own form (search `index.html` for `newsletter-popup`), give that form the class `footer-subscribe-form` too so the same wiring covers it.

**7c. Admin login form is excluded** — never wire `#admin-login-form` to Web3Forms.

**7d. Append to the end of `styles.css`:**
```css
/* ===== PHASE 3 — WEB3FORMS STATUS LINE ===== */
.web3-status { font-size: 12.5px; line-height: 1.5; margin: 10px 0 0; min-height: 16px; }
.web3-status a { text-decoration: underline; }
```

**7e.** Run `node --check .\script.js` — must pass with zero output.

---

## STEP 8 — GLOBAL HYGIENE (bounded, no redesign)

**8a. Spacing sanity.** In `styles.css`, scan top-level homepage sections for oversized vertical padding (e.g. `padding: 140px`, `160px`, `180px`, or margins ≥ 120px between stacked sections) and cap them at a consistent rhythm:

```css
/* ===== PHASE 3 — SECTION RHYTHM ===== */
:root { --sp-section: clamp(56px, 8vw, 88px); }
```
Apply `--sp-section` as the vertical padding of the main homepage sections (hero excluded — it is full-bleed; the new `edits-row-tiffany` keeps its own compact padding). Do not touch component-internal paddings, the collection grid, or PDP layout beyond this.

**8b. Eyebrow / emoji / decorative-glyph sweep (verify — current code is mostly clean):**
```powershell
Get-ChildItem *.html,*.js | Select-String -Pattern 'eyebrow'
Select-String -Path *.html,*.js -Pattern "[\u2700-\u27BF\u2B00-\u2BFF\u2600-\u26FF\uFE0F]"
```
- Delete any ELEMENT whose class contains `eyebrow` from markup if it renders visible text (unused CSS rules may stay).
- Remove any decorative emoji/star/glyph characters from visible text and JS-injected strings. The functional arrow `→` (U+2192) and the close `×` (U+00D7) are allowed and must be kept.

**8c. Do not** change fonts, colours, buttons, cards, or anything else not explicitly listed in this prompt.

---

## STEP 9 — VERIFICATION SWEEP (PowerShell 5.1 — run everything, paste outputs into your final report)

```powershell
$git = "C:\Users\levol\AppData\Local\GitHubDesktop\app-3.6.4\resources\app\git\cmd\git.exe"

Write-Output "== 1. Hero override present =="
Select-String -Path .\styles.css -Pattern 'PHASE 3 FIX — HERO FULL-BLEED'

Write-Output "== 2. Three edits section =="
Select-String -Path .\index.html -Pattern 'edits-row-tiffany'
Select-String -Path .\index.html -Pattern 'split-editorial-tiffany|section-story-tiffany'
# expect: edits-row-tiffany FOUND; split-editorial/section-story GONE from index.html

Write-Output "== 3. Welding CTA exactly once per PDP =="
Get-ChildItem product-*.html | ForEach-Object {
  $c = (Select-String -Path $_.FullName -Pattern 'Book a Welding Session' -AllMatches | Measure-Object).Count
  if ($c -gt 0) { Write-Output ($_.Name + " -> " + $c) }
}
# expect: ONLY forever-fine / forever-beaded / forever-charm-link listed, each -> 1

Write-Output "== 4. 'Fitted in Studio' gone =="
Select-String -Path product-*.html -Pattern 'Fitted in Studio'
# expect: no output

Write-Output "== 5. Logo targets =="
Get-ChildItem *.html | ForEach-Object { $m = Select-String -Path $_.FullName -Pattern 'id="logo-link"' ; if ($m) { $h = (Select-String -Path $_.FullName -Pattern '<a[^>]*id="logo-link"[^>]*href="([^"]*)"').Matches[0].Groups[1].Value; Write-Output ($_.Name + " -> " + $h) } }
# expect: index.html -> #hero-slider ; all others -> index.html#hero-slider

Write-Output "== 6. Our Story links =="
Select-String -Path .\index.html -Pattern 'Read Our Story'
# expect: the experience-link-tiffany anchor now has href="story.html"

Write-Output "== 7. Privacy page + footer links =="
Get-Item .\privacy.html
(Select-String -Path *.html -Pattern 'href="/privacy"' | Measure-Object).Count
# expect: privacy.html exists; count -> 0
(Select-String -Path *.html -Pattern 'href="privacy.html"' | Measure-Object).Count
# expect: >= 18

Write-Output "== 8. Placeholder socials removed =="
Select-String -Path *.html -Pattern 'abhushan_placeholder'
# expect: no output

Write-Output "== 9. 404 cart includes =="
Select-String -Path .\404.html -Pattern 'cart\.css|cart\.js'
# expect: 2 matches

Write-Output "== 10. Web3Forms wired =="
Select-String -Path .\script.js -Pattern 'api\.web3forms\.com/submit'
Select-String -Path .\script.js -Pattern '10c7b958-4d2a-411b-ab73-fb254ad36c34'
Select-String -Path .\script.js -Pattern 'abhushan_form_fallback'
# expect: all three found (web3forms/submit twice is fine — booking + subscribe)

Write-Output "== 11. WhatsApp number unchanged =="
Get-ChildItem *.js,*.html | Select-String -Pattern 'wa\.me/(\d+)'
# expect: every match is wa.me/919979787087 — nothing else

Write-Output "== 12. Mojibake absent =="
Select-String -Path *.html,*.js -Pattern 'â‚¹|âž”|Â '
# expect: no output

Write-Output "== 13. JS syntax =="
node --check .\script.js
node --check .\cart.js
# expect: no output from either

Write-Output "== 14. Git status =="
& $git status --short
```

---

## STEP 10 — VISUAL CHECKLIST (open in browser, check every item)

Homepage (`index.html`):
- [ ] Hero image is edge-to-edge — no white/cream strip above or below it, on desktop AND at 390px mobile width.
- [ ] The three featured blocks now appear as THREE SMALL VERTICAL (portrait) cards in one row, compact and evenly spaced — Emerald Edit / Icons & Amulets / Goldsmiths, Not Marketers — each linking to its collection (`?c=necklaces`, `?c=gifts`, `story.html`).
- [ ] No giant horizontal editorial blocks remain between the hero and the next sections.
- [ ] Scrolling to the top and tapping "Abhushan" in the header scrolls smoothly to the hero.

Product pages:
- [ ] `product-forever-fine.html`, `product-forever-beaded.html`, `product-forever-charm-link.html`: exactly ONE "Book a Welding Session" button; NO size selector; the italic note "Measured to you and welded shut in the studio…" shows instead; "Add to Bag" works (no size demand, item lands in the bag drawer).
- [ ] `product-threadbare-ring.html` / `product-tomboy-ring.html`: size buttons still required before Add to Bag (shake + toast if skipped).
- [ ] All other PDPs unchanged and functional.

Navigation & links:
- [ ] From `story.html`, any PDP and `404.html`: tapping the header logo returns to the homepage HERO.
- [ ] "Read Our Story" (homepage experience grid) opens `story.html`.
- [ ] Footer "Privacy Policy" opens `privacy.html` (no 404) on every page.
- [ ] No Pinterest/Facebook placeholder icons in any footer.
- [ ] Every nav item on desktop and mobile opens a real page: Gifts, New, Best Sellers, Jewelry, Welded Forever, Necklaces, Earrings, Rings, Bracelets, Weddings, Our Story.

Forms & cart:
- [ ] Homepage booking form: fill + submit → success UI appears; network tab (or Antigravity console) shows `api.web3forms.com/submit` POST; if offline, the WhatsApp fallback link appears.
- [ ] Footer subscribe (index + story + 404): valid email → success message; invalid email → inline validation message.
- [ ] `404.html`: bag drawer opens, count badge works.
- [ ] WhatsApp checkout from the bag still opens `wa.me/919979787087` with the order text.

Console: zero JavaScript errors on index, story, collection (any `?c=`), all 17 PDPs, privacy, 404.

---

## STEP 11 — COMMIT (and stop — NEVER push)

After every step above is done and Step 9's outputs are clean:

```powershell
$git = "C:\Users\levol\AppData\Local\GitHubDesktop\app-3.6.4\resources\app\git\cmd\git.exe"
& $git add -A
& $git commit -m "Phase 3: hero full-bleed, compact vertical edit cards, Welded Forever PDP fixes, logo-to-hero, link/privacy/social cleanups, 404 cart includes, Web3Forms wiring"
```

Do NOT run `git push`. The owner reviews and pushes via GitHub Desktop; Vercel deploys automatically.

---

## FINAL REPORT FORMAT

End with a short report containing:
1. Steps completed (1–11) and any step SKIPPED with the reason.
2. The root cause you found for the hero white strips (Step 1c).
3. The full output of the Step 9 verification block.
4. Files changed (from `git show --stat HEAD`).
