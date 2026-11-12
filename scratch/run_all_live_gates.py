import urllib.request
import urllib.error
import re
import xml.etree.ElementTree as ET

BASE_URL = "https://abhushan-by-divyaraj.vercel.app"

PAGES = [
    "/",
    "/collection.html",
    "/product-threadbare-ring.html",
    "/product-tomboy-ring.html",
    "/product-hammered-hoop.html",
    "/product-greco-lariat.html",
    "/product-sweet-nothing.html",
    "/story.html",
    "/privacy.html",
    "/404.html"
]

SECRETS = ["admin123", "abhushan2026", "AbhushanStudio_2026", "script.google.com"]

results = {}

print("=== STARTING LIVE AUDIT GATES (L03 - L10) ===\n")

# --- L03 & L04 & L05: Fetch all 10 URLs and scan ---
print("--- L03 / L04 / L05: Fetch and Scan 9 Pages + 404.html ---")
page_contents = {}
secret_scan_results = {}
modal_scan_results = {}
status_codes = {}

for path in PAGES:
    url = f"{BASE_URL}{path}"
    req = urllib.request.Request(url, headers={"User-Agent": "Abhushan-Audit/1.0"})
    try:
        with urllib.request.urlopen(req) as resp:
            status = resp.status
            content = resp.read().decode('utf-8', errors='replace')
    except urllib.error.HTTPError as e:
        status = e.code
        content = e.read().decode('utf-8', errors='replace')

    status_codes[path] = status
    page_contents[path] = content

    # L03: Secrets
    sec_counts = {sec: content.count(sec) for sec in SECRETS}
    secret_scan_results[path] = sec_counts

    # L04: Modal remnant
    modal_count = content.count("admin-modal-overlay")
    modal_scan_results[path] = modal_count

    print(f"Page: {path:<32} | Status: {status} | modal remnants: {modal_count} | secrets: {sum(sec_counts.values())}")

# Summary for L03
total_secrets = sum(sum(sc.values()) for sc in secret_scan_results.values())
results['L03'] = (total_secrets == 0)
print(f"\nL03 Secret Scan Result: {'PASS' if results['L03'] else 'FAIL'} (total found: {total_secrets})")

# Summary for L04
total_modals = sum(modal_scan_results.values())
results['L04'] = (total_modals == 0)
print(f"L04 Modal Scan Result: {'PASS' if results['L04'] else 'FAIL'} (total found: {total_modals})")

# Summary for L05
REPLACED_PAGES = [
    "/collection.html",
    "/story.html",
    "/product-threadbare-ring.html",
    "/product-tomboy-ring.html",
    "/product-hammered-hoop.html",
    "/product-greco-lariat.html",
    "/product-sweet-nothing.html"
]
all_200 = all(status_codes[p] == 200 for p in REPLACED_PAGES)
results['L05'] = all_200
print(f"L05 7 Replaced Pages Status 200: {'PASS' if all_200 else 'FAIL'}")


# --- L08: P1 Posture Preserved ---
print("\n--- L08: P1 Posture Checks ---")
# 1. /admin.html anon -> 401
try:
    with urllib.request.urlopen(f"{BASE_URL}/admin.html") as resp:
        admin_anon_status = resp.status
except urllib.error.HTTPError as e:
    admin_anon_status = e.code
print(f"/admin.html anonymous status: {admin_anon_status} (Expected: 401)")

# 2. evil origin POST -> 403
req_evil = urllib.request.Request(
    f"{BASE_URL}/api/cloud-post",
    data=b'{"action":"appointment"}',
    headers={"Content-Type": "application/json", "Origin": "https://evil.example.com"},
    method="POST"
)
try:
    with urllib.request.urlopen(req_evil) as resp:
        evil_status = resp.status
except urllib.error.HTTPError as e:
    evil_status = e.code
print(f"/api/cloud-post evil origin POST status: {evil_status} (Expected: 403)")

