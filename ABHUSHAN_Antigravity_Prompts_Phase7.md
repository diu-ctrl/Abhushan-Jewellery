# ABHUSHAN — Phase 7 Prompts (Antigravity)
# Chat Panel Mobile-Open Fix + Footer Redesign

> **Context for Antigravity**
> Phase 6 is deployed and working: cloud orders show in the Admin Portal from all
> devices. Do NOT touch `cart.js`, `admin.html`, or anything cloud-related in this phase.
>
> Two new jobs:
> 1. **Chat panel does not open on real phones** (button is visible and tappable, works
>    on desktop). Emulation shows the JS logic is fine — the failure is the classic
>    real-device combo: the mobile panel animates via `bottom: -100% -> 0` (percentage
>    of the viewport, unreliable on iOS Safari's dynamic toolbar) and the tap can
>    double-fire / race the document-level "close on outside click" handler, toggling
>    the panel open-then-instantly-closed. Fix = transform-based slide + toggle guard
>    + stopPropagation. Deterministic on every device.
> 2. **Footer redesign**: remove the "Join the Inner Circle" email column, re-center
>    the remaining three link columns, and move the Instagram icon to a centered row
>    at the bottom of the footer, directly ABOVE the horizontal line (the border-top
>    of `.footer-bottom`).

## Strict scope — you may ONLY edit
- `script.js` (one listener block)
- `styles.css` (append ONE new block at the very end)
- All `*.html` files (footer edit only — same mechanical change in every file that
  contains `footer-subscribe-col`: index, collection, story, privacy, terms,
  accessibility, 404, and all product-*.html pages)

Do NOT touch `cart.js`, `admin.html`, `notify.js`, the chat panel HTML structure, or
the newsletter POPUP (the "Join the Circle" modal that appears while scrolling is a
separate feature and stays).

---

# STEP 1 — `script.js`: bullet-proof chat toggle (mobile open fix)

Find this block inside `injectChatWidget()`:
```js
    if (triggerBtn && panel) {
      triggerBtn.addEventListener('click', () => {
        if (panel.classList.contains('open')) {
          closePanel();
        } else {
          openPanel();
        }
      });
    }
```

Replace with:
```js
    /* PHASE 7 FIX — deterministic chat toggle on mobile:
       1) stopPropagation keeps the opening tap from also hitting the document-level
          "close on outside click" handler (which could instantly re-close the panel),
       2) the 450ms guard ignores ghost/double-fire taps some mobile browsers emit. */
    let lastPanelToggle = 0;
    if (triggerBtn && panel) {
      triggerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const now = Date.now();
        if (now - lastPanelToggle < 450) return;
        lastPanelToggle = now;
        if (panel.classList.contains('open')) {
          closePanel();
        } else {
          openPanel();
        }
      });
    }
```

Leave the `closeBtn`, Escape, and click-outside handlers exactly as they are.

---

# STEP 2 — `styles.css`: iOS-safe slide-up for the mobile chat panel

Append this block at the VERY END of `styles.css` (do not modify existing rules —
this block overrides them by position):

```css
/* ============================================================
   PHASE 7 — CHAT PANEL: transform slide (iOS-safe) + FOOTER REDESIGN
   ============================================================ */

/* 1) Mobile chat panel: slide with transform instead of bottom:%.
      Percent-based `bottom` animation is unreliable on iOS Safari (dynamic
      toolbar changes the viewport mid-animation); transform is GPU-composited
      and deterministic. Closed = pushed fully below the screen. */
@media (max-width: 640px) {
  .chat-widget-panel {
    bottom: 0;
    transform: translateY(105%);
    opacity: 1;
    transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    will-change: transform;
  }
  .chat-widget-panel.open {
    transform: translateY(0);
  }
}

/* 2) Footer — three centered columns (Inner Circle column removed).
      Mirrors the existing responsive ladder (3 / 2 / 1 columns). */
.footer-inner {
  grid-template-columns: repeat(3, 1fr) !important;
  border-bottom: none !important; /* single line stays on .footer-bottom only */
}
@media (max-width: 1024px) {
  .footer-inner { grid-template-columns: 1fr 1fr !important; }
}
@media (max-width: 768px) {
  .footer-inner { grid-template-columns: 1fr !important; }
}

/* 3) Instagram row — centered at the bottom of the footer,
      directly above the .footer-bottom horizontal line */
.footer-socials-row {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 var(--space-xl) var(--space-xl);
}
.footer-socials-row .social-link {
  width: 34px;
  height: 34px;
}
```

---

# STEP 3 — Every `*.html` file: footer edit (repeat in ALL pages)

The footer markup is duplicated in every page. Perform BOTH edits below in EVERY
`.html` file that contains `id="footer-subscribe-col"` (index.html, collection.html,
story.html, privacy.html, terms.html, accessibility.html, 404.html, and all
product-*.html files). The edit is identical everywhere.

### 3a. Delete the Inner Circle column
Locate the block that starts with:
```html
      <div class="footer-col footer-subscribe-col" id="footer-subscribe-col">
```
and DELETE the entire `<div class="footer-col footer-subscribe-col" ...> ... </div>`
element — it contains the `<h4 class="subscribe-title">Join the Inner Circle</h4>`
heading, the `<form class="footer-subscribe-form" id="footer-subscribe-form">`
email form, and the `<div class="footer-socials">` with the Instagram link.

Notes:
- Deleting this form is SAFE: the two JS handlers that reference it are guarded
  (`if (!form) return;` and an empty `querySelectorAll`), so no JS errors will occur.
- Be careful to remove the matching closing `</div>` of this column, nothing else.

### 3b. Insert the centered Instagram row
Immediately AFTER the closing `</div>` of `.footer-inner` (right before the
`<!-- Monogram at bottom center of footer -->` comment), insert:

```html
    <div class="footer-socials-row">
      <div class="footer-socials">
        <a href="https://www.instagram.com/divyraj.creates" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Instagram">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
        </a>
      </div>
    </div>
```

Result in every page:
```
    </div>   <!-- end of .footer-inner (3 columns: Shop / About / Support) -->
    <div class="footer-socials-row"> ... Instagram ... </div>
    <!-- Monogram at bottom center of footer -->
    <div class="footer-bottom" id="footer-bottom"> ... </div>
```

---

# PowerShell 5.1 validation — run ALL of it, in the repo folder

```powershell
$ErrorActionPreference = "Stop"
Set-Location "C:\Users\levol\Desktop\OLD LAPTOP ARCHIEVE\Abhushan"

# 1) JS syntax (no output = pass)
node --check .\script.js

# 2) Chat toggle fix present (MUST print 1)
(Select-String -Path .\script.js -Pattern "PHASE 7 FIX" | Measure-Object).Count

# 3) New CSS block present (MUST print 1)
(Select-String -Path .\styles.css -Pattern "PHASE 7 — CHAT PANEL" | Measure-Object).Count

# 4) Inner Circle column fully removed from EVERY page (MUST print 0)
(Get-ChildItem -Filter *.html | ForEach-Object { Select-String -Path $_.FullName -Pattern "footer-subscribe-col" } | Measure-Object).Count

# 5) Instagram row present in EVERY page:
#    this number MUST be EQUAL to the number printed on the next line
(Get-ChildItem -Filter *.html | ForEach-Object { Select-String -Path $_.FullName -Pattern "footer-socials-row" } | Measure-Object).Count
(Get-ChildItem -Filter *.html | Measure-Object).Count

# 6) Commit (NEVER push — Divyaraj pushes via GitHub Desktop)
& "C:\Users\levol\AppData\Local\GitHubDesktop\app-3.6.4\resources\app\git\cmd\git.exe" add -A
& "C:\Users\levol\AppData\Local\GitHubDesktop\app-3.6.4\resources\app\git\cmd\git.exe" commit -m "Phase 7: mobile chat panel open fix + footer redesign (3 centered columns, Instagram centered above divider)"
```

If check 4 prints anything other than 0, some page still has the Inner Circle column.
If check 5's two numbers differ, at least one page was missed — list them with:
```powershell
Get-ChildItem -Filter *.html | Where-Object { !(Select-String -Path $_.FullName -Pattern "footer-socials-row" -Quiet) }
```

---

# Visual checklist (verify after Vercel deploy)

**Phone (real device — the actual complaint):**
1. Gold chat button tap → panel slides up from the bottom, smooth, fully visible. ✔
2. Tap the button again → panel slides away. Tap outside the panel → it closes. ✔
3. Open panel → "WhatsApp the Studio" opens WhatsApp. Quick replies render. ✔
4. Menu open → close → page sharp (Phase 6 regression check, still fine). ✔

**Footer (all pages — check Home, Collection, one Product page at minimum):**
5. Footer shows exactly THREE link columns (Shop / About / Support), gathered centered
   under the 1000px container. ✔
6. "Join the Inner Circle" heading and the email input are GONE. ✔
7. Instagram icon is centered at the bottom of the footer, sitting directly ABOVE the
   horizontal divider line, above the © row. Tap opens instagram.com/divyraj.creates. ✔
8. No stray double line above the Instagram row. ✔
9. Mobile footer (393px): columns stack 1-per-row (≤768px) or 2-per-row (tablet), and
   the Instagram row is still centered above the line. ✔

# Antigravity Final Report format
```
PHASE 7 REPORT
- Files changed: <list, with number of .html files edited>
- Validation: 1)… 2)=<n> 3)=<n> 4)=<n> 5)=<rows>/<total files>
- Commit hash: <hash>
- Anything skipped: <none or why>
```
