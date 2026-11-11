# ABHUSHAN — P6 SPEC (Motion & Life — lazy fade-in + back-to-top)

**Executor:** Antigravity
**Production URL:** https://abhushan-by-divyaraj.vercel.app
**Context:** Follow-up to P5 (deploy P5 first; this package's styles.css already
contains the P5 block, so applying P6 alone is also safe/idempotent). P6 adds
motion life in two verified gaps: (1) the site has 20 `loading="lazy"` images on
home and 7 on each product page that pop in with no fade; (2) there is no
back-to-top affordance. AND it fixes one real production bug found by the
verifier's live click-testing during recon (G-C, below). Both enhancements are
progressive: classes/elements are added by JS only, so no-JS visitors never see
hidden content. The site's two existing scroll-reveal systems, parallax and the
wishlist manager are NOT touched.

## Rules
1. Verify SHA256 against `PACKAGE-MANIFEST.txt` first.
2. Run `node test_p6.js` in the repo root BEFORE deploying: RESULT must show
   `FAIL 0` with zero SKIP lines.
3. Append-only markers `AB-P6-MOTION v1`; abort if already present.
4. No live POSTs needed or allowed.

## Files (repo root)
- styles.css (REPLACE — P5 block + appended `AB-P6-MOTION v1` CSS)
- script.js (REPLACE — one appended IIFE `AB-P6-MOTION v1` at end of file)
- test_p6.js (ADD), ABHUSHAN-P6-PROMPT.md (ADD), PACKAGE-MANIFEST.txt (REPLACE)

## What the JS IIFE adds
- G-A lazy fade-in: `img[loading="lazy"]` gets `.lz` then `.lz-in` on load;
  `img.complete && naturalWidth > 0` covers cached images; 4s safety timer so
  no image can ever remain hidden; skipped entirely under reduced-motion
- G-B back-to-top: injects `button#ab-btt` (aria-label "Back to top") with an
  SVG gold progress ring, rAF-throttled passive scroll listener, appears after
  ~0.9 viewport heights, smooth-scrolls to top (instant under reduced-motion),
  positioned above the chat bubble (right 26px / bottom 106px, mobile tuned)

## G-C — production bug fix (inside initApp, NOT an append)
Live evidence (verifier, 2026-11-12): every page load throws
`ReferenceError: initWishlist is not defined at initApp (script.js:1706)`.
`initWishlist` is a named function EXPRESSION `(function initWishlist(){...})();`
whose name is not visible outside itself (the wishlist manager self-invokes and
works), so the bare call in `initApp` crashed the chain — `initVirtualTryOn()`
(TRY IT ON) and `initNewsletterPopup()` never ran. Verified live: clicking
TRY IT ON on a product page opens nothing.
Fix: delete the `initWishlist();` line from `initApp` (comment left in place).
Nothing else in the function or file changes.

## Live gates (report each)
- L01: SHA256 of all manifest files match after copy
- L02: `node test_p6.js` in repo root -> `FAIL 0`, zero SKIP
- L03: live script.js AND live styles.css byte-identical to package files
- L04: browser smoke on live home: scrolling past one viewport shows
  `#ab-btt.show`, clicking it returns to top, lazy images end with class
  `lz-in`, and the console shows ZERO errors (in particular NO
  `ReferenceError: initWishlist`)
- L05: P4 regression: home + 5 product pages still exactly
  1 `aria-label="Search jewellery"` each
- L06: G-C proof: on a product page, clicking TRY IT ON now opens the VTO UI
## Commit plan (1 commit)
`feat(p6): motion & life (lazy fade-in, back-to-top ring, initApp crash fix)`

Return `P6_HANDOFF_REPORT.md` with the gate matrix.