# 3. GET /api/cloud-post -> 405
req_get = urllib.request.Request(f"{BASE_URL}/api/cloud-post", method="GET")
try:
    with urllib.request.urlopen(req_get) as resp:
        get_status = resp.status
except urllib.error.HTTPError as e:
    get_status = e.code
print(f"/api/cloud-post GET status: {get_status} (Expected: 405)")

# 4. Security headers on /
req_home = urllib.request.Request(f"{BASE_URL}/")
with urllib.request.urlopen(req_home) as resp:
    home_headers = {k.lower(): v for k, v in resp.headers.items()}

sec_headers_present = (
    "x-frame-options" in home_headers and
    "x-content-type-options" in home_headers and
    "strict-transport-security" in home_headers and
    "referrer-policy" in home_headers
)
print(f"Security headers on / present: {sec_headers_present}")
results['L08'] = (admin_anon_status == 401 and evil_status == 403 and get_status == 405 and sec_headers_present)
print(f"L08 Result: {'PASS' if results['L08'] else 'FAIL'}")


# --- L09: Sitemap Live ---
print("\n--- L09: Sitemap Live ---")
req_sm = urllib.request.Request(f"{BASE_URL}/sitemap.xml")
with urllib.request.urlopen(req_sm) as resp:
    sm_xml = resp.read().decode('utf-8')

root = ET.fromstring(sm_xml)
locs = [el.text for el in root.iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
print(f"Sitemap URL count: {len(locs)}")
print(f"Home loc in sitemap: {locs[0]}")
home_loc_exact = (locs[0] == "https://abhushan-by-divyaraj.vercel.app")
all_locs_200 = True
for loc in locs:
    try:
        with urllib.request.urlopen(loc) as r:
            st = r.status
    except urllib.error.HTTPError as e:
        st = e.code
    if st != 200:
        all_locs_200 = False
    print(f"  {loc} -> {st}")

results['L09'] = (len(locs) == 9 and home_loc_exact and all_locs_200)
print(f"L09 Result: {'PASS' if results['L09'] else 'FAIL'}")


# --- L10: P2 Spot-Checks ---
print("\n--- L10: P2 Spot-Checks ---")
def check_p2_page(path):
    content = page_contents[path]
    c_match = re.search(r'<link\s+rel=["\']canonical["\']\s+href=["\']([^"\']+)["\']', content)
    og_url_match = re.search(r'<meta\s+property=["\']og:url["\']\s+content=["\']([^"\']+)["\']', content)
    tw_url_match = re.search(r'<meta\s+(?:property|name)=["\']twitter:url["\']\s+content=["\']([^"\']+)["\']', content)
    og_img_match = re.search(r'<meta\s+property=["\']og:image["\']\s+content=["\']([^"\']+)["\']', content)

    canon = c_match.group(1) if c_match else None
    og_u = og_url_match.group(1) if og_url_match else None
    tw_u = tw_url_match.group(1) if tw_url_match else None
    og_img = og_img_match.group(1) if og_img_match else None

    # check og:image 200
    img_status = None
    if og_img:
        try:
            with urllib.request.urlopen(og_img) as resp:
                img_status = resp.status
        except urllib.error.HTTPError as e:
            img_status = e.code

    urls_match = (canon == og_u == tw_u)
    print(f"Page {path}:")
    print(f"  canonical:   {canon}")
    print(f"  og:url:      {og_u}")
    print(f"  twitter:url: {tw_u}")
    print(f"  og:image:    {og_img} (status: {img_status})")
    print(f"  Match: {urls_match}, img 200: {img_status == 200}")
    return urls_match and (img_status == 200)

p2_coll = check_p2_page("/collection.html")
p2_prod = check_p2_page("/product-threadbare-ring.html")
results['L10'] = (p2_coll and p2_prod)
print(f"L10 Result: {'PASS' if results['L10'] else 'FAIL'}")
