/* =============================================================
   ABHUSHAN — Bag (cart) manager · Vanilla JS · localStorage
   WhatsApp checkout for Indian studio jewellery
   ============================================================= */
(function () {
  'use strict';
  var CONFIG = {
    WHATSAPP_NUMBER: 'OWNER-INPUT-919XXXXXXXXX', // digits only, no +
    CURRENCY: '₹',
    FREE_SHIP: 10000
  };
  var KEY = 'abhushan_cart_v1';
  var PRODUCTS = {
    'Threadbare Ring':       { price: 3999,  img: 'images/_Product%20Cards/prod_ring1.png',     href: 'product-threadbare-ring.html', category: 'Rings' },
    'Hammered Hoop Earring': { price: 5299,  img: 'images/_Product%20Cards/prod_earring1.png',  href: 'product-hammered-hoop.html',   category: 'Earrings' },
    'Greco Lariat':          { price: 32999, img: 'images/_Product%20Cards/prod_necklace1.png', href: 'product-greco-lariat.html',    category: 'Necklaces' },
    'Sweet Nothing Bracelet':{ price: 11299, img: 'images/_Product%20Cards/prod_bracelet1.png', href: 'product-sweet-nothing.html',   category: 'Bracelets' },
    'Tomboy Ring':           { price: 21999, img: 'images/_Product%20Cards/prod_ring2.png',     href: 'product-tomboy-ring.html',     category: 'Rings' }
  };
  var items = [];
  function load(){ try { items = JSON.parse(localStorage.getItem(KEY)) || []; } catch(e){ items = []; } }
  function save(){ try { localStorage.setItem(KEY, JSON.stringify(items)); } catch(e){} }
  function inr(n){
    var s = Math.ceil(n).toString();
    if (s.length <= 3) return CONFIG.CURRENCY + s;
    var last3 = s.slice(-3), rest = s.slice(0,-3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    return CONFIG.CURRENCY + rest + ',' + last3;
  }
  function subtotal(){ return items.reduce(function(t,i){ return t + i.price; }, 0); }
  function count(){ return items.length; }

  /* ---------- toast ---------- */
  var toastTimer = null;
  function toast(msg){
    var t = document.getElementById('bag-toast');
    if (!t) {
      t = document.createElement('div'); t.id = 'bag-toast'; t.className = 'bag-toast';
      t.setAttribute('role','status'); t.setAttribute('aria-live','polite');
      document.body.appendChild(t);
    }
    t.innerHTML = '<span>' + msg + '</span>';
    t.classList.add('visible');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ t.classList.remove('visible'); }, 2600);
  }

  /* ---------- header button ---------- */
  var btn = null, badge = null;
  function injectHeaderButton(){
    var right = document.querySelector('.nav-top-right');
    if (!right || document.getElementById('nav-bag-btn')) return;
    btn = document.createElement('button');
    btn.className = 'nav-bag-btn'; btn.id = 'nav-bag-btn';
    btn.type = 'button'; btn.setAttribute('aria-label','Open bag');
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 7h12l1.5 13.5a1 1 0 0 1-1 1.1H5.5a1 1 0 0 1-1-1.1L6 7z"/><path d="M9 10V6a3 3 0 0 1 6 0v4"/></svg>';
    badge = document.createElement('span');
    badge.className = 'bag-badge'; badge.id = 'bag-badge'; badge.setAttribute('aria-live','polite');
    badge.textContent = '0';
    btn.appendChild(badge);
    btn.addEventListener('click', openDrawer);
    right.appendChild(btn);
    updateBadge();
  }
  function updateBadge(){
    if (!badge) return;
    badge.textContent = count();
    badge.classList.toggle('visible', count() > 0);
  }

  /* ---------- drawer ---------- */
  var overlay = null, drawer = null;
  function buildShell(){
    overlay = document.createElement('div'); overlay.className = 'bag-overlay'; overlay.id = 'bag-overlay';
    overlay.addEventListener('click', closeDrawer);
    drawer = document.createElement('aside'); drawer.className = 'bag-drawer'; drawer.id = 'bag-drawer';
    drawer.setAttribute('role','dialog'); drawer.setAttribute('aria-modal','true'); drawer.setAttribute('aria-label','Your bag');
    document.body.appendChild(overlay); document.body.appendChild(drawer);
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer(); });
  }
  function render(){
    if (!drawer) return;
    var sub = subtotal(), n = count();
    var rows = items.map(function(i, idx){
      return '<div class="bag-item" style="animation-delay:' + (idx*0.05) + 's">'
        + '<a class="bag-item-thumb" href="' + i.href + '"><img src="' + i.img + '" alt="' + i.name + '" loading="lazy"></a>'
        + '<div class="bag-item-info"><p class="bag-item-name">' + i.name + '</p>'
        + (i.size ? '<p class="bag-item-size">Size ' + i.size + '</p>' : '')
        + '<p class="bag-item-price">' + inr(i.price) + '</p></div>'
        + '<button type="button" class="bag-item-remove" data-idx="' + idx + '" aria-label="Remove ' + i.name + '">&times;</button>'
        + '</div>';
    }).join('');
    var remain = CONFIG.FREE_SHIP - sub;
    var shipPct = Math.max(0, Math.min(100, (sub / CONFIG.FREE_SHIP) * 100));
    var shipBlock = n === 0 ? '' :
      '<div class="bag-ship">'
      + (remain > 0
          ? '<p>' + inr(remain) + ' away from <strong>free insured shipping</strong></p>'
          : '<p class="unlocked">✦ Free insured shipping unlocked</p>')
      + '<div class="bag-ship-bar"><span style="width:' + shipPct + '%"></span></div></div>';
    var emi = n === 0 ? '' : '<p class="bag-emi">or ' + inr(sub/12) + '/month with 12-month EMI at 0% interest</p>';
    var body = n === 0
      ? '<div class="bag-empty"><p class="bag-empty-title">Your bag is empty.</p><p class="bag-empty-sub">Solid gold, handcrafted in Ahmedabad, made to be worn every day.</p><a class="bag-cta bag-cta-secondary" href="index.html#section-products">Explore Collections</a></div>'
      : '<div class="bag-list">' + rows + '</div>'
        + shipBlock + emi
        + '<div class="bag-subtotal"><span>Subtotal</span><strong>' + inr(sub) + '</strong></div>'
        + '<div class="bag-ctas">'
        + (CONFIG.WHATSAPP_NUMBER.indexOf('OWNER-INPUT') === -1
            ? '<button type="button" class="bag-cta bag-cta-primary" id="bag-wa">Send Order on WhatsApp</button>'
            : '')
        + '<button type="button" class="bag-cta bag-cta-secondary" id="bag-email">Reserve by Email</button>'
        + '</div>'
        + '<p class="bag-note">We confirm every order personally within 2 hours · Mon–Sat 10 AM – 7 PM IST</p>';
    drawer.innerHTML = '<div class="bag-header"><h2 class="bag-title">Your Bag' + (n ? ' <span class="bag-count">(' + n + ')</span>' : '') + '</h2>'
      + '<button type="button" class="bag-close" id="bag-close" aria-label="Close bag">&times;</button></div>' + body;
    var c = document.getElementById('bag-close'); if (c) c.addEventListener('click', closeDrawer);
    drawer.querySelectorAll('.bag-item-remove').forEach(function(b){
      b.addEventListener('click', function(){
        items.splice(parseInt(b.getAttribute('data-idx'),10), 1); save(); updateBadge(); render();
      });
    });
    var wa = document.getElementById('bag-wa');
    if (wa) wa.addEventListener('click', checkoutWhatsApp);
    var em = document.getElementById('bag-email');
    if (em) em.addEventListener('click', checkoutEmail);
  }
  function openDrawer(){ if (!drawer) buildShell(); render(); overlay.classList.add('open'); drawer.classList.add('open'); document.body.style.overflow = 'hidden'; }
  function closeDrawer(){ if (!drawer) return; overlay.classList.remove('open'); drawer.classList.remove('open'); document.body.style.overflow = ''; }

  /* ---------- add flows ---------- */
  function add(name, size){
    var p = PRODUCTS[name]; if (!p) return;
    items.push({ name: name, price: p.price, img: p.img, href: p.href, size: size || null });
    save(); updateBadge(); render();
    toast('✓ ' + name + ' added to your bag');
    if (badge) { badge.classList.remove('pop'); void badge.offsetWidth; badge.classList.add('pop'); }
  }
  function addByName(name){
    var wrap = document.querySelector('.size-selector-wrap-tiffany');
    var chosen = document.querySelector('.size-option-btn-tiffany.active');
    if (wrap && !chosen) {
      wrap.classList.remove('shake'); void wrap.offsetWidth; wrap.classList.add('shake');
      toast('Please select a size first');
      return;
    }
    add(name, chosen ? chosen.textContent.trim() : null);
  }
  function addFromWishlist(name){ add(name, null); }

  /* ---------- checkout ---------- */
  function orderLines(){
    return items.map(function(i){ return '• ' + i.name + (i.size ? ' (Size ' + i.size + ')' : '') + ' — ' + inr(i.price); }).join('\n');
  }
  function checkoutWhatsApp(){
    if (!count()) return;
    var msg = 'Namaste Abhushan ✦\nI would like to order:\n\n' + orderLines()
      + '\n\nSubtotal: ' + inr(subtotal())
      + (subtotal() >= CONFIG.FREE_SHIP ? '\nFree insured shipping applied' : '')
      + '\n\nSent from abhushan-by-divyaraj.vercel.app';
    window.open('https://wa.me/' + CONFIG.WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  }
  function checkoutEmail(){
    if (!count()) return;
    if (window.AbhushanNotify && window.AbhushanNotify.order) {
      window.AbhushanNotify.order(items, subtotal(), inr);
    } else {
      toast('WhatsApp is the fastest way to order right now ✦');
      checkoutWhatsApp();
    }
  }

  load();
  injectHeaderButton();
  window.AbhushanCart = {
    add: add, addByName: addByName, addFromWishlist: addFromWishlist,
    open: openDrawer, close: closeDrawer, count: count, subtotal: subtotal, inr: inr, CONFIG: CONFIG
  };
})();
