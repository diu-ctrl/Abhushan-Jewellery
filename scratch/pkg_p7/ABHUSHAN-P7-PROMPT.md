# ABHUSHAN — P7 SPEC (Structure & Semantic Hygiene)

**Executor:** Antigravity
**Production URL:** https://abhushan-by-divyaraj.vercel.app
**Context:** Follow-up to P6. P7 fixes the site's heading outline and removes
verified-dead CSS. Every change is visually inert (verified against computed
styles) and zero-functionality. The heading outline currently skips levels on
EVERY page (W3C WAI flags this as confusing for assistive-tech users): footer
column titles are `<h4>` after `<h2>` sections, product pages open with
`h1 -> h3`, and product-card names are `<p>` so screen-reader users cannot
jump between cards. All swaps keep the existing classes, and every affected
class sets its own font-size, so rendering is byte-for-byte identical.

## Rules
1. Verify SHA256 against `PACKAGE-MANIFEST.txt` first.
2. Run `node test_p7.js` in the repo root BEFORE deploying: RESULT must show
   `FAIL 0` with zero SKIP lines.
3. Apply files exactly as shipped; do NOT hand-edit. cart.js, cart.css and
   script.js are NOT in this package and must not change (test gates H0).
4. No live POSTs needed or allowed.

## Files (repo root)
- styles.css (REPLACE — dead `admin-modal-*` block removed, 12 rules / ~111
  lines; nothing else changes)
- home.html, collection.html, story.html, privacy.html, 5x product-*.html
  (REPLACE — h4->h2 footer/search titles, product-name p->h3, collection JS
  template p->h2, specs h3->h2 on product pages, theme-color meta added)
- 404.html (REPLACE — adds `a.btn:focus-visible` outline + theme-color #110F0C)
- test_p7.js (ADD), ABHUSHAN-P7-PROMPT.md (ADD), PACKAGE-MANIFEST.txt (REPLACE)

## Change details
- P7-1 styles.css: the contiguous `/* Admin passcode modal dialog */` block
  (`.admin-modal-overlay/card/close/title/subtitle/input/submit-btn`, 12
  rules) is dead — zero references in every live HTML page, admin.html
  included, and in script.js/cart.js. Verifier grep 2026-11-12. The following
  `.admin-login-error` rule is KEPT.
- P7-2 footer/search titles h4->h2 (27x `footer-heading`, 16x
  `search-section-title-tiffany`): classes keep all styling (font-size 11px
  etc. set in class; global reset zeroes UA margins), fixes every h2->h4 skip.
- P7-3 product pages: `Specifications` h3->h2 (fixes h1->h3 skip).
- P7-4 product-card names become real headings: home 5x + product pages 3x
  `<p class="product-name">` -> `<h3>`; collection.html inline-JS template
  `'<p class="product-name">'` -> `'<h2 class="product-name">'` (cards sit
  directly under the page h1, hence h2). `.product-name` class pins
  font-size: 16px, so no visual change.
- P7-5 404.html: the 3 action buttons have :hover but no keyboard focus
  indicator on the dark background — `a.btn:focus-visible` outline added.
- P7-6 `<meta name="theme-color">` added to all 9 pages (#FAF8F4 cream for
  public pages, #110F0C charcoal for 404).

## Live gates (report each)
- L01: SHA256 of all manifest files match after copy
- L02: `node test_p7.js` in repo root -> `FAIL 0`, zero SKIP
- L03: live styles.css AND all 9 HTML files byte-identical to package files
- L04: visual parity spot-check (DevTools): footer column heading computed
  font-size still 11px / product card name still 16px serif on home
- L05: keyboard check on live /404.html: Tab reveals gold outline on buttons
- L06: P4 regression: home + 5 product pages still exactly
  1 `aria-label="Search jewellery"` each
- L07: cart.js, cart.css, script.js untouched (compare sha256 vs pre-P7)

## Commit plan (1 commit)
`feat(p7): semantic structure & hygiene (heading outline, dead CSS removal, 404 focus, theme-color)`
