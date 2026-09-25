# ABHUSHAN — Antigravity Prompts — PHASE 5
## Cross-Device Cloud Orders (Google Sheets) + Full Mobile Responsive Overhaul

> **Read this whole file before writing any code.** Do steps in order. Do not skip verification.

---

## GOAL

Two problems, both confirmed by live-site inspection on 25 Sep 2025:

1. **Admin Portal only shows orders placed on the SAME device.** Root cause: `cart.js` saves orders to `localStorage('abhushan_orders_v1')`, and `admin.html` reads that same key. localStorage is per-browser, per-device — a customer's order can never reach Divyaraj's dashboard. (The yellow banner in the Orders tab even admits this.) Same flaw exists for studio appointments (`localStorage('abhushan_appointments')`).

2. **The mobile view is broken.** Measured on a 393px-wide phone viewport:
   - Every product page renders a **504–511px-wide layout** → Chrome shrink-to-fit zooms the whole page out. Cause: `.reviews-grid-detail-tiffany` forces a 3-column grid (≈495px of content into 361px) and `.products-grid-tiffany` (related products) uses `-24px` side margins under a section padded only `16px` (container = 409px).
   - Because of that blowout, the **bag drawer and the Phase-4 checkout modal get clipped** (close ×, prices, Cancel/Order buttons run off-screen).
   - The **collection page shows ONE giant oval card per screen** — `#collection-grid` has an inline `grid-template-columns: repeat(auto-fill, minmax(260px, 1fr))` that overrides the mobile layout.
   - The admin Orders table (9 columns) has no overflow wrapper → will tear on phones.
   - Minor: hero crops the model's face; "Get Directions / Book Appointment" buttons squeeze side-by-side.

**The fix, in one line each:**
- Orders/appointments get a **free cloud backend: Google Sheets + Google Apps Script Web App** (no server, no npm, works from a static Vercel site with plain `fetch`). Customers' orders are appended to a Google Sheet Divyaraj owns, and the Admin Portal reads the same sheet from any device. Web3Forms email keeps working as backup.
- A **mobile CSS layer** kills the viewport blowout, gives the collection page a 2-column grid, makes the drawer/checkout full-width with a sticky Cancel/Order bar, and makes the admin tables scrollable.

---

## GROUND RULES (STRICT SCOPE)

**ONLY these files may be created/edited:**

| File | Change |
|---|---|
| `cart.js` | Cloud push + offline queue (Part A) |
| `admin.html` | Cloud read/merge for Orders + Appointments, banner text, mobile CSS (Parts A + B) |
| `script.js` | 4-line cloud push inside the existing booking handler (Part A) |
| `styles.css` | Mobile responsive layer appended at END of file (Part B) |
| `collection.html` | Remove one inline style attribute (Part B) |
| `index.html` | Nothing — hero object-position handled in CSS only |
| `cart.css` | Mobile drawer/checkout rules appended at END of file (Part B) |

**NEVER touch:** `notify.js`, Web3Forms key, WhatsApp number, product data, admin password logic, anything about git push (Divyaraj pushes manually via GitHub Desktop).

**Environment facts (from Phases 3–4, still true):**
- PowerShell 5.1 only — no PS7 syntax.
- Git is NOT on PATH. Use the full path:
  `C:\Users\levol\AppData\Local\GitHubDesktop\app-3.6.4\resources\app\git\cmd\git.exe`
- JS must pass `node --check` before commit.
- After every code step, run that step's verification block. If it fails, fix before moving on.

---

# PART A — CLOUD ORDERS (Google Sheets backend)

### How it works (architecture, 30 seconds)

```
Customer device                     Divyaraj
────────────────                    ─────────
Checkout modal → Order ──┬─► Web3Forms email (unchanged, backup)  ─► inbox
                         └─► POST to Apps Script Web App URL       ─► new row in Google Sheet
Admin Portal (any device) ──► GET same Web App URL                ─► reads ALL orders, merges
Offline? Order queues in localStorage and auto-retries on next visit.
```

Why Google Sheets: free forever, no server, no credit card, no SDK — just `fetch()`. Divyaraj gets a real spreadsheet he can open on his phone, AND the portal dashboard reads the same data. (Alternatives like Firebase/Supabase need project setup + keys + rules — overkill here.)

---

## STEP A0 — OWNER SETUP (Divyaraj does this ONCE, ~5 minutes)

> **Antigravity: SKIP this step. It is for the site owner. Start at STEP A1.**
> **Divyaraj: do this BEFORE running Antigravity's commit, because STEP A4's final check needs real values.**

1. Open **https://sheets.new** in a browser (any Google account). Name the spreadsheet: `Abhushan Orders Cloud`.
2. Menu: **Extensions → Apps Script**. Delete any placeholder code in `Code.gs`, then paste the ENTIRE script below.
3. Line 4: replace `PASTE_KEY_HERE` with a secret of your choice, e.g. `AbhushanCloud2026!x` (any random string). **Remember it — you will paste the same value into cart.js and admin.html in STEP A4-final.**

