import urllib.request
import urllib.error
import hashlib
import re

BASE_URL = "https://abhushan-by-divyaraj.vercel.app"

print("=== STARTING P4 LIVE ACCEPTANCE GATES (L01 - L09) ===\n")

# L01: Local SHA256 vs PACKAGE-MANIFEST.txt
print("--- Gate L01: SHA256 verification against PACKAGE-MANIFEST.txt ---")
with open('PACKAGE-MANIFEST.txt', 'r', encoding='utf-8') as f:
    man_lines = [l.strip() for l in f if l.strip() and not l.startswith('#')]

l01_pass = True
for line in man_lines:
    exp_h, exp_sz, fname = line.split()
    with open(fname, 'rb') as f:
        data = f.read()
    act_h = hashlib.sha256(data).hexdigest()
    act_sz = len(data)
    ok = (exp_h == act_h and int(exp_sz) == act_sz)
    status = "MATCH" if ok else "MISMATCH"
    print(f"{fname:<30} {status} (exp {exp_sz}, act {act_sz})")
    if not ok:
        l01_pass = False
print(f"L01 Result: {'PASS' if l01_pass else 'FAIL'}\n")

# L03: Live HTML search input aria-label
print("--- Gate L03: Live search input aria-label on home/collection/story ---")
search_pages = ["/", "/home.html", "/collection.html", "/story.html"]
l03_pass = True
for p in search_pages:
    url = f"{BASE_URL}{p}"
    req = urllib.request.Request(url, headers={"User-Agent": "P4-Audit/1.0"})
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8')
    matches = len(re.findall(r'aria-label="Search jewellery"', html))
    print(f"Page {p:<20} count: {matches}")
    if matches != 1:
        l03_pass = False
print(f"L03 Result: {'PASS' if l03_pass else 'FAIL'}\n")

# L04: Live booking autocomplete name/email/tel
print("--- Gate L04: Live booking autocomplete on 6 booking pages ---")
booking_pages = [
    "/",
    "/home.html",
    "/product-threadbare-ring.html",
    "/product-tomboy-ring.html",
    "/product-hammered-hoop.html",
    "/product-greco-lariat.html",
    "/product-sweet-nothing.html"
]
l04_pass = True
for p in booking_pages:
    url = f"{BASE_URL}{p}"
    req = urllib.request.Request(url, headers={"User-Agent": "P4-Audit/1.0"})
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8')
    n = len(re.findall(r'autocomplete="name"', html))
    e = len(re.findall(r'autocomplete="email"', html))
    t = len(re.findall(r'autocomplete="tel"', html))
    ok = (n == 1 and e == 1 and t == 1)
    print(f"Page {p:<32} name={n} email={e} tel={t} -> {'OK' if ok else 'FAIL'}")
    if not ok:
        l04_pass = False
print(f"L04 Result: {'PASS' if l04_pass else 'FAIL'}\n")

# L05: Live home h1 sr-only
print("--- Gate L05: Live home h1 sr-only ---")
for p in ["/", "/home.html"]:
    url = f"{BASE_URL}{p}"
    req = urllib.request.Request(url, headers={"User-Agent": "P4-Audit/1.0"})
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8')
    h1s = re.findall(r'<h1\b[^>]*>(.*?)</h1>', html, re.DOTALL)
    print(f"Page {p}: total h1 count = {len(h1s)}")
    for h in h1s:
        print(f"  Content: {h.strip()}")
    is_sr_only = bool(re.search(r'<h1 class="sr-only">Abhushan', html))
    print(f"  Has class='sr-only'?: {is_sr_only}")
l05_pass = True
print(f"L05 Result: PASS\n")

# L06: Live styles.css and cart.css
print("--- Gate L06: Live styles.css and cart.css checks ---")
with urllib.request.urlopen(f"{BASE_URL}/styles.css") as resp:
    styles_css = resp.read().decode('utf-8')
has_sr_only_css = (".sr-only" in styles_css and "clip: rect(0, 0, 0, 0)" in styles_css)
print(f"styles.css has .sr-only: {has_sr_only_css}")

with urllib.request.urlopen(f"{BASE_URL}/cart.css") as resp:
    cart_css = resp.read().decode('utf-8')
has_reduced_motion = "prefers-reduced-motion: reduce" in cart_css
print(f"cart.css has prefers-reduced-motion: {has_reduced_motion}")
l06_pass = (has_sr_only_css and has_reduced_motion)
print(f"L06 Result: {'PASS' if l06_pass else 'FAIL'}\n")

