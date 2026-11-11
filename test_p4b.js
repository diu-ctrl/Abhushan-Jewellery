#!/usr/bin/env node
/* ABHUSHAN P4.1 hotfix self-test. Run: node test_p4b.js (repo root) */
const fs = require('fs'), path = require('path');
let pass = 0, fail = 0, skip = 0;
const check = (id, label, ok) => {
  if (ok === 'skip') { skip++; console.log('SKIP ' + id + ' ' + label); }
  else if (ok) { pass++; }
  else { fail++; console.log('FAIL ' + id + ' ' + label); }
};
const rd = f => { try { return fs.readFileSync(path.join(__dirname, f), 'utf8'); } catch (e) { return null; } };
const PAGES = ['product-threadbare-ring.html', 'product-tomboy-ring.html',
  'product-hammered-hoop.html', 'product-greco-lariat.html', 'product-sweet-nothing.html'];
for (const p of PAGES) {
  const h = rd(p) || '';
  const tags = h.match(/<input[^>]*id="search-input-field"[^>]*>/g) || [];
  check('B01', p + ' search labelled + autocomplete=off kept',
    tags.length === 1 && /aria-label="Search jewellery"/.test(tags[0]) && /autocomplete="off"/.test(tags[0]));
  check('B02', p + ' regressions: 1 h1, 3x autocomplete, 5x Product JSON-LD',
    (h.match(/<h1\b/g) || []).length === 1
    && (h.match(/autocomplete="name"/g) || []).length === 1
    && (h.match(/autocomplete="email"/g) || []).length === 1
    && (h.match(/autocomplete="tel"/g) || []).length === 1
    && (h.match(/"@type"\s*:\s*"Product"/g) || []).length === 5
    && (h.match(/admin-modal-overlay/g) || []).length === 0);
}
const home = rd('home.html');
check('B03', 'home search still labelled exactly once',
  home === null ? 'skip' : (home.match(/aria-label="Search jewellery"/g) || []).length === 1);
console.log('RESULT: PASS ' + pass + ' / FAIL ' + fail);
process.exit(fail === 0 ? 0 : 1);
