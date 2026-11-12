import urllib.request

req = urllib.request.Request(
    'https://abhushan-by-divyaraj.vercel.app/api/cloud-post',
    data=b'{"action":"appointment","botcheck":"1"}',
    headers={'Content-Type': 'application/json', 'Origin': 'https://abhushan-by-divyaraj.vercel.app'},
    method='POST'
)

try:
    with urllib.request.urlopen(req) as resp:
        for k, v in resp.headers.items():
            print(f"{k}: {v}")
except urllib.error.HTTPError as e:
    print(f"Status: {e.code}")
    for k, v in e.headers.items():
        print(f"{k}: {v}")
