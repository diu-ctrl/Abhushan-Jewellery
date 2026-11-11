# ABHUSHAN — P3 EXECUTION SPEC (Hardening & Hygiene)

**Executor:** Antigravity
**Production URL:** https://abhushan-by-divyaraj.vercel.app
**Baseline:** P1 (security) + P2 (speed/SEO) verified live by independent audit on 2026-11-11 — 41/42 checks PASS. The single FAIL (audit gate A10) is fixed by this package (F1). Two items deferred from P1 by design are fixed here (F2, F3). One canonical nit from the audit is fixed here (F4).
**Budget:** $0 (no paid services).

---

## 0. RULES (unchanged from P1/P2)

1. Deploy EXACTLY the files in this package. Do not reformat, minify, or "improve" anything else.
2. Every file ships PRE-BUILT. Verify SHA256 against `PACKAGE-MANIFEST.txt` before touching the repo.
3. If live markup differs from the assumptions below, do NOT improvise — record it under `## Deviations` and continue.
4. Secret hygiene: never print `ADMIN_PASS`, `AB_CLOUD_KEY`, or the Basic-Auth header value in commits, logs, or this report.
5. Run `node test_p3.js` offline BEFORE deploying. All checks must PASS.

---

## 1. WHAT THIS PACKAGE FIXES (why)

- **F1 — Dead admin modal on 7 pages (audit A10, security hygiene).**
  `collection.html`, `story.html`, `product-threadbare-ring.html`, `product-tomboy-ring.html`, `product-hammered-hoop.html`, `product-greco-lariat.html`, `product-sweet-nothing.html` still embed the OLD client-side admin login modal. It is dead markup (script.js has no handler since P1), but its placeholder leaks the former passcode:
  `placeholder="Enter Passcode (e.g. admin123)"`.
  The P1 handoff claimed "zero occurrences" but only scanned `/`, `/cart.js`, `/admin.html`. The package pages have the entire `<div class="admin-modal-overlay" id="admin-modal-overlay">...</div>` block removed (982 bytes on collection/story, 850 bytes on product pages — same content, different indentation). Nothing else changes in those files.
