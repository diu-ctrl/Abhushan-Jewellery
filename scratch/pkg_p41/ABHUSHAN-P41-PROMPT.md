# ABHUSHAN — P4.1 HOTFIX SPEC (search labels on product pages)

**Executor:** Antigravity
**Production URL:** https://abhushan-by-divyaraj.vercel.app
**Context:** Independent P4 audit (2026-11-12) found the 5 product pages still carry an unlabelled `id="search-input-field"` (the P4 package scoped F1 to home/collection/story only — verifier recon gap, not an executor error). This hotfix applies the identical P4 F1 change to the remaining 5 pages. Nothing else changes.

## Rules
1. Deploy EXACTLY these files. Verify SHA256 against `PACKAGE-MANIFEST.txt` first.
2. Run `node test_p4b.js` in the repo root BEFORE deploying: must print `RESULT: PASS 11 / FAIL 0` with zero SKIP lines (a SKIP on B03 only appears if run inside the un-applied package dir).
3. Secret hygiene and rate-limit rules as in P4 (no live POSTs needed; none expected).

## Files (all REPLACE, repo root)
- product-threadbare-ring.html
- product-tomboy-ring.html
- product-hammered-hoop.html
- product-greco-lariat.html
- product-sweet-nothing.html
- test_p4b.js (ADD), ABHUSHAN-P41-PROMPT.md (ADD), PACKAGE-MANIFEST.txt (REPLACE, repo root copy)

## The only change per file
`<input type="search" id="search-input-field" class="search-input-field-tiffany" placeholder="Search for rings, necklaces, collections..." autocomplete="off" />`
gains ` aria-label="Search jewellery"` before `/>` (one occurrence per file).

## Live gates (report each)
- L01: SHA256 8/8 match manifest
- L02: test_p4b.js PASS 11 / FAIL 0
- L03: live HTML of the 5 pages: exactly 1 `aria-label="Search jewellery"` each
- L04: live home.html unchanged: exactly 1 `aria-label="Search jewellery"`

## Commit plan (1 commit)
`fix(p4.1): aria-label on product-page search inputs (P4 audit follow-up)`

Return `P4.1_HANDOFF_REPORT.md` with the gate matrix.
