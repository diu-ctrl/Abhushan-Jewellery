#!/usr/bin/env node
/* ABHUSHAN PKG7 offline verification — run `node test_p7.js` in repo root.
   PASS/FAIL only; any FAIL aborts the deploy. */
const fs = require('fs');
let pass = 0, fail = 0;
function gate(name, ok, detail) {
  if (ok) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (detail ? ' — ' + detail : '')); }
}
const rd = f => { try { return fs.readFileSync(f, 'utf8'); } catch (e) { return null; } };
const PAGES = ['home.html','collection.html','story.html','privacy.html',
  'product-threadbare-ring.html','product-tomboy-ring.html',
  'product-hammered-hoop.html','product-greco-lariat.html','product-sweet-nothing.html'];
const PRODUCTS = PAGES.filter(p => p.startsWith('product-'));

// A. styles.css
const css = rd('styles.css') || '';
gate('A01 admin-modal CSS fully removed', !css.includes('admin-modal'));
gate('A02 css braces balanced', (css.match(/{/g)||[]).length === (css.match(/}/g)||[]).length);
gate('A03 P5/P6 markers intact x1 each',
  (css.match(/AB-P5-FINISH v1/g)||[]).length === 1 &&
  (css.match(/AB-P6-MOTION v1/g)||[]).length === 1);
gate('A04 neighbours intact (.admin-login-error kept, submit-btn hover kept)',
  css.includes('.admin-login-error {') && css.includes('.btn-booking-submit:hover'));
gate('A05 expected css size (chars)', Math.abs(css.length - 196765) <= 2, 'got ' + css.length);

// B/C. heading structure per page
let outlineOk = true, outlineMsg = [];
for (const p of PAGES.concat(['404.html'])) {
  const h = rd(p);
  if (h === null) { outlineOk = false; outlineMsg.push(p + ': missing'); continue; }
  const lvls = [...h.matchAll(/<h([1-6])\b/gi)].map(m => +m[1]);
  const skips = [];
  for (let i = 1; i < lvls.length; i++) if (lvls[i] - lvls[i-1] > 1) skips.push(lvls[i-1] + '->' + lvls[i]);
  const h1 = lvls.filter(l => l === 1).length;
  if (skips.length || h1 !== 1 || /<h4/i.test(h)) {
    outlineOk = false;
    outlineMsg.push(p + ' skips=' + JSON.stringify(skips) + ' h1=' + h1 + ' h4left=' + /<h4/i.test(h));
  }
}
gate('B01 every page: no heading skips, 1x h1, zero <h4> left', outlineOk, outlineMsg.join(' | '));

let h2countOk = true, h2msg = [];
const EXP = { 'home.html':[3,2], 'collection.html':[3,2], 'story.html':[3,2],
  'privacy.html':[3,0], 'product-threadbare-ring.html':[3,2],
  'product-tomboy-ring.html':[3,2], 'product-hammered-hoop.html':[3,2],
  'product-greco-lariat.html':[3,2], 'product-sweet-nothing.html':[3,2] };
for (const p of PAGES) {
  const h = rd(p) || '';
  const f = (h.match(/<h2 class="footer-heading">/g)||[]).length;
  const s = (h.match(/<h2 class="search-section-title-tiffany">/g)||[]).length;
  if (f !== EXP[p][0] || s !== EXP[p][1]) { h2countOk = false; h2msg.push(p + ' footer=' + f + ' search=' + s); }
}
gate('B02 footer/search h2 counts exact (27 + 16 site-wide)', h2countOk, h2msg.join(' | '));

// D. specs title
let specOk = true;
for (const p of PRODUCTS) {
  const h = rd(p) || '';
  if ((h.match(/<h2 class="specs-title-tiffany">Specifications<\/h2>/g)||[]).length !== 1
    || h.includes('<h3 class="specs-title-tiffany"')) specOk = false;
}
gate('C01 product pages: specs title is h2 (x5)', specOk);

