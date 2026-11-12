#!/usr/bin/env node
/* ABHUSHAN P7->P8 offline package test. Run in repo root.
   RESULT: PASS n / FAIL n — every line must be PASS or SKIP (no FAIL). */
const fs = require('fs'), crypto = require('crypto');
const sha = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
let pass = 0, fail = 0;
const t = (name, ok) => { console.log((ok ? 'PASS ' : 'FAIL ') + name); ok ? pass++ : fail++; };
const skip = name => { console.log('SKIP ' + name); };
const rd = f => { try { return fs.readFileSync(f, 'utf8'); } catch (e) { return null; } };

const css = rd('styles.css');
const pages = ['home.html','index.html','collection.html','story.html','privacy.html','404.html',
  'product-threadbare-ring.html','product-tomboy-ring.html','product-hammered-hoop.html',
  'product-greco-lariat.html','product-sweet-nothing.html'].filter(f => rd(f));

/* ---- A. styles.css purge + font-display ---- */
if (css === null) { skip('A* (styles.css absent)'); }
else {
  const DEAD = ["admin-login-error", "arch-col", "arch-image-wrap", "arch-link", "banner-bg-img", "banner-content", "banner-overlay", "booking-eyebrow", "brand-value", "brand-values-inner", "brand-values-section", "btn-404-link-tiffany", "btn-404-primary-tiffany", "btn-404-secondary-tiffany", "btn-beige", "btn-dark", "btn-light", "btn-outline", "btn-price", "btn-primary", "btn-story-link-tiffany", "btn-token", "carousel-arrow", "carousel-track", "carousel-track-outer", "carousel-wrapper", "cart-btn", "cart-count", "cat-grid-image", "cat-grid-label", "cat-grid-placeholder", "cat-link", "category-grid-section", "category-links-inner", "category-links-section", "chat-quick-links-list", "chat-quick-links-title", "chat-textarea", "chat-widget-submit-btn", "core-values-inner", "core-values-section", "customer-reviews-section", "editorial-body", "editorial-eyebrow", "editorial-full-banner", "editorial-full-image", "editorial-full-overlay", "editorial-heading", "editorial-placeholder", "editorial-placeholder-icon", "editorial-placeholder-label", "error-404-buttons", "error-404-content", "error-404-decoration", "error-404-headline", "error-404-main", "error-404-number", "error-404-subtext", "error-404-teaser", "error-actions-404-tiffany", "error-code-404-tiffany", "error-decor-404-tiffany", "error-desc-404-tiffany", "error-teaser-tiffany", "error-title-404-tiffany", "footer-brand-col", "footer-logo", "footer-subscribe-col", "footer-subscribe-form", "footer-tagline", "hero-brand-name", "hero-brand-separator", "hero-brand-subtitle", "hero-brand-subtitle-tiffany", "hero-brand-tagline", "hero-brand-title", "hero-brand-title-tiffany", "hero-content-tiffany", "hero-eyebrow", "hero-link-tiffany", "hero-oval-detail", "hero-placeholder-icon", "hero-placeholder-label", "hero-slide-img", "hero-slides-wrapper", "hero-sub", "hero-title", "hero-title-tiffany", "kitten-illustration", "layering-cta", "luxury-toast", "mobile-nav-toggle", "nav-center", "nav-icon-btn", "nav-left", "nav-link-account", "newsletter-btn", "newsletter-disclaimer", "newsletter-form", "newsletter-heading", "newsletter-inner", "newsletter-input", "newsletter-section", "newsletter-sub", "price-buttons-grid", "price-section-title", "prod-tag", "product-badge", "product-placeholder", "product-tag-detail-tiffany", "quick-view", "quick-view-overlay-btn", "review-author", "review-cursive-title", "review-stars", "review-text", "reviews-inner", "search-close", "search-form", "search-submit", "search-suggestions-label", "search-tag", "search-tags", "section-404-tiffany", "section-booking-tiffany", "section-featured-collection", "section-header-row", "section-padded", "section-padded-bottom", "section-story-tiffany", "see-all-link", "shop-by-price-section", "site-header--over-hero", "slider-dots", "split-editorial-reverse", "split-image-col", "split-placeholder", "split-placeholder-icon", "split-placeholder-label", "split-story-desc-tiffany", "split-story-link-tiffany", "split-story-title-tiffany", "split-text-col-tiffany", "story-body-tiffany", "story-container-tiffany", "story-eyebrow-tiffany", "story-image-col", "story-image-col-tiffany", "story-image-wrap", "story-img-tiffany", "story-inner", "story-placeholder", "story-placeholder-icon", "story-placeholder-label", "story-section", "story-signature-tiffany", "story-text-col-tiffany", "story-title-tiffany", "story-value-label", "story-value-num", "story-values", "studio-eyebrow-tiffany", "subscribe-title", "teaser-title-tiffany", "ticker-content", "ticker-inner", "ticker-strip", "twin-arch-grid", "twin-arch-section", "value-block", "value-icon", "value-text", "value-title", "visit-col", "visit-grid", "visit-image-wrap", "visit-link", "visit-section-title", "visit-title", "visit-us-section", "vto-btn-primary-tiffany", "vto-btn-secondary-tiffany", "vto-controls-panel-tiffany", "vto-fallback-container-tiffany", "vto-fallback-preview-img", "vto-fallback-title-tiffany", "vto-file-input-tiffany", "vto-guide-silhouette-tiffany", "vto-modal-body-tiffany", "vto-modal-close-tiffany", "vto-modal-header-tiffany", "vto-modal-title-tiffany", "vto-overlay-item-tiffany", "vto-slider-row-tiffany", "vto-slider-tiffany", "vto-view-wrapper-tiffany", "web3-status", "welded-note-tiffany", "world-bg-overlay", "world-content", "world-of-catbird-section", "world-subtitle", "world-title"];
  const deadLeft = DEAD.filter(d => css.includes(d));
  t('A01 all proven-dead tokens (n=' + DEAD.length + ') fully absent from css', deadLeft.length === 0);
  if (deadLeft.length) console.log('     left:', deadLeft.join(', '));
  let d2 = 0; const nc = css.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const ch of nc) { if (ch === '{') d2++; else if (ch === '}') d2--; }
  t('A02 css braces balanced (end 0)', d2 === 0);
  t('A03 P5/P6 markers intact', css.includes('AB-P5-FINISH v1') && css.includes('AB-P6-MOTION v1'));
  const ALIVE = ['.footer-heading','.product-name','.specs-title-tiffany','.search-section-title-tiffany',
    'img.lz','#ab-btt','::selection','.skip-to-main','.hero-bg-img','.chat-input','.nav-link',
    '.product-card','.site-header','.product-price','.bag-item-price','.section-category-grid',
    '.section-experience-tiffany','.edits-row-tiffany','.btn-add-to-bag-tiffany','.btn-booking-submit',
    '.hero-placeholder-1'];
  const lost = ALIVE.filter(s => !css.includes(s));
  t('A04 live core selectors all intact', lost.length === 0);
  if (lost.length) console.log('     lost:', lost.join(', '));
  t('A05 font-display: swap present on all 21 @font-face',
    (css.match(/@font-face/g) || []).length === 21 && (css.match(/font-display: swap;/g) || []).length === 21);
  const chars = css.length;
  t('A06 css size in expected purge band (138k-152k chars)', chars > 138000 && chars < 152000);
  t('A07 P5 :active rule rewritten (dark/light/404/chat dead refs gone)',
    css.includes('.btn-add-to-bag-tiffany:active') && !css.includes('.btn-dark:active') &&
    !css.includes('.chat-widget-submit-btn'));
  t('A08 reduced-motion rule rewritten (no quick-view-overlay-btn)',
    css.includes('.product-card') && !css.includes('.quick-view-overlay-btn'));
  t('A09 hero rule single selector (.hero-bg-img only)', css.includes('.hero-bg-img') && !css.includes('.hero-slide-img'));
  t('A10 no dead token in any selector position',
    (() => {
      const src = css.replace(/\/\*[\s\S]*?\*\//g, '');
      // crude selector-position scan: text before each '{'
      const sels = src.split('{').slice(0, -1).map(s => { const i = Math.max(s.lastIndexOf('}'), s.lastIndexOf(';')); return s.slice(i + 1); });
      return !sels.some(sel => DEAD.some(d => new RegExp('[.#]' + d.replace(/[-]/g, '\\-') + '(?![\\w-])').test(sel)));
    })());
}

