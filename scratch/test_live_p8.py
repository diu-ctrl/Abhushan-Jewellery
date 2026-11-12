import urllib.request, hashlib

base = 'https://abhushan-by-divyaraj.vercel.app'
files = ['styles.css', '404.html', 'collection.html', 'story.html', 'privacy.html']

all_ok = True
for f in files:
    url = f"{base}/{f}"
    # fetch live bytes
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    live_bytes = urllib.request.urlopen(req).read()
    # local package bytes
    local_bytes = open(f, 'rb').read()
    
    live_hash = hashlib.sha256(live_bytes).hexdigest()
    local_hash = hashlib.sha256(local_bytes).hexdigest()
    
    ok = (live_hash == local_hash)
    if not ok:
        all_ok = False
    verdict = 'PASS' if ok else 'FAIL'
    print(f"[{verdict}] {f:16} live={live_hash[:12]} local={local_hash[:12]} ({len(live_bytes)} vs {len(local_bytes)} bytes)")

print("\nL03 VERDICT:", "ALL MATCH" if all_ok else "MISMATCH")