```javascript
/** =============================================================
 *  ABHUSHAN ORDER CLOUD — Google Sheets backend (Phase 5)
 *  Deploy as Web App: Execute as "Me" · Who has access: "Anyone"
 *  ============================================================= */
var ADMIN_KEY = 'PASTE_KEY_HERE'; // must match cart.js CONFIG.CLOUD_KEY and admin.html CLOUD_KEY

function ss_() { return SpreadsheetApp.getActiveSpreadsheet(); }

function sheet_(name, headers) {
  var sh = ss_().getSheetByName(name);
  if (!sh) {
    sh = ss_().insertSheet(name);
    sh.appendRow(headers);
    sh.setFrozenRows(1);
  }
  return sh;
}

var ORDER_HEADERS = ['id','placed_at','status','name','phone','email','address','city','pin','notes','items','subtotal','shipping','total','page'];
var APPT_HEADERS  = ['id','created_at','name','email','phone','date','time','service','notes'];

function doPost(e) {
  var out = { ok: false };
  try {
    var body = JSON.parse(e.postData.contents);
    if (body.key !== ADMIN_KEY) throw new Error('bad key');

    if (body.action === 'order') {
      var o = body.order || {}, c = o.customer || {};
      sheet_('Orders', ORDER_HEADERS).appendRow([
        o.id || '', o.at || new Date().toISOString(), o.status || 'new',
        c.name || '', c.phone || '', c.email || '',
        c.address || '', c.city || '', c.pin || '', c.notes || '',
        (o.items || []).map(function (i) {
          return i.name + (i.size ? ' (Size ' + i.size + ')' : '') + ' — ₹' + i.price;
        }).join(' | '),
        o.subtotal || 0, o.shipping || 0, o.total || 0, o.page || ''
      ]);
      out = { ok: true, saved: o.id };

    } else if (body.action === 'appointment') {
      var a = body.appointment || {};
      sheet_('Appointments', APPT_HEADERS).appendRow([
        a.id || '', a.created_at || a.at || new Date().toISOString(),
        a.name || '', a.email || '', a.phone || '',
        a.date || '', a.time || '', a.service || '', a.notes || ''
      ]);
      out = { ok: true, saved: a.id };

    } else if (body.action === 'status') {
      var sh = sheet_('Orders', ORDER_HEADERS);
      var last = Math.max(sh.getLastRow() - 1, 1);
      var ids = sh.getRange(2, 1, last, 1).getValues();
      for (var r = 0; r < ids.length; r++) {
        if (String(ids[r][0]) === String(body.id)) { sh.getRange(r + 2, 3).setValue(body.status); out = { ok: true }; break; }
      }

    } else if (body.action === 'delete') {
      var sh2 = sheet_('Orders', ORDER_HEADERS);
      var last2 = Math.max(sh2.getLastRow() - 1, 1);
      var ids2 = sh2.getRange(2, 1, last2, 1).getValues();
      for (var r2 = 0; r2 < ids2.length; r2++) {
        if (String(ids2[r2][0]) === String(body.id)) { sh2.deleteRow(r2 + 2); out = { ok: true }; break; }
      }
    }
  } catch (err) {
    out = { ok: false, error: String(err) };
  }
  return ContentService.createTextOutput(JSON.stringify(out))
    .setMimeType(ContentService.MimeType.JSON);
}

function rowsToObjects_(sh, nCols) {
  var last = sh.getLastRow();
  if (last < 2) return [];
  var head = sh.getRange(1, 1, 1, nCols).getValues()[0];
  var vals = sh.getRange(2, 1, last - 1, nCols).getValues();
  return vals.map(function (row) {
    var o = {};
    head.forEach(function (h, i) { o[h] = row[i]; });
    return o;
  }).reverse(); // newest first
}

function doGet(e) {
  var p = (e && e.parameter) || {};
  var out;
  try {
    if (p.key !== ADMIN_KEY) throw new Error('bad key');
    if (p.action === 'orders') {
      out = { ok: true, orders: rowsToObjects_(sheet_('Orders', ORDER_HEADERS), ORDER_HEADERS.length) };
    } else if (p.action === 'appointments') {
      out = { ok: true, appointments: rowsToObjects_(sheet_('Appointments', APPT_HEADERS), APPT_HEADERS.length) };
    } else if (p.action === 'ping') {
      out = { ok: true, service: 'abhushan-cloud', time: new Date().toISOString() };
    } else {
      out = { ok: false, error: 'unknown action' };
    }
  } catch (err) {
    out = { ok: false, error: String(err) };
  }
  return ContentService.createTextOutput(JSON.stringify(out))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4. Save (💾 icon). Then: **Deploy → New deployment → ⚙ Select type → Web app**
   - Description: `abhushan orders`
   - **Execute as: Me**
   - **Who has access: Anyone**  ← must be "Anyone", this is what accepts customer orders
   - Click **Deploy** → **Authorize access** → Advanced → *Go to … (unsafe)* → Allow. (This warning is normal for your own script.)
5. Copy the **Web app URL** (ends in `/exec`). Test it in a browser tab:
   `https://script.google.com/macros/s/….…/exec?action=ping&key=YOUR_KEY`
   → you must see `{"ok":true,"service":"abhushan-cloud",…}`.
6. **STEP A4-final (after Antigravity finishes):** open `cart.js` and `admin.html`, replace the two placeholders in EACH file (`PASTE_YOUR_WEB_APP_URL_HERE` → your /exec URL, `PASTE_YOUR_ADMIN_KEY_HERE` → your key), then commit + push.
7. ⚠ If you EVER edit Code.gs again: **Deploy → Manage deployments → ✏ → Version: New version → Deploy** (edits do nothing until a new version is deployed).

---

## STEP A1 — `cart.js`: send every order to the cloud (with offline queue)

**A1.1 — CONFIG block (top of file).** FIND:

```javascript
  var CONFIG = {
    WHATSAPP_NUMBER: '919979787087', // digits only, no +
    CURRENCY: '₹',
    FREE_SHIP: 10000,
    SHIP_FEE: 199
  };
```

REPLACE WITH:

```javascript
  var CONFIG = {
    WHATSAPP_NUMBER: '919979787087', // digits only, no +
    CURRENCY: '₹',
    FREE_SHIP: 10000,
    SHIP_FEE: 199,
    /* PHASE 5 — cloud order storage (Google Sheets via Apps Script).
       Divyaraj pastes the Web App URL + key here after STEP A0.
       Until then everything works exactly as before (email + local record). */
    CLOUD_ENDPOINT: 'PASTE_YOUR_WEB_APP_URL_HERE',
    CLOUD_KEY: 'PASTE_YOUR_ADMIN_KEY_HERE'
  };
```

**A1.2 — cloud helpers.** FIND the line:

```javascript
  /* ---------- checkout ---------- */
```

INSERT THIS BLOCK **immediately BEFORE** it:

```javascript
  /* ---------- PHASE 5 — cloud sync (Google Sheets via Apps Script) ---------- */
  var QUEUE_KEY = 'abhushan_order_queue_v1';

  function cloudConfigured() {
    return CONFIG.CLOUD_ENDPOINT.indexOf('https://script.google') === 0
      && CONFIG.CLOUD_KEY && CONFIG.CLOUD_KEY.indexOf('PASTE_') !== 0;
  }

  /* text/plain content-type on purpose: a JSON content-type would trigger a
     CORS preflight that Apps Script cannot answer. text/plain = "simple
     request", no preflight, Apps Script parses e.postData.contents fine. */
  function cloudPost(payload) {
    if (!cloudConfigured()) return Promise.reject(new Error('cloud-not-configured'));
    payload.key = CONFIG.CLOUD_KEY;
    return fetch(CONFIG.CLOUD_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    }).then(function (r) { return r.json(); });
  }

  function queuePush(payload) {
    try {
      var q = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
      q.push(payload);
      localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
    } catch (e) {}
  }

  /* retry queued orders (offline at purchase time, or cloud was not
     configured yet). Runs on every page load — fire and forget. */
  function flushQueue() {
    if (!cloudConfigured()) return;
    var q;
    try { q = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); } catch (e) { q = []; }
    if (!q.length) return;
    var i = 0;
    var saveRest = function () { try { localStorage.setItem(QUEUE_KEY, JSON.stringify(q.slice(i))); } catch (e) {} };
    var step = function () {
      if (i >= q.length) { try { localStorage.removeItem(QUEUE_KEY); } catch (e) {} return; }
      cloudPost(q[i]).then(function (res) {
        if (res && res.ok) { i++; step(); } else { saveRest(); }
      }).catch(saveRest);
    };
    step();
  }

  /* ---------- checkout ---------- */
```

**A1.3 — wire into `placeOrder()`.** FIND:

```javascript
    /* 2) email the studio — Web3Forms via notify.js, now WITH full customer details */
```

INSERT THIS BLOCK **immediately BEFORE** it:

```javascript
    /* 1b) PHASE 5 — cloud record so the order shows in the Admin Portal
       on ANY device. On failure it queues and retries on next visit. */
    cloudPost({ action: 'order', order: order }).catch(function () {
      queuePush({ action: 'order', order: order });
    });
```

Then (cosmetic renumber) FIND `/* 3) clear bag, close checkout, show confirmation */` and change to `/* 4) clear bag, close checkout, show confirmation */`.

**A1.4 — flush queue on load + expose helper.** FIND:

```javascript
  load();
  injectHeaderButton();
```

REPLACE WITH:

```javascript
  load();
  injectHeaderButton();
  flushQueue(); // PHASE 5 — retry any orders queued while offline
```

FIND:

```javascript
  window.AbhushanCart = {
    add: add, addByName: addByName, addFromWishlist: addFromWishlist,
    open: openDrawer, close: closeDrawer, count: count, subtotal: subtotal, inr: inr, CONFIG: CONFIG
  };
```

REPLACE WITH:

```javascript
  window.AbhushanCart = {
    add: add, addByName: addByName, addFromWishlist: addFromWishlist,
    open: openDrawer, close: closeDrawer, count: count, subtotal: subtotal, inr: inr, CONFIG: CONFIG,
    cloudPost: cloudPost, cloudConfigured: cloudConfigured // PHASE 5 — reused by script.js
  };
```

**A1.5 — verify:**

```powershell
node --check .\cart.js
```

Expected: no output (valid syntax). If it errors, fix before continuing.

---

## STEP A2 — `admin.html`: Orders tab now reads the CLOUD (all devices) and merges with local

**A2.1 — cloud constants + helpers.** FIND:

```javascript
      /* ===== PHASE 4 — ORDERS TAB ===== */
      const ORDERS_KEY = 'abhushan_orders_v1';
```

REPLACE WITH:

