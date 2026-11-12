import urllib.request
import hashlib
import re

BASE_URL = "https://abhushan-by-divyaraj.vercel.app"

print("=== STARTING P6 LIVE ACCEPTANCE GATES ===")

# L01: SHA256 of all manifest files match after copy
print("\n--- Gate L01: SHA256 verification against PACKAGE-MANIFEST.txt ---")
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
    print(f"{fname:<25} {status} (exp {exp_sz}, act {act_sz})")
    if not ok:
        l01_pass = False

print(f"L01 Result: {'PASS' if l01_pass else 'FAIL'}")

# L03: live script.js AND live styles.css byte-identical to package files
print("\n--- Gate L03: Live script.js and styles.css byte-identical ---")
# styles.css
with open('styles.css', 'rb') as f:
    loc_css = f.read()
loc_css_h = hashlib.sha256(loc_css).hexdigest()

req_c = urllib.request.Request(f"{BASE_URL}/styles.css", headers={"User-Agent": "P6-Audit/1.0"})
with urllib.request.urlopen(req_c) as resp:
    live_css = resp.read()
live_css_h = hashlib.sha256(live_css).hexdigest()

css_match = (loc_css_h == live_css_h and len(loc_css) == len(live_css))
print(f"styles.css local: {loc_css_h} ({len(loc_css)} B)")
print(f"styles.css live:  {live_css_h} ({len(live_css)} B)")
print(f"styles.css match: {css_match}")

# script.js
with open('script.js', 'rb') as f:
    loc_js = f.read()
loc_js_h = hashlib.sha256(loc_js).hexdigest()

req_j = urllib.request.Request(f"{BASE_URL}/script.js", headers={"User-Agent": "P6-Audit/1.0"})
with urllib.request.urlopen(req_j) as resp:
    live_js = resp.read()
live_js_h = hashlib.sha256(live_js).hexdigest()

js_match = (loc_js_h == live_js_h and len(loc_js) == len(live_js))
print(f"script.js local: {loc_js_h} ({len(loc_js)} B)")
print(f"script.js live:  {live_js_h} ({len(live_js)} B)")
print(f"script.js match: {js_match}")

l03_pass = (css_match and js_match)
print(f"L03 Result: {'PASS' if l03_pass else 'FAIL'}")

# L05: P4 regression: home + 5 product pages still exactly 1 aria-label="Search jewellery" each
print("\n--- Gate L05: P4 search label regression check ---")
pages = [
    "/",
    "/home.html",
    "/product-threadbare-ring.html",
    "/product-tomboy-ring.html",
    "/product-hammered-hoop.html",
    "/product-greco-lariat.html",
    "/product-sweet-nothing.html"
]

l05_pass = True
for p in pages:
    req = urllib.request.Request(f"{BASE_URL}{p}", headers={"User-Agent": "P6-Audit/1.0"})
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8')
    cnt = len(re.findall(r'aria-label="Search jewellery"', html))
    print(f"Page {p:<32} aria-label count: {cnt}")
    if cnt != 1:
        l05_pass = False

print(f"L05 Result: {'PASS' if l05_pass else 'FAIL'}")

# G-C check in live script.js
print("\n--- G-C proof: initWishlist reference error fix in live script.js ---")
live_js_str = live_js.decode('utf-8')
has_bare_call = bool(re.search(r'\n\s*initWishlist\(\);', live_js_str))
has_comment = "P6 G-C fix: initWishlist() call removed" in live_js_str
print(f"Live script.js has bare initWishlist(); call: {has_bare_call} (Expected: False)")
print(f"Live script.js has P6 G-C fix comment: {has_comment} (Expected: True)")
