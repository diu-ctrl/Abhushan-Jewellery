# ABHUSHAN — P8 SPEC (Final Hygiene & A11y)

**Executor:** Antigravity
**Production URL:** https://abhushan-by-divyaraj.vercel.app
**Context:** Follow-up to P7. This is the closing phase. Two goals: (1) a
provable dead-CSS purge plus font loading hygiene in styles.css, and (2) four
surgical a11y fixes in HTML. Every removed CSS rule was proven unable to match
ANY element: its class tokens appear nowhere in any shipped HTML/JS file (full
corpus scan) AND nowhere in a runtime DOM inventory of every page and every
JS-driven UI state (chat widget open, VTO modal, newsletter popup, mobile
states). Shared selector lists were rewritten to drop only their dead members
(P5 press-feedback and reduced-motion rules keep all live selectors). Nothing
visual changes: the global `* { margin: 0; padding: 0 }` reset and class-pinned
font sizes are untouched, and no live selector lost a single declaration.

## Rules
1. Verify SHA256 against `PACKAGE-MANIFEST.txt` first.
2. Run `node test_p8.js` in the repo root BEFORE deploying: RESULT must show
   `FAIL 0` with zero SKIP lines.
3. Apply files exactly as shipped; do NOT hand-edit. script.js, cart.js and
   cart.css are NOT in this package and must not change (test gates C01-C03).
4. No live POSTs needed or allowed.

## Files (repo root)
- styles.css (REPLACE — 339 dead rules removed, 18 shared selector lists
  rewritten, 21x `font-display: swap` added; ~52 KB / 26.6% smaller)
- 404.html (REPLACE — adds the site favicon trio with ABSOLUTE URLs)
- collection.html, story.html (REPLACE — `<main id="main-content">` renamed to
  `id="maincontent"` so the existing skip-to-main link actually lands)
- story.html also: Our Story nav link gets `aria-current="page"`
- privacy.html (REPLACE — logo link loses its WRONG `aria-current="page"`
  (the logo goes to index.html, not the current page))
- test_p8.js (ADD), ABHUSHAN-P8-PROMPT.md (ADD), PACKAGE-MANIFEST.txt (REPLACE)

## Change details
- P8-1 404.html: the page never had a favicon link, so the tab shows a blank
  icon. The trio uses absolute paths (`/images/favicon.png`, `/images/favicon.svg`,
  `/favicon.ico`) because Vercel serves 404.html on ARBITRARY not-found paths —
  relative URLs would break at depth. All three URLs verified HTTP 200.
- P8-2 collection.html + story.html: their skip link reads
  `<a href="#maincontent" class="skip-to-main">` but their main element is
  `id="main-content"` (hyphen) — the skip target does not exist, so keyboard
  users tabbing through the header jump nowhere on these two pages. Renamed to
  `id="maincontent"`, matching the other 7 pages. Neither id is referenced by
  any CSS/JS (verified), so the rename is inert.
- P8-3 privacy.html: logo link carried `aria-current="page"` while pointing to
  index.html — false for assistive tech on privacy.html. Removed. story.html:
  Our Story nav link gets `aria-current="page"` (correct current-page marking).
  home/index keep their correct logo aria-current. All other pages correctly
  have none.
- P8-4 styles.css purge: 203 class/id tokens are provably dead (zero hits in
  full corpus: 11 HTML pages + admin.html + script.js + cart.js + cart.css;
  zero hits in runtime DOM inventory; only one JS concatenation exists site-wide,
  `chat-message-bubble ${msg.sender}`, whose prefix is corpus-alive). 339 rules
  removed outright; 18 shared selector lists (P5 :active press-feedback, P5
  reduced-motion guard, hero-bg-img, numeric-heavy UI, etc.) rewritten keeping
  ONLY their live members; 0 orphaned @keyframes (all stay referenced);
  `.admin-login-error` (kept in P7 out of caution) is now removed too — it has
  zero markup/JS consumers anywhere. Core a11y utilities (.sr-only,
  .skip-to-main), P5/P6 features and all live selectors keep every declaration.
- P8-5 all 21 local @font-face rules get `font-display: swap` (they had none,
  i.e. FOIT block period). The Google-Fonts stylesheet already uses
  display=swap; local TTFs were the gap. Final rendering is identical — this
  only removes the invisible-text window during font load.

## Live gates (report each)
- L01: SHA256 of all manifest files match after copy
- L02: `node test_p8.js` in repo root -> `FAIL 0`, zero SKIP
- L03: live styles.css, 404.html, collection.html, story.html, privacy.html
  byte-identical to package files
- L04: visual parity spot-check (DevTools): footer heading still 11px, product
  card name still 16px serif, hero renders, header/nav/bag button unchanged,
  chat widget still opens, VTO button still opens the try-on modal on a
  product page
- L05: keyboard check: Tab on collection.html and story.html now lands the
  skip link and pressing Enter scrolls to main; on privacy.html the logo no
  longer reports aria-current
- L06: 404.html favicon visible in tab (hard reload)
- L07: cart.js, cart.css, script.js untouched (compare sha256 vs pre-P8)
- L08: network tab on any page: font requests still fire and complete (swap
  does not block or cancel them)

## Commit plan (1 commit)
`feat(p8): final hygiene (dead CSS purge, font-display swap, skip-link targets, aria-current, 404 favicon)`