```javascript
      /* ===== PHASE 4 — ORDERS TAB ===== */
      const ORDERS_KEY = 'abhushan_orders_v1';

      /* ===== PHASE 5 — CLOUD ORDERS (Google Sheets) =====
         Must match cart.js CONFIG.CLOUD_ENDPOINT / CLOUD_KEY.
         Divyaraj pastes the real values in STEP A4-final. */
      const CLOUD_ENDPOINT = 'PASTE_YOUR_WEB_APP_URL_HERE';
      const CLOUD_KEY = 'PASTE_YOUR_ADMIN_KEY_HERE';
      const CLOUD_READY = CLOUD_ENDPOINT.indexOf('https://script.google') === 0
        && CLOUD_KEY.indexOf('PASTE_') !== 0;

      /* POST helper — text/plain avoids the CORS preflight Apps Script can't answer */
      function adminCloudPost(payload) {
        if (!CLOUD_READY) return Promise.reject(new Error('cloud-not-configured'));
        payload.key = CLOUD_KEY;
        return fetch(CLOUD_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        }).then(r => r.json()).catch(() => ({}));
      }

      /* GET helper — action 'orders' | 'appointments' */
      function cloudFetch(action) {
        if (!CLOUD_READY) return Promise.resolve([]);
        return fetch(CLOUD_ENDPOINT + '?action=' + action + '&key=' + encodeURIComponent(CLOUD_KEY))
          .then(r => r.json())
          .then(j => (j && j.ok && Array.isArray(j[action])) ? j[action] : [])
          .catch(() => []);
      }

      /* a sheet row → the order shape the portal already renders */
      function normalizeCloudOrder(r) {
        return {
          id: String(r.id || ''),
          at: r.placed_at || '',
          status: r.status || 'new',
          customer: {
            name: r.name || '', phone: String(r.phone || ''), email: r.email || '',
            address: r.address || '', city: r.city || '', pin: String(r.pin || ''),
            notes: r.notes || ''
          },
          items: String(r.items || '').split(' | ').filter(Boolean)
            .map(s => ({ name: s, size: null, price: null })),
          subtotal: Number(r.subtotal) || 0,
          shipping: Number(r.shipping) || 0,
          total: Number(r.total) || 0,
          page: r.page || '',
          source: 'cloud'
        };
      }

      /* merged view: cloud (all devices) + local (offline safety net), dedup by id */
      let currentOrders = [];
      function getMergedOrders() {
        return cloudFetch('orders').then(cloudRows => {
          const byId = {};
          cloudRows.forEach(r => { if (r.id) byId[String(r.id)] = normalizeCloudOrder(r); });
          getOrders().forEach(o => { if (!byId[String(o.id)]) byId[String(o.id)] = o; });
          return Object.values(byId)
            .sort((a, b) => String(b.at || '').localeCompare(String(a.at || '')));
        });
      }
      function refreshOrders() {
        return getMergedOrders().then(list => {
          currentOrders = list;
          try { saveOrders(list); } catch (e) {} /* keep local mirror fresh */
          renderOrders();
          const chip = document.getElementById('cloud-status');
          if (chip) {
            chip.textContent = CLOUD_READY
              ? 'Cloud connected — ' + list.length + ' order(s) from all devices'
              : 'Cloud NOT configured — finish STEP A0 (only this browser\u2019s orders show)';
            chip.className = 'cloud-chip ' + (CLOUD_READY ? 'on' : 'off');
          }
        });
      }
```

**A2.2 — render from the merged list.** FIND (inside `renderOrders()`):

```javascript
      function renderOrders() {
        const all = getOrders();
```

REPLACE WITH:

```javascript
      function renderOrders() {
        const all = currentOrders.length ? currentOrders : getOrders();
```

(The fallback keeps the tab rendering instantly from localStorage while the cloud fetch is in flight.)

**A2.3 — status changes & deletes also update the cloud.** FIND:

```javascript
      ordersBody.addEventListener('change', e => {
        const sel = e.target.closest('select.order-status');
        if (!sel) return;
        const list = getOrders();
        const o = list.find(x => x.id === sel.getAttribute('data-id'));
        if (o) { o.status = sel.value; saveOrders(list); renderOrders(); }
      });
```

REPLACE WITH:

```javascript
      ordersBody.addEventListener('change', e => {
        const sel = e.target.closest('select.order-status');
        if (!sel) return;
        const list = currentOrders.length ? currentOrders.slice() : getOrders();
        const o = list.find(x => x.id === sel.getAttribute('data-id'));
        if (o) {
          o.status = sel.value;
          currentOrders = list;
          saveOrders(list);
          renderOrders();
          adminCloudPost({ action: 'status', id: o.id, status: sel.value }); // PHASE 5 — sync to sheet
        }
      });
```

FIND:

```javascript
      ordersBody.addEventListener('click', e => {
        const btn = e.target.closest('.ord-del');
        if (!btn) return;
        if (!window.confirm('Delete order ' + btn.getAttribute('data-id') + '? This cannot be undone.')) return;
        saveOrders(getOrders().filter(x => x.id !== btn.getAttribute('data-id')));
        renderOrders();
      });
```

REPLACE WITH:

```javascript
      ordersBody.addEventListener('click', e => {
        const btn = e.target.closest('.ord-del');
        if (!btn) return;
        if (!window.confirm('Delete order ' + btn.getAttribute('data-id') + '? This removes it from the cloud sheet and this browser. Cannot be undone.')) return;
        const id = btn.getAttribute('data-id');
        currentOrders = currentOrders.filter(x => x.id !== id);
        saveOrders(currentOrders);
        renderOrders();
        adminCloudPost({ action: 'delete', id: id }); // PHASE 5 — sync to sheet
      });
```

**A2.4 — refresh/search/filter wiring.** FIND:

```javascript
      orderSearch.addEventListener('input', renderOrders);
      orderStatusFilter.addEventListener('change', renderOrders);
      document.getElementById('btn-orders-refresh').addEventListener('click', renderOrders);
```

REPLACE WITH:

