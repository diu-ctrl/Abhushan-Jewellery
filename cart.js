/* =============================================================
   ABHUSHAN — Bag (cart) manager · Vanilla JS · localStorage
   WhatsApp checkout for Indian studio jewellery
   ============================================================= */
(function () {
  'use strict';
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
  var KEY = 'abhushan_cart_v1';
  var PRODUCTS = {
    "Threadbare Ring": {
        "price": 3999,
        "img": "images/_Product Cards/prod_ring1.png",
        "href": "product-threadbare-ring.html",
        "category": "Rings"
    },
    "Hammered Hoop Earring": {
        "price": 5299,
        "img": "images/_Product Cards/prod_earring1.png",
        "href": "product-hammered-hoop.html",
        "category": "Earrings"
    },
    "Greco Lariat": {
        "price": 32999,
        "img": "images/_Product Cards/prod_necklace1.png",
        "href": "product-greco-lariat.html",
        "category": "Necklaces"
    },
    "Sweet Nothing Bracelet": {
        "price": 11299,
        "img": "images/_Product Cards/prod_bracelet1.png",
        "href": "product-sweet-nothing.html",
        "category": "Bracelets"
    },
    "Tomboy Ring": {
        "price": 21999,
        "img": "images/_Product Cards/prod_ring2.png",
        "href": "product-tomboy-ring.html",
        "category": "Rings"
    },
    "Suno Bangle": {
        "price": 13999,
        "img": "assets/img/products/suno-bangle.jpg",
        "href": "product-suno-bangle.html",
        "category": "Bracelets"
    },
    "Dhoon Chain Bracelet": {
        "price": 8999,
        "img": "assets/img/products/dhoon-chain.jpg",
        "href": "product-dhoon-chain.html",
        "category": "Bracelets"
    },
    "Amulet Charm Bracelet": {
        "price": 15499,
        "img": "assets/img/products/amulet-charm.jpg",
        "href": "product-amulet-charm.html",
        "category": "Bracelets"
    },
    "Forever Chain — Fine": {
        "price": 7499,
        "img": "assets/img/products/forever-fine.jpg",
        "href": "product-forever-fine.html",
        "category": "Bracelets"
    },
    "Forever Chain — Beaded": {
        "price": 9999,
        "img": "assets/img/products/forever-beaded.jpg",
        "href": "product-forever-beaded.html",
        "category": "Bracelets"
    },
    "Forever Charm Link": {
        "price": 12499,
        "img": "assets/img/products/forever-charm-link.jpg",
        "href": "product-forever-charm-link.html",
        "category": "Bracelets"
    },
    "Saadiya Bridal Set": {
        "price": 48999,
        "img": "assets/img/products/saadiya-set.jpg",
        "href": "product-saadiya-set.html",
        "category": "Necklaces"
    },
    "Choora Bond Bangles (Pair)": {
        "price": 31999,
        "img": "assets/img/products/choora-bangles.jpg",
        "href": "product-choora-bangles.html",
        "category": "Bracelets"
    },
    "Vachan Ring Set (His & Hers)": {
        "price": 39499,
        "img": "assets/img/products/vachan-rings.jpg",
        "href": "product-vachan-rings.html",
        "category": "Rings"
    },
    "Moonsilver Pendant": {
        "price": 6499,
        "img": "assets/img/products/moonsilver-pendant.jpg",
        "href": "product-moonsilver-pendant.html",
        "category": "Necklaces"
    },
    "Sunhera Fine Chain": {
        "price": 7499,
        "img": "assets/img/products/sunhera-chain.jpg",
        "href": "product-sunhera-chain.html",
        "category": "Necklaces"
    },
    "Nazar Charm": {
        "price": 4499,
        "img": "assets/img/products/nazar-charm.jpg",
        "href": "product-nazar-charm.html",
        "category": "Necklaces"
    }
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
          : '<p class="unlocked">Free insured shipping unlocked</p>')
      + '<div class="bag-ship-bar"><span style="width:' + shipPct + '%"></span></div></div>';
    var emi = n === 0 ? '' : '<p class="bag-emi">or ' + inr(sub/12) + '/month with 12-month EMI at 0% interest</p>';
    var body = n === 0
      ? '<div class="bag-empty"><p class="bag-empty-title">Your bag is empty.</p><p class="bag-empty-sub">Solid gold, handcrafted in Ahmedabad, made to be worn every day.</p><a class="bag-cta bag-cta-secondary" href="index.html#section-products">Explore Collections</a></div>'
      : '<div class="bag-list">' + rows + '</div>'
        + shipBlock + emi
        + '<div class="bag-subtotal"><span>Subtotal</span><strong>' + inr(sub) + '</strong></div>'
        + '<div class="bag-ctas">'
        + '<button type="button" class="bag-cta bag-cta-primary" id="bag-checkout">Checkout</button>'
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
    var co = document.getElementById('bag-checkout');
    if (co) co.addEventListener('click', openCheckout);
  }
  function openDrawer(){ if (!drawer) buildShell(); render(); overlay.classList.add('open'); drawer.classList.add('open'); document.body.style.overflow = 'hidden'; }
  function closeDrawer(){ if (!drawer) return; overlay.classList.remove('open'); drawer.classList.remove('open'); document.body.style.overflow = ''; }

  /* ---------- add flows ---------- */
  function add(name, size){
    var p = PRODUCTS[name]; if (!p) return;
    items.push({ name: name, price: p.price, img: p.img, href: p.href, size: size || null });
    save(); updateBadge(); render();
    toast(name + ' added to your bag');
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
  function esc(s){
    return String(s).replace(/[&<>"']/g, function(c){
      return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c];
    });
  }

  /* ---------- checkout modal (Phase 4) ---------- */
  var ckOverlay = null;

  function shipFor(sub){ return sub >= CONFIG.FREE_SHIP ? 0 : CONFIG.SHIP_FEE; }

  function buildCheckoutShell(){
    if (ckOverlay) return;
    ckOverlay = document.createElement('div');
    ckOverlay.className = 'ck-overlay';
    ckOverlay.id = 'ck-overlay';
    ckOverlay.innerHTML =
      '<div class="ck-modal" role="dialog" aria-modal="true" aria-labelledby="ck-title">'
      + '<div class="ck-head"><h2 id="ck-title">Checkout</h2>'
      + '<button type="button" class="ck-close" id="ck-close" aria-label="Close checkout">&times;</button></div>'
      + '<div class="ck-body">'
      + '<div class="ck-invoice"><h3 class="ck-h3">Order Summary</h3><div id="ck-lines"></div>'
      + '<div class="ck-row"><span>Subtotal</span><strong id="ck-sub"></strong></div>'
      + '<div class="ck-row"><span>Insured shipping</span><strong id="ck-ship"></strong></div>'
      + '<div class="ck-row ck-total"><span>Total</span><strong id="ck-total"></strong></div></div>'
      + '<form id="ck-form" novalidate>'
      + '<h3 class="ck-h3">Your Details</h3>'
      + '<p class="ck-why">We use these only to confirm and deliver your order.</p>'
      + '<label class="ck-field">Full name<input type="text" name="ck-name" autocomplete="name" placeholder="Your full name"></label>'
      + '<label class="ck-field">Phone (WhatsApp)<input type="tel" name="ck-phone" inputmode="numeric" autocomplete="tel" placeholder="10-digit mobile number"></label>'
      + '<label class="ck-field">Email<input type="email" name="ck-email" autocomplete="email" placeholder="you@example.com"></label>'
      + '<label class="ck-field">Delivery address<input type="text" name="ck-address" autocomplete="street-address" placeholder="House / street / area"></label>'
      + '<div class="ck-two">'
      + '<label class="ck-field">City<input type="text" name="ck-city" placeholder="City"></label>'
      + '<label class="ck-field">PIN code<input type="text" name="ck-pin" inputmode="numeric" placeholder="6-digit PIN"></label>'
      + '</div>'
      + '<label class="ck-field">Notes — size, gift wrap, occasion<input type="text" name="ck-notes" placeholder="Anything we should know"></label>'
      + '<p class="ck-error" id="ck-error" role="alert"></p>'
      + '</form>'
      + '</div>'
      + '<div class="ck-foot">'
      + '<button type="button" class="bag-cta bag-cta-secondary" id="ck-cancel">Cancel</button>'
      + '<button type="button" class="bag-cta bag-cta-primary" id="ck-place">Order</button>'
      + '</div>'
      + '</div>';
    document.body.appendChild(ckOverlay);
    document.getElementById('ck-close').addEventListener('click', closeCheckout);
    document.getElementById('ck-cancel').addEventListener('click', closeCheckout);
    ckOverlay.addEventListener('click', function(e){ if (e.target === ckOverlay) closeCheckout(); });
    document.getElementById('ck-place').addEventListener('click', placeOrder);
  }

  function fillInvoice(){
    var el = document.getElementById('ck-lines');
    if (el) el.innerHTML = items.map(function(i){
      return '<div class="ck-line"><span>' + esc(i.name) + (i.size ? ' · Size ' + esc(i.size) : '') + '</span><span>' + inr(i.price) + '</span></div>';
    }).join('');
    var sub = subtotal(), ship = shipFor(sub);
    document.getElementById('ck-sub').textContent = inr(sub);
    document.getElementById('ck-ship').textContent = ship === 0 ? 'Free' : inr(ship);
    document.getElementById('ck-total').textContent = inr(sub + ship);
  }

  function openCheckout(){
    if (!count()) return;
    buildCheckoutShell();
    fillInvoice();
    var err = document.getElementById('ck-error');
    if (err) err.textContent = '';
    closeDrawer();
    ckOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    var first = ckOverlay.querySelector('input[name="ck-name"]');
    if (first) setTimeout(function(){ first.focus(); }, 120);
  }

  function closeCheckout(){
    if (!ckOverlay) return;
    ckOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function orderId(){
    var d = new Date();
    var ymd = d.getFullYear() + ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2);
    return 'ABH-' + ymd + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
  }

  function orderLinesText(o){
    return o.items.map(function(i){
      return '• ' + i.name + (i.size ? ' (Size ' + i.size + ')' : '') + ' — ' + inr(i.price);
    }).join('\n');
  }

  function orderEmailText(o){
    var c = o.customer;
    return 'NEW ORDER — Abhushan Studio\n'
      + 'Order ID: ' + o.id + '\n'
      + 'Placed: ' + new Date(o.at).toLocaleString('en-IN') + '\n\n'
      + 'CUSTOMER\nName: ' + c.name + '\nPhone: ' + c.phone + '\nEmail: ' + c.email + '\n'
      + 'Address: ' + (c.address || '—') + (c.city ? ', ' + c.city : '') + (c.pin ? ' — ' + c.pin : '') + '\n'
      + 'Notes: ' + (c.notes || '—') + '\n\n'
      + 'ITEMS\n' + orderLinesText(o) + '\n\n'
      + 'Subtotal: ' + inr(o.subtotal) + '\n'
      + 'Shipping: ' + (o.shipping === 0 ? 'Free (insured)' : inr(o.shipping)) + '\n'
      + 'ORDER TOTAL: ' + inr(o.total) + '\n\n'
      + 'Source: ' + (o.page || 'website');
  }

  function orderWhatsappText(o){
    var c = o.customer;
    return 'Namaste Abhushan — my order ' + o.id + '\n\n'
      + 'Name: ' + c.name + '\nPhone: ' + c.phone + '\n'
      + (c.address ? 'Address: ' + c.address + (c.city ? ', ' + c.city : '') + (c.pin ? ' — ' + c.pin : '') + '\n' : '')
      + '\nItems:\n' + orderLinesText(o)
      + '\n\nSubtotal: ' + inr(o.subtotal)
      + '\nShipping: ' + (o.shipping === 0 ? 'Free' : inr(o.shipping))
      + '\nTotal: ' + inr(o.total)
      + (c.notes ? '\nNotes: ' + c.notes : '');
  }

  function placeOrder(){
    if (!count() || !ckOverlay) return;
    var get = function(n){
      var el = ckOverlay.querySelector('[name="' + n + '"]');
      return el ? el.value.trim() : '';
    };
    var name = get('ck-name');
    var phone = get('ck-phone').replace(/[\s\-]/g, '').replace(/^\+91/, '');
    var email = get('ck-email');
    var address = get('ck-address'), city = get('ck-city');
    var pin = get('ck-pin').replace(/\s/g, ''), notes = get('ck-notes');
    var err = document.getElementById('ck-error');

    var problems = [];
    if (name.length < 2) problems.push('your full name');
    if (!/^[6-9]\d{9}$/.test(phone)) problems.push('a valid 10-digit mobile number');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) problems.push('a valid email address');
    if (pin && !/^\d{6}$/.test(pin)) problems.push('a valid 6-digit PIN (or leave it empty)');
    if (problems.length){
      err.textContent = 'Please enter ' + problems.join(', ') + '.';
      return;
    }
    err.textContent = '';

    var btn = document.getElementById('ck-place');
    btn.disabled = true;
    btn.textContent = 'Placing order\u2026';

    var ship = shipFor(subtotal());
    var order = {
      id: orderId(),
      at: new Date().toISOString(),
      customer: { name: name, phone: phone, email: email, address: address, city: city, pin: pin, notes: notes },
      items: items.map(function(i){ return { name: i.name, price: i.price, size: i.size || null }; }),
      subtotal: subtotal(),
      shipping: ship,
      total: subtotal() + ship,
      status: 'new',
      page: location.href
    };

    /* 1) local record — this is what the Admin Portal Orders tab reads */
    try {
      var arr = JSON.parse(localStorage.getItem('abhushan_orders_v1') || '[]');
      arr.push(order);
      localStorage.setItem('abhushan_orders_v1', JSON.stringify(arr));
    } catch (e) {}

    /* 1b) PHASE 5 — cloud record so the order shows in the Admin Portal
       on ANY device. On failure it queues and retries on next visit. */
    cloudPost({ action: 'order', order: order }).catch(function () {
      queuePush({ action: 'order', order: order });
    });

    /* 2) email the studio — Web3Forms via notify.js, now WITH full customer details */
    var emailPromise = (window.AbhushanNotify && window.AbhushanNotify.send)
      ? window.AbhushanNotify.send(
          'New Order ' + order.id + ' — ' + order.customer.name,
          {
            order_id: order.id,
            name: order.customer.name,
            phone: order.customer.phone,
            email: order.customer.email,
            address: (order.customer.address + (order.customer.city ? ', ' + order.customer.city : '') + (order.customer.pin ? ' — ' + order.customer.pin : '')) || '—',
            notes: order.customer.notes || '—',
            order_items: orderLinesText(order).replace(/• /g, ''),
            order_subtotal: inr(order.subtotal),
            order_shipping: order.shipping === 0 ? 'Free (insured)' : inr(order.shipping),
            order_total: inr(order.total),
            message: orderEmailText(order)
          },
          order.customer.email
        )
      : Promise.resolve({ success: false });

    /* 4) clear bag, close checkout, show confirmation */
    items = [];
    save();
    updateBadge();
    render();
    closeCheckout();
    btn.disabled = false;
    btn.textContent = 'Order';
    showConfirmation(order, emailPromise);
  }

  /* ---------- confirmation popup (Phase 4) ---------- */
  var ckConfirm = null;

  function buildConfirmShell(){
    if (ckConfirm) return;
    ckConfirm = document.createElement('div');
    ckConfirm.className = 'ck-overlay';
    ckConfirm.id = 'ck-confirm-overlay';
    ckConfirm.innerHTML =
      '<div class="ck-modal ck-confirm" role="dialog" aria-modal="true" aria-labelledby="ckc-title">'
      + '<div class="ck-checkmark" aria-hidden="true"><span></span></div>'
      + '<h2 id="ckc-title">Order received</h2>'
      + '<p class="ck-order-id">Order ID: <strong id="ckc-id"></strong></p>'
      + '<p class="ck-confirm-sub" id="ckc-sub"></p>'
      + '<div class="ck-confirm-summary" id="ckc-summary"></div>'
      + '<div class="ck-foot">'
      + '<button type="button" class="bag-cta bag-cta-secondary" id="ck-wa">Send order summary via WhatsApp</button>'
      + '<button type="button" class="bag-cta bag-cta-primary" id="ck-done">Done</button>'
      + '</div>'
      + '</div>';
    document.body.appendChild(ckConfirm);
    document.getElementById('ck-done').addEventListener('click', function(){
      ckConfirm.classList.remove('open');
      document.body.style.overflow = '';
      toast('Thank you — your order is with the studio');
    });
  }

  function showConfirmation(order, emailPromise){
    buildConfirmShell();
    document.getElementById('ckc-id').textContent = order.id;
    document.getElementById('ckc-summary').innerHTML =
      order.items.map(function(i){
        return '<div class="ck-line"><span>' + esc(i.name) + (i.size ? ' · Size ' + esc(i.size) : '') + '</span><span>' + inr(i.price) + '</span></div>';
      }).join('')
      + '<div class="ck-row ck-total"><span>Total (incl. shipping)</span><strong>' + inr(order.total) + '</strong></div>';
    ckConfirm.classList.add('open');
    document.body.style.overflow = 'hidden';

    var waBtn = document.getElementById('ck-wa');
    waBtn.onclick = function(){
      var url = (window.AbhushanNotify && window.AbhushanNotify.whatsappLink)
        ? window.AbhushanNotify.whatsappLink(orderWhatsappText(order))
        : 'https://wa.me/' + CONFIG.WHATSAPP_NUMBER + '?text=' + encodeURIComponent(orderWhatsappText(order));
      window.open(url, '_blank', 'noopener');
    };

    var sub = document.getElementById('ckc-sub');
    sub.textContent = 'Sending your order to the studio\u2026';
    emailPromise.then(function(res){
      if (res && res.success === true) {
        sub.textContent = 'Your order has been emailed to the studio. We confirm personally within 2 hours · Mon–Sat 10 AM – 7 PM IST.';
      } else {
        sub.innerHTML = 'The studio email could not be sent just now — please tap <strong>Send order summary via WhatsApp</strong> so we receive your order. We confirm within 2 hours · Mon–Sat 10 AM – 7 PM IST.';
      }
    });
  }

  load();
  injectHeaderButton();
  flushQueue(); // PHASE 5 — retry any orders queued while offline
  window.AbhushanCart = {
    add: add, addByName: addByName, addFromWishlist: addFromWishlist,
    open: openDrawer, close: closeDrawer, count: count, subtotal: subtotal, inr: inr, CONFIG: CONFIG,
    cloudPost: cloudPost, cloudConfigured: cloudConfigured // PHASE 5 — reused by script.js
  };
})();
