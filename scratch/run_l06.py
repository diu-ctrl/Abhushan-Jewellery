import urllib.request
import json
import time

BASE_URL = "https://abhushan-by-divyaraj.vercel.app"
API_URL = f"{BASE_URL}/api/cloud-post"

def send_post(body_obj, origin=BASE_URL):
    data = json.dumps(body_obj).encode('utf-8')
    req = urllib.request.Request(
        API_URL,
        data=data,
        headers={
            "Content-Type": "application/json",
            "Origin": origin,
            "User-Agent": "Abhushan-P3-Tester/1.0"
        },
        method="POST"
    )
    try:
        with urllib.request.urlopen(req) as resp:
            status = resp.status
            headers = dict(resp.getheaders())
            body = resp.read().decode('utf-8')
            return status, headers, body
    except urllib.error.HTTPError as e:
        headers = dict(e.headers)
        body = e.read().decode('utf-8')
        return e.code, headers, body

print("=== STARTING L06 LIVE RATE LIMIT TEST ===")

# (a) 1 REAL post
real_payload = {
    "action": "appointment",
    "appointment": {
        "id": "AB-P3-TEST-1",
        "name": "AB-P3-TEST-1",
        "email": "test@abhushan.invalid",
        "phone": "+910000000000",
        "date": "2026-11-11",
        "time": "14:00",
        "service": "Studio Consultation",
        "notes": "P3 Acceptance Test AB-P3-TEST-1",
        "status": "Pending",
        "created_at": "2026-11-11T14:20:00Z"
    }
}

print("\n--- Request 1 (Real Appointment) ---")
s1, h1, b1 = send_post(real_payload)
print(f"Status: {s1}")
print(f"x-ratelimit-limit: {h1.get('x-ratelimit-limit')}")
print(f"x-ratelimit-remaining: {h1.get('x-ratelimit-remaining')}")
print(f"x-ratelimit-reset: {h1.get('x-ratelimit-reset')}")
print(f"Body: {b1}")

# (b) 11 Honeypot posts
honeypot_payload = {
    "action": "appointment",
    "botcheck": "1",
    "appointment": {
        "name": "AB-P3-RATE-TEST"
    }
}

hp_results = []
for i in range(2, 13):
    s, h, b = send_post(honeypot_payload)
    rem = h.get('x-ratelimit-remaining')
    limit = h.get('x-ratelimit-limit')
    reset = h.get('x-ratelimit-reset')
    hp_results.append((i, s, rem, b))
    print(f"Request {i:02d}: Status {s} | remaining={rem} | body={b}")

# (c) Request 13 (Expected 429)
print("\n--- Request 13 (Expected 429 Rate Limit) ---")
s13, h13, b13 = send_post(honeypot_payload)
print(f"Status: {s13}")
print(f"retry-after: {h13.get('retry-after')}")
print(f"x-ratelimit-limit: {h13.get('x-ratelimit-limit')}")
print(f"x-ratelimit-remaining: {h13.get('x-ratelimit-remaining')}")
print(f"x-ratelimit-reset: {h13.get('x-ratelimit-reset')}")
print(f"Body: {b13}")