- **F2 — Rate limiting on `/api/cloud-post` (deferred from P1).**
  `api/cloud-post.js` v3 adds:
  1. Per-IP fixed-window limit: **12 requests / hour / IP** (in-memory Map on the serverless instance, opportunistic prune > 5000 entries). Counted AFTER the origin gate (foreign-origin 403s don't consume quota), before body read (413s count). Exceeded → **429** + `retry-after` + `x-ratelimit-limit/remaining/reset` headers.
  2. **Server-side honeypot drop**: if body JSON has truthy `botcheck` → `200 {ok:true, dropped:"honeypot"}` WITHOUT forwarding upstream (silent anti-bot; request still counts toward the limit).
  All v2 behaviour preserved: 405 method gate, 403 `bad-origin`, 16KB 413 cap, 400 `bad-action`, client `key` stripped, env key injected, `no-store`.
  HONEST SCOPE (documented in file header): per-instance memory, resets on cold start/redeploy — proportional to this site's traffic; a persistent store would require a paid KV (out of budget).
- **F3 — Dead footer-subscribe wiring (deferred from P1).**
  `script.js` binds submit handlers to `#footer-subscribe-form` (IIFE `initFooterSubscribe`, 912 B) and to the class `.footer-subscribe-form` (the `/* ===== PHASE 3 — WEB3FORMS ===== */` IIFE, 2,878 B) — neither element exists on ANY page. The package removes BOTH blocks. Nothing else changes.
- **F4 — Sitemap home URL vs canonical (audit nit).**
  Live canonical of `/` is `https://abhushan-by-divyaraj.vercel.app` (no trailing slash); the sitemap listed it WITH a slash. Package `sitemap.xml` sets the home `<loc>` without the trailing slash. Other 8 URLs untouched.

---

## 2. FILES IN THE PACKAGE

| File | Action |
|---|---|
| `api/cloud-post.js` | REPLACE existing (v3) |
| `script.js` | REPLACE existing (repo root) |
| `sitemap.xml` | REPLACE existing (repo root) |
| `collection.html` | REPLACE existing (repo root) |
| `story.html` | REPLACE existing (repo root) |
| `product-threadbare-ring.html` | REPLACE existing (repo root) |
| `product-tomboy-ring.html` | REPLACE existing (repo root) |
| `product-hammered-hoop.html` | REPLACE existing (repo root) |
| `product-greco-lariat.html` | REPLACE existing (repo root) |
| `product-sweet-nothing.html` | REPLACE existing (repo root) |
| `test_p3.js` | ADD at repo root (offline self-test; keep in repo) |
| `ABHUSHAN-P3-PROMPT.md` | this file (keep in repo, do not deploy as page) |

Do NOT touch: `middleware.js`, `api/admin-data.js`, `vercel.json`, `index.html`, `home.html`, `admin.html`, `cart.js`, `robots.txt`, `404.html`, `sitemap` entries other than the home `<loc>`, any image.

## 3. EXECUTION STEPS

1. `sha256sum` every package file vs `PACKAGE-MANIFEST.txt` — all must match (L01).
2. `node test_p3.js` — must print `RESULT: PASS 27 / FAIL 0` (L02).
3. Copy the 12 files into the repo root per §2 (3 ADD/REPLACE at root, 7 page replaces, 1 add `test_p3.js`).
4. Sanity: `git diff --stat` — expect deletions ≈ 982 B on collection/story, ≈ 850 B on each product page, ≈ 3.8 KB on script.js, small change in sitemap.xml, and NO unexpected hunks. Confirm no other files changed: `git status --porcelain` shows exactly the 12 package files.
5. Commit 1: pages + sitemap
   `fix(p3): remove dead admin modal (leaked passcode placeholder) from 7 pages; align sitemap home canonical`
   Files: 7 pages + `sitemap.xml`.
6. Commit 2: API + JS
   `feat(p3): cloud-post per-IP rate limit + server-side honeypot drop; drop dead footer-subscribe wiring`
   Files: `api/cloud-post.js`, `script.js`, `test_p3.js`, `ABHUSHAN-P3-PROMPT.md`.
7. Push to `origin/main` → production deploy. Wait for "Ready".
8. Run the LIVE ACCEPTANCE GATES below (in order) and record actual values.

## 4. LIVE ACCEPTANCE GATES

| Gate | Requirement | PASS condition |
|---|---|---|
| **L01** | Package integrity | All SHA256 match manifest |
| **L02** | `node test_p3.js` | PASS 27 / FAIL 0 |
| **L03** | Secret scan, ALL 9 pages + `/404.html` | 0 occurrences of `admin123`, `abhushan2026`, `AbhushanStudio_2026`, `script.google.com` — scan EVERY page, not just 3 URLs (this is what audit A10 caught in P1) |
| **L04** | Modal remnant scan, ALL 9 pages | 0 occurrences of `admin-modal-overlay` |
| **L05** | Pages intact | All 7 replaced pages → 200; `git diff` shows only the block deletion |
| **L06** | Rate limit live test (run IMMEDIATELY after deploy, same IP, in order): (a) 1 REAL post: `POST /api/cloud-post` with Origin = site, body `{"action":"appointment","name":"AB-P3-TEST-1","phone":"+910000000000","date":"2026-11-11"}` → 200 and a row appears in the Google Sheet; (b) 11 posts with body `{"action":"appointment","botcheck":"1","name":"AB-P3-RATE-TEST"}` → all 200 with `dropped:"honeypot"`, ZERO new sheet rows; (c) 1 more such post (request #13 overall) → 429 with `retry-after` header | (a) 200 + row, (b) 11 × 200 dropped, (c) 429 |
| **L07** | Rate limit headers | Every cloud-post response carries `x-ratelimit-limit: 12` |
| **L08** | P1 posture preserved | `/admin.html` anon → 401; evil origin POST → 403; >16KB body → 413; GET → 405; security headers on `/` unchanged |
| **L09** | Sitemap live | 9 URLs, home loc == canonical of `/` exactly; all 9 → 200 |
| **L10** | P2 spot-checks | `/collection.html` + any product page: 1 canonical == og:url == twitter:url; og:image → 200 |
| **L11** | Git hygiene | Exactly 2 commits as in §3; `live == main` |
| **L12** | No visual change | The modal was hidden and the footer form never rendered — no UI change anywhere |

Note for L06: after the test your IP stays limited for up to 1 hour (or until the next deploy resets the instance). Do real checkout testing AFTER the 1-hour window or from another IP. The `AB-P3-TEST-1` row is the ONLY row this phase may add — tell the owner to delete it.

## 5. OWNER STEPS (after deploy)

1. Delete the `AB-P3-TEST-1` row from the Google Sheet.
2. Nothing else — no GSC/sitemap resubmission needed (same URL set).

## 6. HANDOFF NOTE (report back)

Deployment ID, the two commit hashes, L06 transcript (statuses + headers), L03/L04 scan output (page → count), Deviations.

— END OF P3 EXECUTION SPEC —
