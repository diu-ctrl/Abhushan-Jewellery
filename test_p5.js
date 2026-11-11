#!/usr/bin/env node
/* ABHUSHAN P5 self-test. Run: node test_p5.js (repo root after applying) */
const fs = require('fs'), path = require('path');
let pass = 0, fail = 0, skip = 0;
const check = (id, label, ok) => {
  if (ok === 'skip') { skip++; console.log('SKIP ' + id + ' ' + label); }
  else if (ok) { pass++; }
  else { fail++; console.log('FAIL ' + id + ' ' + label); }
};
const rd = f => { try { return fs.readFileSync(path.join(__dirname, f), 'utf8'); } catch (e) { return null; } };
const css = rd('styles.css') || '';
const i5 = css.indexOf('AB-P5-FINISH v1');
const p5 = i5 >= 0 ? css.slice(i5) : '';

check('C01', 'P5 marker present exactly once', (css.match(/AB-P5-FINISH v1/g) || []).length === 1);
check('C02', 'P5-1 ::selection gold wash', /::selection\s*\{[^}]*rgba\(192,\s*139,\s*93,\s*0\.30\)/.test(p5));
check('C03', 'P5-2 focus-visible ring + footer-subscribe fix',
  /:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--color-gold\)/.test(p5) &&
  /\.footer-subscribe-form input:focus-visible/.test(p5));
check('C04', 'P5-3 press feedback (scale 0.98) on 8 button selectors',
  /scale\(0\.98\)/.test(p5) && (p5.match(/:active,/g) || []).length >= 7 && /:active\s*\{/.test(p5));
check('C05', 'P5-4 sheen ::after on primary CTAs',
  /\.btn-add-to-bag-tiffany::after/.test(p5) && /\.btn-booking-submit::after/.test(p5) &&
  /linear-gradient\(105deg/.test(p5) && /pointer-events:\s*none/.test(p5));
check('C06', 'P5-5 heart pop keyframes + active animation',
  /@keyframes ab-heart-pop/.test(p5) && /\.wishlist-heart\.active\s*\{[^}]*animation:\s*ab-heart-pop/.test(p5));
check('C07', 'P5-6 footer underline slide',
  /\.footer-link:hover[\s\S]*?background-size:\s*100% 1px/.test(p5) &&
  /\.footer-legal-links a:hover/.test(p5));
check('C08', 'P5-7 reduced-motion guard inside P5 block',
  /prefers-reduced-motion/.test(p5) && /display:\s*none/.test(p5) && /animation:\s*none/.test(p5));
check('C09', 'styles.css braces balanced', (css.match(/\{/g) || []).length === (css.match(/\}/g) || []).length);
check('C10', 'regression: pre-existing landmarks intact',
  css.includes(':root') && css.includes('.sr-only') && css.includes('.reveal-on-scroll') &&
  css.includes('.product-card:hover') && css.includes('::-webkit-scrollbar') &&
  css.includes('var(--color-gold): #C08B5D') === false && css.includes('--color-gold:        #C08B5D'));

const PAGES = ['home.html','collection.html','story.html','product-threadbare-ring.html',
  'product-tomboy-ring.html','product-hammered-hoop.html','product-greco-lariat.html',
  'product-sweet-nothing.html'];
let pagesOk = true, anyPage = false;
for (const p of PAGES) {
  const h = rd(p);
  if (h === null) continue;
  anyPage = true;
  if (!/href="styles\.css"/.test(h)) pagesOk = false;
  if ((h.match(/<h1\b/g) || []).length !== 1) pagesOk = false;
}
check('C11', 'HTML pages untouched (styles.css ref + single h1)',
  anyPage ? pagesOk : 'skip');
console.log('RESULT: PASS ' + pass + ' / FAIL ' + fail + (skip ? ' / SKIP ' + skip : ''));
process.exit(fail === 0 ? 0 : 1);
