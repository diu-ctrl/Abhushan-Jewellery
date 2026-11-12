import urllib.request
import hashlib
import re

BASE_URL = "https://abhushan-by-divyaraj.vercel.app"

print("=== STARTING P7 LIVE ACCEPTANCE GATES ===")

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
    print(f"{fname:<30} {status} (exp {exp_sz}, act {act_sz})")
    if not ok:
        l01_pass = False

print(f"L01 Result: {'PASS' if l01_pass else 'FAIL'}")

# L03: live styles.css AND all 9 HTML files byte-identical to package files
print("\n--- Gate L03: Live styles.css and all HTML files byte-identical ---")
CHECK_FILES = [
    ("styles.css", "/styles.css"),
    ("404.html", "/404.html"),
    ("home.html", "/home.html"),
    ("collection.html", "/collection.html"),
    ("story.html", "/story.html"),
    ("privacy.html", "/privacy.html"),
    ("product-threadbare-ring.html", "/product-threadbare-ring.html"),
    ("product-tomboy-ring.html", "/product-tomboy-ring.html"),
    ("product-hammered-hoop.html", "/product-hammered-hoop.html"),
    ("product-greco-lariat.html", "/product-greco-lariat.html"),
    ("product-sweet-nothing.html", "/product-sweet-nothing.html"),
]

l03_pass = True
for local_name, url_path in CHECK_FILES:
    with open(local_name, 'rb') as f:
        loc_data = f.read()
    loc_h = hashlib.sha256(loc_data).hexdigest()

    req = urllib.request.Request(f"{BASE_URL}{url_path}", headers={"User-Agent": "P7-Audit/1.0"})
    with urllib.request.urlopen(req) as resp:
        live_data = resp.read()
    live_h = hashlib.sha256(live_data).hexdigest()

    match = (loc_h == live_h and len(loc_data) == len(live_data))
    print(f"{local_name:<30} match: {match} ({len(loc_data)} B)")
    if not match:
        l03_pass = False

print(f"L03 Result: {'PASS' if l03_pass else 'FAIL'}")

# L06: P4 regression: home + 5 product pages still exactly 1 aria-label="Search jewellery" each
print("\n--- Gate L06: P4 search label regression check ---")
SEARCH_PAGES = [
    "/",
    "/home.html",
    "/product-threadbare-ring.html",
    "/product-tomboy-ring.html",
    "/product-hammered-hoop.html",
    "/product-greco-lariat.html",
    "/product-sweet-nothing.html"
]

l06_pass = True
for p in SEARCH_PAGES:
    req = urllib.request.Request(f"{BASE_URL}{p}", headers={"User-Agent": "P7-Audit/1.0"})
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8')
    cnt = len(re.findall(r'aria-label="Search jewellery"', html))
    print(f"Page {p:<32} count: {cnt}")
    if cnt != 1:
        l06_pass = False

print(f"L06 Result: {'PASS' if l06_pass else 'FAIL'}")

# L07: cart.js, cart.css, script.js untouched
print("\n--- Gate L07: cart.js, cart.css, script.js untouched ---")
EXP_HASHES = {
    "script.js": "e9e9ed663dccb217c08a6fcf20d40611d91c99be1af68a41e665786b9e60509f",
    "cart.js": "263769b3add9cf892f460fbca2b70778aa167bdb4c6bc53e07ea8739742ef62c",
    "cart.css": "9aaae2536491132a84aace233680f5946bdbea03f853e78501b8f16c7a7333ac"
}

l07_pass = True
for fname, want in EXP_HASHES.items():
    with open(fname, 'rb') as f:
        data = f.read()
    got = hashlib.sha256(data).hexdigest()
    match = (got == want)
    print(f"{fname:<15} match: {match} (got: {got[:12]}..., want: {want[:12]}...)")
    if not match:
        l07_pass = False

print(f"L07 Result: {'PASS' if l07_pass else 'FAIL'}")
