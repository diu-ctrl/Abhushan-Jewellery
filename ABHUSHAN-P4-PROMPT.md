# ABHUSHAN — P4 EXECUTION SPEC (Accessibility & SEO Hygiene)

**Executor:** Antigravity
**Production URL:** https://abhushan-by-divyaraj.vercel.app
**Baseline:** P1+P2 verified 41/42 (2026-11-11), P3 verified independently **17/17 PASS** (2026-11-11, post-deploy audit incl. live rate-limiter 429 test). This package is P4. Do NOT re-touch P1-P3 behaviour.
**Budget:** $0.

---

## 0. RULES

1. Deploy EXACTLY the files in this package. Do not reformat, minify, or "improve" anything else.
2. Every file ships PRE-BUILT. Verify SHA256 against `PACKAGE-MANIFEST.txt` before touching the repo.
3. If live markup differs from the anchors below, do NOT improvise — record it under `## Deviations` and continue.
4. Secret hygiene: never print `ADMIN_PASS`, `AB_CLOUD_KEY`, or any key material in commits, logs, or this report.
5. Run `node test_p4.js` offline BEFORE deploying. All checks must PASS.

---

## 1. WHAT THIS PACKAGE FIXES (why)

- **F1 — Search input has no accessible name (WCAG 4.1.2 / 3.3.2).**
  The search box on `home.html`, `collection.html`, `story.html` (`id="search-input-field"`) has only a placeholder. Screen readers announce it as an unnamed edit field. Fix: `aria-label="Search jewellery"` on the same tag. Zero visual change.
- **F2 — Booking confirmation toast is invisible to screen readers (WCAG 4.1.3 Status Messages).**
  `script.js` `showToast()` (booking form, `abhushan-toast`) injects a div with inline styles and no role. Success messages ("Success! Booking AB-XXXX requested") are never announced. Fix: set `role="status"` + `aria-live="polite"` on the created element. The cart toasts (`wl-toast` in script.js, `bag-toast` in cart.js) ALREADY have these attributes — verified — do not touch them.
- **F3 — Home page has no `<h1>` (WCAG 1.3.1 + SEO).**
  home.html starts headings at h2. Fix: one visually-hidden `<h1 class="sr-only">Abhushan – Fine Gold Jewellery in Ahmedabad, Gujarat</h1>` as the first element inside `<main id="maincontent">` (wording mirrors the page `<title>`), plus a standard `.sr-only` utility appended to `styles.css`. Zero visual change (clipped, 1px, absolute).
- **F4 — Booking form lacks autofill hints (WCAG 1.3.5 Identify Input Purpose + conversion).**
  The 7-field booking form exists on home + all 5 product pages. Name/email/phone fields get `autocomplete="name" / "email" / "tel"` so browsers and password managers can autofill. Zero visual change.
- **F5 — cart.css has no `prefers-reduced-motion` guard (WCAG 2.3.3).**
  `styles.css` already ships reduced-motion blocks; `cart.css` animates (bag drawer, toasts, overlay) with none. Fix: append a standard universal reduced-motion block.

### Considered and DEFERRED — do NOT do these
- 404.html skip-link: 404 is styled by an inline `<style>` block (styles.css is not loaded); a focus-reveal skip link cannot be inlined, so it would be either broken or a visible regression. Deferred.
- Heading-level restructuring on collection/story (h1→h4 jumps): fixing requires visual restructure; risk > benefit. Deferred.
- Product `offers`/price schema: product pages deliberately show no hard prices ("on request"); inventing prices in JSON-LD is forbidden. Existing 5x Product + FAQPage + JewelryStore JSON-LD stays untouched.

---

## 2. FILES IN THE PACKAGE

| File | Action |
|---|---|
| `home.html` | REPLACE (F1, F3, F4) |
| `collection.html` | REPLACE (F1) |
| `story.html` | REPLACE (F1) |
| `product-threadbare-ring.html` | REPLACE (F4) |
| `product-tomboy-ring.html` | REPLACE (F4) |
| `product-hammered-hoop.html` | REPLACE (F4) |
| `product-greco-lariat.html` | REPLACE (F4) |
| `product-sweet-nothing.html` | REPLACE (F4) |
| `script.js` | REPLACE (F2) |
| `styles.css` | REPLACE (F3) |
| `cart.css` | REPLACE (F5) |
| `test_p4.js` | ADD (repo root) |
| `ABHUSHAN-P4-PROMPT.md` | ADD (repo root) |
| `PACKAGE-MANIFEST.txt` | ADD (repo root) |