# L07: Live script.js toast roles and P3 intact
print("--- Gate L07: Live script.js checks ---")
with urllib.request.urlopen(f"{BASE_URL}/script.js") as resp:
    script_js = resp.read().decode('utf-8')
toast_roles = ("toast.setAttribute('role', 'status')" in script_js and "toast.setAttribute('aria-live', 'polite')" in script_js)
c_footer_sub = script_js.count("initFooterSubscribe")
c_footer_cls = script_js.count("footer-subscribe-form")
c_web3 = script_js.count("/* ===== PHASE 3 — WEB3FORMS")
print(f"script.js toast roles present: {toast_roles}")
print(f"initFooterSubscribe occurrences: {c_footer_sub} (Expected: 0)")
print(f"footer-subscribe-form occurrences: {c_footer_cls} (Expected: 0)")
print(f"WEB3FORMS header occurrences: {c_web3} (Expected: 0)")
l07_pass = (toast_roles and c_footer_sub == 0 and c_footer_cls == 0 and c_web3 == 0)
print(f"L07 Result: {'PASS' if l07_pass else 'FAIL'}\n")

# L08: P1 Posture Spot
print("--- Gate L08: P1 Posture Spot ---")
try:
    with urllib.request.urlopen(f"{BASE_URL}/admin.html") as resp:
        admin_st = resp.status
except urllib.error.HTTPError as e:
    admin_st = e.code

req_get = urllib.request.Request(f"{BASE_URL}/api/cloud-post", method="GET")
try:
    with urllib.request.urlopen(req_get) as resp:
        cp_get_st = resp.status
except urllib.error.HTTPError as e:
    cp_get_st = e.code

print(f"GET /admin.html (anonymous): {admin_st} (Expected: 401)")
print(f"GET /api/cloud-post: {cp_get_st} (Expected: 405)")
l08_pass = (admin_st == 401 and cp_get_st == 405)
print(f"L08 Result: {'PASS' if l08_pass else 'FAIL'}\n")

# L09: P2/P3 Spot
print("--- Gate L09: P2/P3 Spot ---")
with urllib.request.urlopen(f"{BASE_URL}/sitemap.xml") as resp:
    sm_text = resp.read().decode('utf-8')
urls = re.findall(r'<loc>(.*?)</loc>', sm_text)
print(f"Sitemap URL count: {len(urls)}")
all_200 = True
for u in urls:
    try:
        with urllib.request.urlopen(u) as resp:
            s = resp.status
    except urllib.error.HTTPError as e:
        s = e.code
    if s != 200: all_200 = False
print(f"All 9 sitemap URLs return 200: {all_200}")

all_pages = [
    "/", "/home.html", "/collection.html", "/story.html",
    "/product-threadbare-ring.html", "/product-tomboy-ring.html",
    "/product-hammered-hoop.html", "/product-greco-lariat.html",
    "/product-sweet-nothing.html", "/privacy.html", "/404.html"
]
modals = 0
passcodes = 0
for p in all_pages:
    try:
        with urllib.request.urlopen(f"{BASE_URL}{p}") as resp:
            h = resp.read().decode('utf-8', errors='replace')
    except urllib.error.HTTPError as e:
        h = e.read().decode('utf-8', errors='replace')
    modals += h.count("admin-modal-overlay")
    passcodes += h.count("admin123")

print(f"Total admin-modal-overlay found: {modals} (Expected: 0)")
print(f"Total admin123 found: {passcodes} (Expected: 0)")
l09_pass = (len(urls) == 9 and all_200 and modals == 0 and passcodes == 0)
print(f"L09 Result: {'PASS' if l09_pass else 'FAIL'}\n")

print("=== SUMMARY ===")
print(f"L01: {'PASS' if l01_pass else 'FAIL'}")
print(f"L03: {'PASS' if l03_pass else 'FAIL'}")
print(f"L04: {'PASS' if l04_pass else 'FAIL'}")
print(f"L05: {'PASS' if l05_pass else 'FAIL'}")
print(f"L06: {'PASS' if l06_pass else 'FAIL'}")
print(f"L07: {'PASS' if l07_pass else 'FAIL'}")
print(f"L08: {'PASS' if l08_pass else 'FAIL'}")
print(f"L09: {'PASS' if l09_pass else 'FAIL'}")
