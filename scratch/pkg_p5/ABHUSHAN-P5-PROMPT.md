# ABHUSHAN — P5 SPEC (Material & Finish — pure-CSS visual polish)

**Executor:** Antigravity
**Production URL:** https://abhushan-by-divyaraj.vercel.app
**Context:** P1-P4.1 delivered security/a11y/perf; the visual layer has not been
touched since launch. P5 is the first visual-refinement phase, scoped by the
verifier from live recon (screenshots + CSS inventory) + 2026 micro-interaction
best practice (transform/opacity only, 0.3-0.7s, reduced-motion respected).
Everything appends one marked block to styles.css. No HTML, no JS, no layout
changes. Existing systems (two scroll-reveal stacks, card hover zoom, scrollbar
styling, size-chip hovers) already exist and are NOT touched.

## Rules
1. Verify SHA256 of all files against `PACKAGE-MANIFEST.txt` before applying.
2. Run `node test_p5.js` in the repo root BEFORE deploying: the RESULT line must
   show `FAIL 0` with zero SKIP lines (SKIPs only appear inside the package dir
   where HTML files are absent).
3. Append-only: if styles.css already contains `AB-P5-FINISH v1`, STOP (double apply).
4. No live POSTs needed or allowed (rate-limit hygiene).

## Files (repo root)
- styles.css (REPLACE — base + one appended block `AB-P5-FINISH v1`)
- test_p5.js (ADD), ABHUSHAN-P5-PROMPT.md (ADD), PACKAGE-MANIFEST.txt (REPLACE)

## What the block adds
- P5-1 `::selection` antique-gold wash (rgba(192,139,93,0.30))
- P5-2 unified `:focus-visible` gold ring + fix for footer-subscribe input
  (its old rule sets `outline: none !important` on focus — keyboard users
  currently get no indicator there)
- P5-3 button hover elevation (translateY(-1px) + gold/charcoal shadow) and
  press feedback (`:active` scale(0.98), 0.08s) on the 8 existing button classes
- P5-4 gold sheen sweep on `.btn-add-to-bag-tiffany` and `.btn-booking-submit`
  (pseudo-element, pointer-events:none, overflow:hidden on the button)
- P5-5 wishlist heart pop (`@keyframes ab-heart-pop` on `.wishlist-heart.active`)
- P5-6 footer link underline slide (background-size 0% -> 100%)
- P5-7 `prefers-reduced-motion` guard disabling every motion added above

## Live gates (report each)
- L01: SHA256 of all manifest files match after copy
- L02: `node test_p5.js` in repo root -> `FAIL 0`, zero SKIP
- L03: live styles.css byte-identical to package styles.css (sha256)
- L04: live home.html unchanged (still exactly 1 `aria-label="Search jewellery"`,
  1 sr-only h1) — P4 regression check

## Commit plan (1 commit)
`feat(p5): material & finish polish (selection, focus ring, buttons, footer underline)`

Return `P5_HANDOFF_REPORT.md` with the gate matrix.