// E. product-name semantics
const home = rd('home.html') || '';
gate('E01 home: 5x <h3 class="product-name">, 0x <p>',
  (home.match(/<h3 class="product-name">/g)||[]).length === 5 && !home.includes('<p class="product-name">'));
let cardOk = true;
for (const p of PRODUCTS) {
  const h = rd(p) || '';
  if ((h.match(/<h3 class="product-name">/g)||[]).length !== 3 || h.includes('<p class="product-name">')) cardOk = false;
}
gate('E02 product pages: 3x <h3 class="product-name"> each', cardOk);
const coll = rd('collection.html') || '';
gate('E03 collection: JS template now <h2 class="product-name">',
  coll.includes("'<h2 class=\"product-name\">' + p.name + '</h2>'") &&
  !coll.includes("'<p class=\"product-name\">'"));

// F. 404 page
const p404 = rd('404.html') || '';
gate('F01 404: a.btn:focus-visible outline present', /a\.btn:focus-visible\s*{[^}]*outline:/.test(p404));
gate('F02 404: theme-color #110F0C + noindex intact',
  p404.includes('<meta name="theme-color" content="#110F0C" />') && p404.includes('noindex, follow'));
gate('F03 404: single h1 + whatsapp rel=noopener intact',
  (p404.match(/<h1\b/gi)||[]).length === 1 && p404.includes('rel="noopener"'));

// G. theme-color on public pages
let tcOk = true;
for (const p of PAGES) {
  const h = rd(p) || '';
  if (!h.includes('<meta name="theme-color" content="#FAF8F4" />')) tcOk = false;
}
gate('G01 theme-color #FAF8F4 on all 9 public pages... (8 pages)', tcOk);

// H. untouched files byte-identical to P6 state
const EXP_HASH = {
  "script.js": "8cf9888b332fcf69dd29a75ba3dd6f0c0732cad55a833a73b780bd354809b74a",
  "cart.js": "1a8cf4c53b85fe48080d8610c433904231014e47b6fb7d4fd1fd112d20fa8dfb",
  "cart.css": "9aaae2536491132a84aace233680f5946bdbea03f853e78501b8f16c7a7333ac"
};
const crypto = require('crypto');
for (const [f, want] of Object.entries(EXP_HASH)) {
  const b = fs.readFileSync(f);
  const got = crypto.createHash('sha256').update(b).digest('hex');
  gate('H0 ' + f + ' untouched', got === want, got.slice(0,12));
}

// I. P4/P4.1 cumulative regressions (privacy.html has NO search widget by design)
const SEARCH_PAGES = ['home.html','collection.html','story.html',
  'product-threadbare-ring.html','product-tomboy-ring.html',
  'product-hammered-hoop.html','product-greco-lariat.html','product-sweet-nothing.html'];
let sOk = true;
for (const p of SEARCH_PAGES) {
  const h = rd(p) || '';
  const lbl = (h.match(/aria-label="Search jewellery"/g)||[]).length;
  const h1n = (h.match(/<h1\b/gi)||[]).length;
  if (lbl !== 1 || h1n !== 1 || !h.includes('autocomplete="off"')) sOk = false;
}
gate('I01 search label x1 + autocomplete + 1x h1 (8 search pages)', sOk);
let jsonOk = true;
for (const p of PRODUCTS) {
  const h = rd(p) || '';
  if (!(h.includes('"Product"') && h.includes('FAQPage') && h.includes('JewelryStore'))) jsonOk = false;
}
gate('I02 JSON-LD triple intact on product pages', jsonOk);
const sj = rd('script.js') || '';
gate('I03 script.js still has P6 block', (sj.match(/AB-P6-MOTION v1/g)||[]).length === 1);
gate('I04 script.js cloud posture unchanged (proxy endpoint + queue live in cart.js)',
  sj.includes("window.AbhushanCart && window.AbhushanCart.cloudPost"));

console.log('RESULT: PASS ' + pass + ' / FAIL ' + fail);
process.exit(fail ? 1 : 0);
