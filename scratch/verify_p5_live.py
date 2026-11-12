import urllib.request
import hashlib
import re

BASE_URL = "https://abhushan-by-divyaraj.vercel.app"

print("=== STARTING P5 LIVE ACCEPTANCE GATES ===")

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

# L03: live styles.css byte-identical to package styles.css (sha256)
print("\n--- Gate L03: Live styles.css byte-identical to package styles.css ---")
with open('styles.css', 'rb') as f:
    local_css_data = f.read()
local_css_hash = hashlib.sha256(local_css_data).hexdigest()
local_css_len = len(local_css_data)

req = urllib.request.Request(f"{BASE_URL}/styles.css", headers={"User-Agent": "P5-Audit/1.0"})
with urllib.request.urlopen(req) as resp:
    live_css_data = resp.read()
live_css_hash = hashlib.sha256(live_css_data).hexdigest()
live_css_len = len(live_css_data)

print(f"Local styles.css: {local_css_hash} ({local_css_len} bytes)")
print(f"Live  styles.css: {live_css_hash} ({live_css_len} bytes)")
l03_pass = (local_css_hash == live_css_hash and local_css_len == live_css_len)
print(f"L03 Result: {'PASS' if l03_pass else 'FAIL'}")

# L04: live home.html unchanged (still exactly 1 aria-label="Search jewellery", 1 sr-only h1)
print("\n--- Gate L04: Live home.html unchanged (P4 regression check) ---")
l04_pass = True
for p in ["/", "/home.html"]:
    req = urllib.request.Request(f"{BASE_URL}{p}", headers={"User-Agent": "P5-Audit/1.0"})
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8')
    labels = len(re.findall(r'aria-label="Search jewellery"', html))
    h1s = re.findall(r'<h1\b[^>]*>(.*?)</h1>', html, re.DOTALL)
    sr_only_h1 = (len(h1s) == 1 and bool(re.search(r'<h1 class="sr-only">Abhushan', html)))
    print(f"Page {p:<15} search aria-label count: {labels} | total h1: {len(h1s)} | sr-only h1: {sr_only_h1}")
    if labels != 1 or not sr_only_h1:
        l04_pass = False

print(f"L04 Result: {'PASS' if l04_pass else 'FAIL'}")