```javascript
      orderSearch.addEventListener('input', renderOrders);        /* filters the already-loaded list */
      orderStatusFilter.addEventListener('change', renderOrders); /* filters the already-loaded list */
      document.getElementById('btn-orders-refresh').addEventListener('click', () => refreshOrders()); /* PHASE 5 — re-fetch cloud */
```

FIND (inside `showTab`):

```javascript
        if (isOrders) renderOrders();
```

REPLACE WITH:

```javascript
        if (isOrders) refreshOrders(); // PHASE 5 — cloud fetch every time the tab opens
```

FIND (the Clear Orders handler):

```javascript
      document.getElementById('btn-orders-clear').addEventListener('click', () => {
        if (!window.confirm('This will wipe the local orders database on this browser. Continue?')) return;
        saveOrders([]);
        renderOrders();
      });
```

REPLACE WITH:

```javascript
      document.getElementById('btn-orders-clear').addEventListener('click', () => {
        if (!window.confirm('This clears the LOCAL mirror on this browser only. Cloud records in the Google Sheet are NOT touched. Continue?')) return;
        saveOrders([]);
        currentOrders = [];
        renderOrders();
      });
```

**A2.5 — banner text + cloud status chip.** FIND:

```html
      <div class="orders-banner">
        Orders placed in THIS browser appear here automatically (localStorage). Orders placed on a
        customer's device reach you by EMAIL (Web3Forms) — that email is the master record for those.
        Every order email now contains the customer's name, phone, email, address and notes.
      </div>
```

REPLACE WITH:

```html
      <div class="orders-banner">
        <strong id="cloud-status" class="cloud-chip off">Cloud checking…</strong><br />
        Orders from EVERY customer device now appear here (Google Sheets cloud). Status changes and
        deletes sync back to the sheet. Web3Forms email still arrives as a backup copy of each order.
      </div>
```

**A2.6 — empty-state text.** FIND:

```html
          <p>No orders yet. Place a test order from the website in this browser, or wait for customer order emails.</p>
```

REPLACE WITH:

```html
          <p>No orders yet. Place a test order from ANY device (phone/laptop) — it will appear here within seconds via the cloud. Web3Forms emails continue as backup.</p>
```

**A2.7 — chip CSS.** In the SAME `<style>` block that contains `.orders-banner` (around line 814), FIND:

```css
    #orders-table .ord-del { background: none; border: 1px solid #e3b7b7; color: #A33B2E; border-radius: 4px; cursor: pointer; padding: 4px 8px; font-size: 12px; }
```

INSERT THIS **immediately AFTER** it:

```css
    /* PHASE 5 — cloud status chip */
    .cloud-chip { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 12.5px; font-weight: 600; }
    .cloud-chip.on  { background: #E7F4EA; color: #1E6B3A; border: 1px solid #BFE3CB; }
    .cloud-chip.off { background: #FDECEA; color: #A33B2E; border: 1px solid #F0C9C2; }
```

**A2.8 — verify:** none yet (browser verification happens in STEP A4 after Divyaraj pastes real cloud values).

---

## STEP A3 — `script.js`: studio appointments also go to the cloud

Appointments have the same device-locality bug. The booking handler that saves them is the one containing `appointments.push(newBooking);` (around line 647; the `bookingForm` block at ~1860 only handles floating labels — do NOT touch it).

FIND (inside the booking form submit handler, ~line 649):

```javascript
      appointments.push(newBooking);
      localStorage.setItem('abhushan_appointments', JSON.stringify(appointments));
      if (window.AbhushanNotify) {
        window.AbhushanNotify.send('Studio booking ' + bookingId + ' — ' + service, {
          booking_id: bookingId, name: name, email: email, phone: phone,
          date: date, time: time, service: service, notes: notes
        }, email);
      }
```

REPLACE WITH:

```javascript
      appointments.push(newBooking);
      localStorage.setItem('abhushan_appointments', JSON.stringify(appointments));
      if (window.AbhushanNotify) {
        window.AbhushanNotify.send('Studio booking ' + bookingId + ' — ' + service, {
          booking_id: bookingId, name: name, email: email, phone: phone,
          date: date, time: time, service: service, notes: notes
        }, email);
      }
      /* PHASE 5 — cloud record so the appointment shows in the Admin Portal on ANY device */
      if (window.AbhushanCart && window.AbhushanCart.cloudPost) {
        window.AbhushanCart.cloudPost({ action: 'appointment', appointment: newBooking })
          .catch(function () { /* email (above) remains the backup */ });
      }
```

**Verify:**

```powershell
node --check .\script.js
```

---

## STEP A4 — `admin.html`: Appointments tab reads the cloud too

**A4.1 — merged appointment loading.** FIND:

```javascript
      function loadAppointments() {
        try {
          const raw = localStorage.getItem('abhushan_appointments');
          if (raw) {
            appointments = JSON.parse(raw);
            // Sort by date (descending order, newest first or by date/time order)
            appointments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          } else {
            appointments = [];
          }
        } catch (err) {
          console.error('Error loading appointments:', err);
          appointments = [];
        }
      }
```

REPLACE WITH:

```javascript
      function loadAppointments() {
        try {
          const raw = localStorage.getItem('abhushan_appointments');
          if (raw) {
            appointments = JSON.parse(raw);
            appointments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          } else {
            appointments = [];
          }
        } catch (err) {
          console.error('Error loading appointments:', err);
          appointments = [];
        }
        /* PHASE 5 — merge cloud appointments (all devices), then re-render */
        cloudFetch('appointments').then(cloudRows => {
          const known = new Set(appointments.map(a => String(a.id)));
          const fresh = cloudRows
            .filter(r => r.id && !known.has(String(r.id)))
            .map(r => ({
              id: String(r.id),
              created_at: r.created_at || '',
              name: r.name || '', email: r.email || '', phone: String(r.phone || ''),
              date: r.date || '', time: r.time || '', service: r.service || '',
              notes: r.notes || '',
              status: 'Pending',
              source: 'cloud'
            }));
          if (fresh.length) {
            appointments = appointments.concat(fresh)
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            if (typeof renderDashboard === 'function') renderDashboard();
          }
        });
      }
```

**A4.2 — verify syntax:** `admin.html` has inline JS (node can't check HTML), so verify by brace-balance:

```powershell
$code = Get-Content .\admin.html -Raw
$open = ([regex]::Matches($code, '\{')).Count
$close = ([regex]::Matches($code, '\}')).Count
Write-Output "open=$open close=$close (delta must stay within +/-2 of the pre-edit value)"
```

---

## STEP A4-final — OWNER: paste real cloud values, then test end-to-end

> **Divyaraj** (or tell Antigravity the two values in chat and it will do this for you):

1. `cart.js` → replace `PASTE_YOUR_WEB_APP_URL_HERE` with the `/exec` URL from STEP A0, and `PASTE_YOUR_ADMIN_KEY_HERE` with your key.
2. `admin.html` → replace the SAME two placeholders (they are in the `PHASE 5 — CLOUD ORDERS` block).
3. Commit + push (final step of this file), wait for Vercel to deploy.

**End-to-end test (do all of it):**

| # | Action | Expected |
|---|---|---|
| 1 | Open the site on your PHONE, add a product, Checkout, fill details, Order | Confirmation popup appears |
| 2 | Open the Google Sheet | New row with order id, customer name/phone/address, items, total |
| 3 | Open `admin.html` on your LAPTOP → password → **Orders** tab | SAME order listed; chip says "Cloud connected — N order(s)" |
| 4 | In the portal, set status to **Delivered** | Sheet's `status` column changes |
| 5 | Refresh portal → **Appointments** tab | Studio bookings made on any device appear |
| 6 | Turn phone Wi-Fi OFF, place an order, Wi-Fi ON, open any site page | Order reaches the sheet (queued + retried automatically) |

---

# PART B — MOBILE RESPONSIVE OVERHAUL

### What was measured (evidence — so Antigravity understands WHY)

| Symptom on a 393px phone | Measured cause |
|---|---|
| Whole product page looks zoomed-out/tiny; drawer & checkout clipped | `document.scrollWidth` = **504–511px** instead of 393 → Chrome shrink-to-fit |
| — that blowout, cause 1 | `.reviews-grid-detail-tiffany { grid-template-columns: repeat(3, 1fr) }` has no mobile override → ≈495px of content in a 361px container |
| — that blowout, cause 2 | `.products-grid-tiffany` (related carousel, ≤1024px) uses `margin: 0 calc(-1 * var(--space-xl))` (−24px) while its section is padded `var(--space-md)` (16px) below 992px → 409px-wide container |
| Collection page = one giant oval per screen | `#collection-grid` carries an **inline** `grid-template-columns: repeat(auto-fill, minmax(260px, 1fr))` that beats every stylesheet rule |
| Checkout Cancel/Order off-screen | consequence of the blowout + no mobile rules for `.ck-modal` / `.bag-drawer` |
| Admin Orders table tears on phones | plain 9-column `<table>` with no scroll wrapper |
| Get Directions / Book Appointment squeezed | `.studio-actions-tiffany { display: flex }` never stacks |

---

## STEP B1 — `styles.css`: kill the viewport blowout (PDPs)

**APPEND this entire block at the VERY END of `styles.css`** (later rules win — do not insert it in the middle):

```css
/* ============================================================
   PHASE 5 — MOBILE RESPONSIVE OVERHAUL (appended)
   Fixes measured on a 393px viewport: product pages rendered
   504–511px wide (Chrome shrink-to-fit), collection page showed
   one giant card per screen, drawer/checkout clipped.
   ============================================================ */

/* B1 - global guard: content may never widen the layout viewport.
   overflow-x:hidden is the legacy fallback; clip is the modern one. */
html, body { overflow-x: hidden; overflow-x: clip; }

/* B1a - PDP reviews: 3 columns forced ~495px of content into 361px */
@media (max-width: 992px) {
  .reviews-grid-detail-tiffany { grid-template-columns: 1fr; }
}

/* B1b - related-products carousel on PDPs: its -24px margins exceeded the
   16px section padding below 992px -> 409px container. Scoped to the PDP
   related section so the collection grid is never affected. */
@media (max-width: 992px) {
  .product-related-section-tiffany .products-grid-tiffany {
    margin-left: calc(-1 * var(--space-md));
    margin-right: calc(-1 * var(--space-md));
    padding-left: var(--space-md);
    padding-right: var(--space-md);
  }
  .product-related-section-tiffany .products-grid-tiffany .product-card { flex: 0 0 200px; }
}
```

**Verify (PowerShell 5.1):**

```powershell
Select-String -Path .\styles.css -Pattern "MOBILE RESPONSIVE OVERHAUL" | Measure-Object | ForEach-Object { $_.Count }
```

Expected: `1`. (ASCII-only pattern on purpose — PowerShell 5.1 misreads em-dashes in UTF-8 files without BOM.)

---

## STEP B2 — collection page: two compact cards per row on phones

**B2.1 — `collection.html`:** FIND (one single line, ~line 5195):

```html
      <div id="collection-grid" class="products-grid-tiffany" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 36px 28px;"></div>
```

REPLACE WITH (inline style removed — the stylesheet owns the layout now):

```html
      <div id="collection-grid" class="products-grid-tiffany"></div>
```

**B2.2 — `styles.css`:** APPEND at the very end (after the B1 block):

```css
/* B2 - collection grid: stylesheet-controlled at every width */
#collection-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 36px 28px;
}
@media (max-width: 768px) {
  #collection-grid {
    display: grid !important;                        /* beats any stale inline/flex rule */
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 30px 12px;
  }
  #collection-grid .product-card { flex: none; width: 100%; }
  #collection-grid .product-name { font-size: 14px; margin: 10px 0 0; }
  #collection-grid .product-desc-tiffany { display: none; }  /* keep cards tight */
  #collection-grid .product-price { font-size: 13.5px; margin: 4px 0 0; }
}
```

Note: the oval card shape (`.product-image-wrap { border-radius: 50%; aspect-ratio: 3/4 }`) is the brand look — it stays, just at half width. The empty-category message uses `grid-column: 1 / -1` and keeps working.

---

## STEP B3 — `cart.css`: bag drawer + checkout modal on phones

**APPEND at the very end of `cart.css`:**

```css
/* ===== PHASE 5 — MOBILE: drawer + checkout modal ===== */
@media (max-width: 640px) {
  .bag-drawer {
    width: 100vw;
    padding-bottom: calc(24px + env(safe-area-inset-bottom));
  }
  .ck-overlay { align-items: flex-end; }
  .ck-modal {
    width: 100%;
    max-height: 94dvh;                 /* dvh = correct height under mobile browser chrome */
    border-radius: 14px 14px 0 0;
    padding: 18px 16px 0;              /* bottom padding handled by the sticky footer */
  }
  /* Cancel / Order always visible while the customer scrolls the form */
  .ck-foot {
    position: sticky;
    bottom: 0;
    background: #FFFDFB;
    margin: 4px -16px 0;
    padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
    border-top: 1px solid var(--color-border, #E2DDD8);
  }
  .ck-confirm { padding-bottom: calc(18px + env(safe-area-inset-bottom)); }
  .ck-two { grid-template-columns: 1fr; }  /* City / PIN stack on narrow screens */
  .ck-head h2 { font-size: 20px; }
}
```

(`max-height: 92vh` from the base rule still applies as fallback on old browsers.)

---

## STEP B4 — `admin.html`: tables scroll instead of tearing; stat cards in 2 columns

In `admin.html`'s `<style>` block, FIND the last rule you added in A2.7 (`.cloud-chip.off …`) and INSERT **after** it:

```css
    /* PHASE 5 — mobile: scroll wide tables, 2-col stats */
    .table-container { overflow-x: auto; -webkit-overflow-scrolling: touch; }
    .table-container table { min-width: 720px; }
    @media (max-width: 600px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
      .stat-num { font-size: 26px; }
    }
```

---

## STEP B5 — home page mobile polish (`styles.css`, same appended block)

APPEND at the very end of `styles.css`:

```css
/* B5 - home page polish on phones */
@media (max-width: 480px) {
  .studio-actions-tiffany { flex-direction: column; }
  .studio-actions-tiffany .btn-directions-tiffany,
  .studio-actions-tiffany .btn-book-appointment-tiffany {
    width: 100%;
    text-align: center;
  }
}
@media (max-width: 768px) {
  /* hero: keep the model's face in frame on narrow screens */
  .hero-bg-img, .hero-slide-img { object-position: 70% 20%; }
}
```

*(If the hero `<img>` class differs on some slide, the rule is harmless — object-position only shifts cropping, never layout.)*

**Verify both B-blocks landed:**

```powershell
(Select-String -Path .\styles.css -Pattern "B1 - global guard|B2 - collection grid|B5 - home page polish").Count
```

Expected: `3`.

---

# PART C — FULL VERIFICATION SUITE

Run everything below from the repo root in **PowerShell 5.1**. All must pass before commit.

```powershell
# ---- C1. JS syntax (must print nothing) ----
node --check .\cart.js
node --check .\script.js
node --check .\notify.js

# ---- C2. cloud wiring landed exactly twice (cart.js + admin.html) ----
(Select-String -Path .\cart.js, .\admin.html -Pattern "CLOUD_ENDPOINT").Count          # expect 2
(Select-String -Path .\cart.js, .\admin.html -Pattern "PASTE_YOUR_WEB_APP_URL_HERE").Count  # expect 2 (until Divyaraj pastes)
(Select-String -Path .\cart.js -Pattern "flushQueue\(\); // PHASE 5").Count            # expect 1

# ---- C3. offline queue + simple-request header present ----
(Select-String -Path .\cart.js -Pattern "abhushan_order_queue_v1").Count               # expect >= 1
(Select-String -Path .\cart.js -Pattern "text/plain;charset=utf-8").Count              # expect 1

# ---- C4. admin merge + sync actions present ----
(Select-String -Path .\admin.html -Pattern "getMergedOrders|normalizeCloudOrder|adminCloudPost").Count  # expect >= 3
(Select-String -Path .\admin.html -Pattern "action: 'status'|action: 'delete'").Count  # expect 2

# ---- C5. mobile layer landed ----
(Select-String -Path .\styles.css -Pattern "MOBILE RESPONSIVE OVERHAUL").Count          # expect 1
(Select-String -Path .\cart.css  -Pattern "MOBILE: drawer").Count                        # expect 1
(Select-String -Path .\styles.css -Pattern "reviews-grid-detail-tiffany \{ grid-template-columns: 1fr").Count  # expect 1
(Select-String -Path .\collection.html -Pattern "grid-template-columns: repeat\(auto-fill").Count          # expect 0 (inline style removed)

# ---- C6. nothing forbidden was touched ----
(Select-String -Path .\notify.js -Pattern "10c7b958-4d2a-411b-ab73-fb254ad36c34").Count    # expect 1 (key intact)
(Select-String -Path .\cart.js, .\notify.js -Pattern "919979787087").Count                 # expect >= 1 (WhatsApp intact)
(Select-String -Path .\styles.css -Pattern "lining-nums").Count                            # expect >= 3 (Phase 4 fix intact)

# ---- C7. admin.html brace balance sanity ----
$code = Get-Content .\admin.html -Raw
"braces: " + ([regex]::Matches($code, '\{')).Count + " / " + ([regex]::Matches($code, '\}')).Count
```

**Browser spot-check (local, before push):** open `index.html` in Chrome → DevTools → device toolbar → iPhone 12 Pro → hard-reload each page and confirm: `document.documentElement.scrollWidth === 393` in the console on home, a product page, and collection (no shrink-to-fit zoom).

---

# PART D — VISUAL QA CHECKLIST (Divyaraj, after Vercel deploys)

**Phone (real device, Chrome):**
- [ ] Product page: text size same as home page (NOT zoomed out) — the old bug is dead
- [ ] Product page bottom: related-products row scrolls sideways, nothing sticks out of the screen
- [ ] Product page reviews: single column, no sideways scroll
- [ ] Collection page: **2 cards per row**, oval images, prices readable, page browsable in seconds
- [ ] Bag drawer: full-screen width, × visible, CHECKOUT button fully visible
- [ ] Checkout: invoice + form fit the screen, **Cancel / Order stay pinned at the bottom** while scrolling, City/PIN stacked
- [ ] Order → confirmation popup: order id + summary + WhatsApp button visible
- [ ] Home: hero shows the model's face; Get Directions / Book Appointment stacked full-width
- [ ] Numbers everywhere are normal lining digits (Phase 4 fix still in)

**Laptop (nothing regressed):**
- [ ] Home, collection, product page, story: desktop layout unchanged
- [ ] Bag drawer: still a 420px side drawer (not full-screen)
- [ ] Checkout modal: still a centered 560px dialog
- [ ] Admin portal: orders table unchanged on wide screens

**Cloud (the actual point of Part A):**
- [ ] Order placed on phone → row appears in Google Sheet within seconds
- [ ] Same order visible in `admin.html` Orders tab on laptop, chip reads "Cloud connected"
- [ ] Status change in portal → reflected in the sheet
- [ ] Delete in portal → row removed from the sheet
- [ ] Studio booking from any device → appears in portal Appointments tab

---

# PART E — COMMIT (git: NEVER push)

```powershell
& 'C:\Users\levol\AppData\Local\GitHubDesktop\app-3.6.4\resources\app\git\cmd\git.exe' add -A
& 'C:\Users\levol\AppData\Local\GitHubDesktop\app-3.6.4\resources\app\git\cmd\git.exe' status --short
& 'C:\Users\levol\AppData\Local\GitHubDesktop\app-3.6.4\resources\app\git\cmd\git.exe' commit -m "Phase 5: Google Sheets cloud orders (all devices visible in admin portal) + mobile responsive overhaul"
```

**DO NOT run `git push`.** Divyaraj reviews and pushes via GitHub Desktop; Vercel deploys automatically.

Expected changed files: `cart.js`, `cart.css`, `admin.html`, `script.js`, `styles.css`, `collection.html` (6 files, nothing else).

---

# FINAL REPORT (Antigravity replies in exactly this shape)

```
PHASE 5 REPORT
Steps completed: A1, A2, A3, A4, B1, B2, B3, B4, B5, C (all verifications)
Verification results:
  - node --check cart.js: PASS
  - node --check script.js: PASS
  - node --check notify.js: PASS
  - C2 cloud wiring count (expect 2): <actual>
  - C4 admin sync count (expect >=3): <actual>
  - C5 styles.css mobile layer (expect 1): <actual>
  - C5 cart.css mobile layer (expect 1): <actual>
  - C5 collection inline-style removed (expect 0): <actual>
  - C6 Web3Forms key intact (expect 1): <actual>
  - C6 lining-nums intact (expect >=3): <actual>
  - admin.html brace balance: open=<n> close=<n>
Files changed: <list>
Deviations from the plan (with reason): <none / details>
Notes for Divyaraj: <anything he must do — e.g. paste CLOUD values from STEP A0 into cart.js + admin.html before pushing>
```

---

## QUICK OWNER REMINDER (Divyaraj — after Antigravity finishes)

1. Do **STEP A0** (Google Sheet + Apps Script + deploy → get `/exec` URL + your key).
2. Paste both values into `cart.js` **and** `admin.html` (each has `PASTE_YOUR_WEB_APP_URL_HERE` / `PASTE_YOUR_ADMIN_KEY_HERE`). Or tell Antigravity the values and it pastes them.
3. Push via GitHub Desktop → Vercel deploys → run the **PART D** checklists.
4. From now on: every customer order lands in your Google Sheet AND your admin portal — from any device, automatically.

