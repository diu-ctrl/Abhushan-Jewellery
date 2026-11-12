#!/usr/bin/env node
/* ABHUSHAN P6 self-test. Run: node test_p6.js (repo root after applying) */
const fs = require('fs'), path = require('path');
let pass = 0, fail = 0, skip = 0;
const check = (id, label, ok) => {
  if (ok === 'skip') { skip++; console.log('SKIP ' + id + ' ' + label); }
  else if (ok) { pass++; }
  else { fail++; console.log('FAIL ' + id + ' ' + label); }
};
const rd = f => { try { return fs.readFileSync(path.join(__dirname, f), 'utf8'); } catch (e) { return null; } };
const js = rd('script.js') || '';
const css = rd('styles.css') || '';
const i6 = js.indexOf('AB-P6-MOTION v1');
const p6 = i6 >= 0 ? js.slice(i6) : '';

check('D01', 'P6 marker present exactly once in script.js', (js.match(/AB-P6-MOTION v1/g) || []).length === 1);
check('D02', 'G-A lazy fade: lazy selector, complete-check, safety timer',
  /img\[loading="lazy"\]/.test(p6) && /img\.complete && img\.naturalWidth > 0/.test(p6) &&
  /setTimeout\(show, 4000\)/.test(p6) && /classList\.add\('lz'\)/.test(p6));
check('D03', 'G-B back-to-top: aria-label, ring math, rAF throttle',
  /aria-label', 'Back to top'/.test(p6) && /2 \* Math\.PI \* 22/.test(p6) &&
  /requestAnimationFrame/.test(p6) && /\{ passive: true \}/.test(p6));
check('D04', 'P6 JS skipped entirely for reduced-motion',
  (p6.match(/prefers-reduced-motion/g) || []).length >= 2 && /if \(!reduce\)/.test(p6));
check('D05', 'P6 CSS: .lz/.lz-in + #ab-btt styles + mobile + RM guard',
  /img\.lz\.lz-in\s*\{[^}]*opacity:\s*1/.test(css) && /#ab-btt\.show/.test(css) &&
  /@media \(max-width: 768px\)[\s\S]*?#ab-btt/.test(css) &&
  (() => { const i = css.indexOf('AB-P6-MOTION v1'); return i >= 0 && /prefers-reduced-motion/.test(css.slice(i)); })());
check('D06', 'cumulative: P5 block still present in styles.css',
  (css.match(/AB-P5-FINISH v1/g) || []).length === 1);
check('D07', 'script.js landmarks intact + braces balanced',
  js.includes('revealObserver') && js.includes('AbhushanCart') && js.includes('cloudPost') &&
  (js.match(/\{/g) || []).length === (js.match(/\}/g) || []).length);

const PAGES = ['home.html','collection.html','story.html','product-threadbare-ring.html',
  'product-tomboy-ring.html','product-hammered-hoop.html','product-greco-lariat.html',
  'product-sweet-nothing.html'];
let pagesOk = true, anyPage = false;
for (const p of PAGES) {
  const h = rd(p);
  if (h === null) continue;
  anyPage = true;
  if (!/src="script\.js"/.test(h)) pagesOk = false;
}
check('D08', 'HTML pages still reference script.js', anyPage ? pagesOk : 'skip');

const cart = rd('cart.js');
check('D09', 'cart.js untouched (offline queue intact)',
  cart === null ? 'skip' : (cart.includes('QUEUE_KEY') && cart.includes("CLOUD_ENDPOINT: '/api/cloud-post'")));
check('D10', 'G-C fix: stray initWishlist() call removed, initApp chain restored',
  !/\n\s*initWishlist\(\);/.test(js) &&
  (js.match(/\(function initWishlist\(\)/g) || []).length === 1 &&
  (js.match(/initVirtualTryOn\(\);/g) || []).length === 1 &&
  (js.match(/initNewsletterPopup\(\);/g) || []).length === 1);
console.log('RESULT: PASS ' + pass + ' / FAIL ' + fail + (skip ? ' / SKIP ' + skip : ''));
process.exit(fail === 0 ? 0 : 1);
