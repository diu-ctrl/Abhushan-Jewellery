import glob, re, os

# 1. Update vercel.json
vj_path = 'vercel.json'
with open(vj_path, 'r', encoding='utf-8') as f:
    vj_content = f.read()

new_vj = '''{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "cleanUrls": true,
  "trailingSlash": false,
  "redirects": [
    { "source": "/index.html", "destination": "/", "permanent": true },
    { "source": "/index", "destination": "/", "permanent": true },
    { "source": "/home.html", "destination": "/", "permanent": true },
    { "source": "/home", "destination": "/", "permanent": true }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=(), payment=()" },
        { "key": "X-DNS-Prefetch-Control", "value": "on" }
      ]
    },
    {
      "source": "/images/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=604800, stale-while-revalidate=2592000" }
      ]
    },
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-store" }
      ]
    }
  ]
}
'''
with open(vj_path, 'w', encoding='utf-8') as f:
    f.write(new_vj)
print("Updated vercel.json")

# 2. Update middleware.js
mw_path = 'middleware.js'
with open(mw_path, 'r', encoding='utf-8') as f:
    mw_content = f.read()

mw_old = "export const config = {\n  matcher: ['/admin.html', '/api/admin-data']\n};"
mw_new = "export const config = {\n  matcher: ['/admin', '/admin.html', '/api/admin-data']\n};"
if mw_old in mw_content:
    mw_content = mw_content.replace(mw_old, mw_new)
    with open(mw_path, 'w', encoding='utf-8') as f:
        f.write(mw_content)
    print("Updated middleware.js")
else:
    print("WARNING: mw_old not found in middleware.js")

# 3. Update script.js
sj_path = 'script.js'
with open(sj_path, 'r', encoding='utf-8') as f:
    sj_content = f.read()

# Logo redirect
sj_content = sj_content.replace("window.location.href = 'index.html';", "window.location.href = '/';")

# Chat section redirect
sj_content = sj_content.replace("window.location.href = 'index.html' + selector;", "window.location.href = '/' + selector;")

# Wishlist continue / explore links
sj_content = sj_content.replace('<a href="index.html#section-products" class="wl-continue-link">', '<a href="/#section-products" class="wl-continue-link">')
sj_content = sj_content.replace('<a href="index.html#section-products" class="wl-empty-cta">', '<a href="/#section-products" class="wl-empty-cta">')

# PDP heart normalization in injectPDPHeart
old_inject = """    function injectPDPHeart() {
      var pagePath = window.location.pathname.split('/').pop() || 'index.html';
      var product = PDP_MAP[pagePath];"""
new_inject = """    function injectPDPHeart() {
      var pagePath = window.location.pathname.split('/').pop() || 'index.html';
      if (pagePath && !pagePath.endsWith('.html')) pagePath += '.html';
      var product = PDP_MAP[pagePath];"""

if old_inject in sj_content:
    sj_content = sj_content.replace(old_inject, new_inject)
else:
    print("WARNING: old_inject not found in script.js")

# PDP heart normalization in updatePDPHeart
old_update = """    function updatePDPHeart() {
      var pdpBtn = document.getElementById('pdp-wishlist-btn');
      if (!pdpBtn) return;
      var pagePath = window.location.pathname.split('/').pop() || 'index.html';
      var product = PDP_MAP[pagePath];"""
new_update = """    function updatePDPHeart() {
      var pdpBtn = document.getElementById('pdp-wishlist-btn');
      if (!pdpBtn) return;
      var pagePath = window.location.pathname.split('/').pop() || 'index.html';
      if (pagePath && !pagePath.endsWith('.html')) pagePath += '.html';
      var product = PDP_MAP[pagePath];"""

if old_update in sj_content:
    sj_content = sj_content.replace(old_update, new_update)
else:
    print("WARNING: old_update not found in script.js")

with open(sj_path, 'w', encoding='utf-8') as f:
    f.write(sj_content)
print("Updated script.js")

# 4. Update cart.js
cart_path = 'cart.js'
with open(cart_path, 'r', encoding='utf-8') as f:
    cart_content = f.read()

cart_old = '<a class="bag-cta bag-cta-secondary" href="index.html#section-products">Explore Collections</a>'
cart_new = '<a class="bag-cta bag-cta-secondary" href="/#section-products">Explore Collections</a>'

if cart_old in cart_content:
    cart_content = cart_content.replace(cart_old, cart_new)
    with open(cart_path, 'w', encoding='utf-8') as f:
        f.write(cart_content)
    print("Updated cart.js")
else:
    print("WARNING: cart_old not found in cart.js")

# 5. Update HTML files
html_files = sorted(glob.glob('*.html'))
for hf in html_files:
    with open(hf, 'r', encoding='utf-8') as f:
        c = f.read()
    orig = c
    # admin.html back button
    c = c.replace('<a href="index.html" class="btn-back-web">', '<a href="/" class="btn-back-web">')
    # logo-link
    c = c.replace('<a id="logo-link" href="index.html" aria-current="page" class="logo-link">', '<a id="logo-link" href="/" aria-current="page" class="logo-link">')
    c = c.replace('<a id="logo-link" href="index.html" class="logo-link">', '<a id="logo-link" href="/" class="logo-link">')
    # breadcrumb home link
    c = c.replace('<a href="index.html">Home</a>', '<a href="/">Home</a>')

    if c != orig:
        with open(hf, 'w', encoding='utf-8') as f:
            f.write(c)
        print(f"Updated {hf}")

# Ensure home.html is identical to index.html
with open('index.html', 'r', encoding='utf-8') as f:
    idx = f.read()
with open('home.html', 'w', encoding='utf-8') as f:
    f.write(idx)
print("Synced home.html with index.html")