/* ---- B. HTML edits ---- */
const p404 = rd('404.html');
if (p404 === null) skip('B01 (404.html absent)');
else {
  t('B01 404: favicon trio with ABSOLUTE urls + theme-color + focus rule + noindex',
    p404.includes('<link rel="icon" type="image/png" href="/images/favicon.png" />') &&
    p404.includes('<link rel="icon" type="image/svg+xml" href="/images/favicon.svg" />') &&
    p404.includes('<link rel="shortcut icon" href="/favicon.ico" sizes="any" />') &&
    p404.includes('<meta name="theme-color" content="#110F0C" />') &&
    p404.includes('a.btn:focus-visible') &&
    p404.includes('noindex, follow'));
}
const col = rd('collection.html');
if (col === null) skip('B02 (collection.html absent)');
else {
  t('B02 collection: main id renamed to maincontent, matches skip href',
    col.includes('<main id="maincontent" class="collection-page-tiffany"') &&
    !col.includes('<main id="main-content"') &&
    (col.match(/href="#maincontent"/g) || []).length >= 1);
}
const story = rd('story.html');
if (story === null) skip('B03 (story.html absent)');
else {
  t('B03 story: main id maincontent + Our Story nav aria-current',
    story.includes('<main id="maincontent" class="story-page-tiffany"') &&
    !story.includes('<main id="main-content"') &&
    story.includes('<a href="story.html" class="nav-link" aria-current="page">') &&
    story.includes('<a href="story.html" class="footer-link">'));
}
const priv = rd('privacy.html');
const home = rd('home.html');
if (priv === null) skip('B04 (privacy.html absent)');
else {
  t('B04 privacy: logo aria-current removed; home logo keeps its (correct) one',
    priv.includes('<a id="logo-link" href="index.html" class="logo-link">') &&
    !priv.includes('<a id="logo-link" href="index.html" aria-current="page"') &&
    (home === null || home.includes('href="index.html" aria-current="page"')));
}
if (pages.length) {
  const noH4 = pages.every(f => !(rd(f).match(/<h4[\s>]/g)));
  const oneH1 = pages.every(f => (rd(f).match(/<h1[\s>]/g) || []).length === 1);
  t('B05 all pages: zero <h4>, exactly one <h1> (P7 outline preserved)', noH4 && oneH1);
  const themeOk = pages.every(f => (rd(f).match(/<meta name="theme-color" content="#(FAF8F4|110F0C)"/g) || []).length === 1);
  t('B06 theme-color exactly once per page', themeOk);
  const searchPages = pages.filter(f => f !== 'privacy.html' && f !== '404.html');
  const labelOk = searchPages.every(f => (rd(f).match(/aria-label="Search jewellery"/g) || []).length === 1);
  t('B07 search label exactly once on all search pages', labelOk);
  const jsonOk = searchPages.every(f => rd(f).includes('FAQPage') && rd(f).includes('JewelryStore') && rd(f).includes('"Product"'));
  t('B08 JSON-LD graph intact on all search pages', jsonOk);
  const hpHome = home === null || home.toLowerCase().includes('honeypot');
  const hpOthers = ['collection.html','story.html','privacy.html','404.html'].every(f => rd(f) === null || !rd(f).toLowerCase().includes('honeypot'));
  t('B09 honeypot posture unchanged (home/index only)', hpHome && hpOthers);
}

