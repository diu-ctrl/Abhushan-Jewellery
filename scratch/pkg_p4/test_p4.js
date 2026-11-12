#!/usr/bin/env node
/* ABHUSHAN P4 - offline self-test. Run: node test_p4.js  (in repo root) */
const fs = require('fs');
const path = require('path');
let pass = 0, fail = 0, skip = 0;
function check(id, label, ok, extra) {
  if (ok === 'skip') { skip++; console.log('SKIP ' + id + ' ' + label + ' (file not in package dir; runs in repo root)'); }
  else if (ok) { pass++; console.log('PASS ' + id + ' ' + label); }
  else { fail++; console.log('FAIL ' + id + ' ' + label + (extra ? ' | ' + extra : '')); }
}
const rd = f => { try { return fs.readFileSync(path.join(__dirname, f), 'utf8'); } catch (e) { return null; } };
const HOMEPAGES = ['home.html', 'collection.html', 'story.html'];
const PRODUCTS = ['product-threadbare-ring.html', 'product-tomboy-ring.html',
  'product-hammered-hoop.html', 'product-greco-lariat.html', 'product-sweet-nothing.html'];
const BOOKING = ['home.html'].concat(PRODUCTS);

/* T01 - F1: search inputs labelled on the 3 pages that have one */
for (const p of HOMEPAGES) {
  const h = rd(p) || '';
  const tags = h.match(/<input[^>]*id="search-input-field"[^>]*>/g) || [];
  check('T01', p + ' search input has aria-label', tags.length === 1 && /aria-label="Search jewellery"/.test(tags[0]));
}

/* T02 - F2: booking toast announces to screen readers */
const sj = rd('script.js') || '';
const i = sj.indexOf("toast.className = 'abhushan-toast';");
const region = i >= 0 ? sj.slice(i, i + 220) : '';
check('T02', 'booking toast sets role=status + aria-live=polite',
  /setAttribute\('role', 'status'\)/.test(region) && /setAttribute\('aria-live', 'polite'\)/.test(region));

/* T03 - F2 regression: cart toasts keep their existing role attributes */
check('T03', 'wl-toast buildToast unchanged (role/aria-live present)',
  /toastEl\.setAttribute\('role', 'status'\)/.test(sj) && /toastEl\.setAttribute\('aria-live', 'polite'\)/.test(sj));
const cj = rd('cart.js');
check('T04', 'bag-toast role/aria-live untouched', cj === null ? 'skip' : /t\.setAttribute\('role','status'\)/.test(cj));

/* T05 - F3: exactly one h1 on home, sr-only */
const home = rd('home.html') || '';
const h1s = home.match(/<h1\b/g) || [];
check('T05', 'home has exactly 1 h1 and it is sr-only',
  h1s.length === 1 && /<h1 class="sr-only">Abhushan /.test(home));

/* T06 - F3: .sr-only utility present in styles.css */
const st = rd('styles.css') || '';
check('T06', 'styles.css defines .sr-only', /\.sr-only \{[^}]*clip: rect\(0, 0, 0, 0\)/.test(st));

/* T07 - F4: booking autofill attributes on all 6 booking pages */
for (const p of BOOKING) {
  const h = rd(p) || '';
  const ok = (h.match(/autocomplete="name"/g) || []).length === 1
          && (h.match(/autocomplete="email"/g) || []).length === 1
          && (h.match(/autocomplete="tel"/g) || []).length === 1;
  check('T07', p + ' booking autocomplete name/email/tel', ok);
}

/* T08 - F5: reduced-motion guard in cart.css */
const cc = rd('cart.css') || '';
check('T08', 'cart.css has prefers-reduced-motion guard', cc.includes('prefers-reduced-motion: reduce'));

/* T09-T12 - P1/P2/P3 regressions */
let modal = 0, leak = 0;
for (const p of ['home.html', 'collection.html', 'story.html'].concat(PRODUCTS).concat(['privacy.html'])) {
  const h = rd(p) || '';
  modal += (h.match(/admin-modal-overlay/g) || []).length;
  leak += (h.match(/admin123/g) || []).length;
}
check('T09', 'no admin modal / no leaked passcode anywhere', modal === 0 && leak === 0);
check('T10', 'script.js: order cloud wiring intact, dead subscribe wiring still gone',
  sj.includes("action: 'appointment'") && !/initFooterSubscribe/.test(sj) && !/footer-subscribe-form/.test(sj));
check('T11', 'cart.js order cloud wiring intact', cj === null ? 'skip' : cj.includes("action: 'order'"));

/* honeypot lives on home.html only (live baseline); booking labels: 7 per page */
const honeypotHome = /name="botcheck"[^>]*aria-hidden="true"/.test(home);
let labels = 0;
for (const p of BOOKING) {
  const h = rd(p) || '';
  labels += (h.match(/<label for="booking-/g) || []).length === 7 ? 0 : 1;
}
check('T12', 'home honeypot untouched + 7 booking labels per page', honeypotHome && labels === 0);

/* T13 - product JSON-LD untouched */
let ld = 0;
for (const p of PRODUCTS) {
  const h = rd(p) || '';
  const n = (h.match(/"@type"\s*:\s*"Product"/g) || []).length;
  if (n !== 5 || !h.includes('"@type": "FAQPage"')) ld++;
}
check('T13', 'product pages keep 5x Product + FAQPage JSON-LD', ld === 0);

/* T14 - search behaviour preserved */
for (const p of HOMEPAGES) {
  const h = rd(p) || '';
  const tags = h.match(/<input[^>]*id="search-input-field"[^>]*>/g) || [];
  check('T14', p + ' search keeps autocomplete="off"', tags.length === 1 && /autocomplete="off"/.test(tags[0]));
}

/* T15 - manifest sanity */
const man = rd('PACKAGE-MANIFEST.txt') || '';
check('T15', 'manifest lists 13 files', (man.match(/\n[0-9a-f]{64}/g) || []).length >= 13);

console.log('RESULT: PASS ' + pass + ' / FAIL ' + fail);
process.exit(fail === 0 ? 0 : 1);
