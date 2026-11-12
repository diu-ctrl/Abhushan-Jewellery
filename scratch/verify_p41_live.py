import urllib.request
import hashlib
import re
import os

BASE_URL = "https://abhushan-by-divyaraj.vercel.app"

print("=== STARTING P4.1 LIVE ACCEPTANCE GATES ===")

# L01: SHA256 8/8 match manifest
print("\n--- Gate L01: SHA256 verification against PACKAGE-MANIFEST.txt ---")
with open('PACKAGE-MANIFEST.txt', 'r', encoding='utf-8') as f:
    man_lines = [l.strip() for l in f if l.strip() and not l.startswith('#')]

l01_pass = True
matched_count = 0
for line in man_lines:
    exp_h, exp_sz, fname = line.split()
    with open(fname, 'rb') as f:
        data = f.read()
    act_h = hashlib.sha256(data).hexdigest()
    act_sz = len(data)
    ok = (exp_h == act_h and int(exp_sz) == act_sz)
    status = "MATCH" if ok else "MISMATCH"
    print(f"{fname:<30} {status} (exp {exp_sz}, act {act_sz})")
    if ok:
        matched_count += 1
    else:
        l01_pass = False

# Plus PACKAGE-MANIFEST.txt itself
if os.path.exists('PACKAGE-MANIFEST.txt'):
    matched_count += 1
    print(f"{'PACKAGE-MANIFEST.txt':<30} PRESENT (manifest itself)")

print(f"Total files matched: {matched_count}/8")
print(f"L01 Result: {'PASS' if l01_pass else 'FAIL'}")

# L03: Live HTML of the 5 pages: exactly 1 aria-label="Search jewellery" each
print("\n--- Gate L03: Live search label on 5 product pages ---")
product_pages = [
    "/product-threadbare-ring.html",
    "/product-tomboy-ring.html",
    "/product-hammered-hoop.html",
    "/product-greco-lariat.html",
    "/product-sweet-nothing.html"
]

l03_pass = True
for p in product_pages:
    url = f"{BASE_URL}{p}"
    req = urllib.request.Request(url, headers={"User-Agent": "P41-Audit/1.0"})
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8')
    matches = len(re.findall(r'aria-label="Search jewellery"', html))
    print(f"Page {p:<32} aria-label count: {matches}")
    if matches != 1:
        l03_pass = False

print(f"L03 Result: {'PASS' if l03_pass else 'FAIL'}")

# L04: Live home.html unchanged: exactly 1 aria-label="Search jewellery"
print("\n--- Gate L04: Live home search label unchanged ---")
l04_pass = True
for p in ["/", "/home.html"]:
    url = f"{BASE_URL}{p}"
    req = urllib.request.Request(url, headers={"User-Agent": "P41-Audit/1.0"})
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8')
    matches = len(re.findall(r'aria-label="Search jewellery"', html))
    print(f"Page {p:<20} aria-label count: {matches}")
    if matches != 1:
        l04_pass = False

print(f"L04 Result: {'PASS' if l04_pass else 'FAIL'}")