/* ---- C. untouched invariants ---- */
try { t('C01 script.js untouched (P6/P7 hash)', sha('script.js') === 'e9e9ed663dccb217c08a6fcf20d40611d91c99be1af68a41e665786b9e60509f'); }
catch (e) { skip('C01 script.js not in dir'); }
try { t('C02 cart.js untouched', sha('cart.js') === '263769b3add9cf892f460fbca2b70778aa167bdb4c6bc53e07ea8739742ef62c'); }
catch (e) { skip('C02 cart.js not in dir'); }
try { t('C03 cart.css untouched', sha('cart.css') === '9aaae2536491132a84aace233680f5946bdbea03f853e78501b8f16c7a7333ac'); }
catch (e) { skip('C03 cart.css not in dir'); }
try {
  const a = sha('home.html'), b = sha('index.html');
  t('C04 index.html byte-identical to home.html', a === b);
} catch (e) { skip('C04 index/home pair incomplete'); }

/* ---- D. manifest ---- */
const man = rd('PACKAGE-MANIFEST.txt');
if (man === null) skip('D01 manifest absent');
else {
  const lines = man.split('\n').filter(l => /^[0-9a-f]{64}/.test(l));
  let okAll = lines.length > 0;
  for (const l of lines) {
    const [h, , f] = l.split(/\s+/);
    try { if (sha(f) !== h) { okAll = false; console.log('     mismatch:', f); } }
    catch (e) { okAll = false; console.log('     missing:', f); }
  }
  t('D01 manifest sha256 verify (' + lines.length + ' files)', okAll);
}

console.log(`RESULT: PASS ${pass} / FAIL ${fail}`);
process.exit(fail ? 1 : 0);
