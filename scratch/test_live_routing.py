import urllib.request, urllib.error

base = 'https://abhushan-by-divyaraj.vercel.app'

class NoRedirectHandler(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None  # Do not follow redirect so we can inspect status and location

opener = urllib.request.build_opener(NoRedirectHandler)

tests = [
    ('/index.html', 308, '/'),
    ('/index', 308, '/'),
    ('/home.html', 308, '/'),
    ('/home', 308, '/'),
    ('/', 200, None),
    ('/collection', 200, None),
    ('/collection.html', 308, '/collection'),
    ('/story', 200, None),
    ('/product-threadbare-ring', 200, None),
    ('/admin', 401, None),
    ('/admin.html', 401, None),
]

all_passed = True
for path, expected_status, expected_loc in tests:
    url = base + path
    try:
        resp = opener.open(url)
        status = resp.status
        loc = resp.headers.get('Location')
    except urllib.error.HTTPError as e:
        status = e.code
        loc = e.headers.get('Location')
    
    status_ok = (status == expected_status)
    loc_ok = (expected_loc is None) or (loc == expected_loc or loc == (base + expected_loc))
    ok = status_ok and loc_ok
    if not ok:
        all_passed = False
    verdict = 'PASS' if ok else 'FAIL'
    print(f"[{verdict}] {path:25} -> status {status} (exp {expected_status}), Location: {loc}")

if all_passed:
    print("\nALL LIVE ROUTING CHECKS PASSED!")
else:
    print("\nSOME CHECKS FAILED.")