`cart.js`, `sitemap.xml`, `api/*`, all images: NOT in this package — do not touch.

---

## 3. EXACT CHANGES (anchors — all already applied in the shipped files)

1. **F1** (home, collection, story): the tag
   `<input type="search" id="search-input-field" class="search-input-field-tiffany" placeholder="Search for rings, necklaces, collections..." autocomplete="off" />`
   gains ` aria-label="Search jewellery"` before `/>`. One occurrence per file.
2. **F2** (script.js, inside `showToast(msg)`): after `toast.className = 'abhushan-toast';` two lines are added:
   `toast.setAttribute('role', 'status');` and `toast.setAttribute('aria-live', 'polite');`
3. **F3** (home.html): `<main id="maincontent">` is immediately followed by
   `<h1 class="sr-only">Abhushan – Fine Gold Jewellery in Ahmedabad, Gujarat</h1>`.
   (styles.css): `.sr-only` utility appended at end of file.
4. **F4** (6 booking pages): `id="booking-name"` gains `autocomplete="name"`, `id="booking-email"` gains `autocomplete="email"`, `id="booking-phone"` gains `autocomplete="tel"` — attribute inserted directly after the id attribute.
5. **F5** (cart.css): universal `@media (prefers-reduced-motion: reduce)` block appended at end of file.

All other bytes in every file are identical to current live production (P3 state).

---

## 4. OFFLINE GATE

After applying all files, run `node test_p4.js` in the REPO ROOT: it must print `RESULT: PASS 24 / FAIL 0` with zero SKIP lines (SKIP only appears when the test runs inside the un-applied package dir, where cart.js is absent). Then deploy.

---

## 5. LIVE ACCEPTANCE GATES (verify after deploy, report each)

| Gate | Check |
|---|---|
| L01 | SHA256 of all 13 deployed files == `PACKAGE-MANIFEST.txt` |
| L02 | `node test_p4.js` output in report |
| L03 | Live HTML of home/collection/story: exactly 1 `aria-label="Search jewellery"` |
| L04 | Live HTML of the 6 booking pages: 1x `autocomplete="name"`, 1x `"email"`, 1x `"tel"` |
| L05 | Live home: exactly 1 `<h1` total, it is `class="sr-only"` |
| L06 | Live styles.css contains `.sr-only {`; live cart.css contains `prefers-reduced-motion` |
| L07 | Live script.js: booking toast role lines present; 0x `initFooterSubscribe`, 0x `footer-subscribe-form`, 0x `WEB3FORMS` (P3 intact) |
| L08 | P1 posture spot: anonymous GET `/admin.html` -> 401; GET `/api/cloud-post` -> 405 |
| L09 | P2/P3 spot: sitemap 9 URLs all 200; live pages 0x `admin-modal-overlay`, 0x `admin123` |
| L10 | Visual: sr-only h1 and labels are invisible; screenshot home before/after — pixel-identical expected (allow antialiasing noise only) |

**Rate-limit note (P3 is live):** any live POST test against `/api/cloud-post` MUST be honeypot-mode (`{"action":"order","botcheck":"1"}` — writes nothing upstream) and at most 13 requests; your IP may still be inside a 1-hour window from earlier testing. Do NOT test real submissions; zero sheet rows is the acceptance criterion.

---

## 6. COMMIT PLAN (exactly 2 commits)

1. `feat(p4): a11y labels + sr-only h1 + booking autofill on 8 pages` — home.html, collection.html, story.html, 5 product pages
2. `feat(p4): toast status announcements + sr-only utility + cart reduced-motion; add P4 test suite` — script.js, styles.css, cart.css, test_p4.js, ABHUSHAN-P4-PROMPT.md, PACKAGE-MANIFEST.txt

Branch `main`, synced with `origin/main`.

---

## 7. HANDOFF REPORT

Return `P4_HANDOFF_REPORT.md` with: commit hashes, L01-L10 matrix with evidence (status codes, grep counts), test_p4.js output, and a `## Deviations` section (write "none" if empty).
