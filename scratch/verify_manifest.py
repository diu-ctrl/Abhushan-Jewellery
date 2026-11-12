import hashlib
import os

with open('PACKAGE-MANIFEST.txt', 'r', encoding='utf-8') as f:
    lines = [line.strip() for line in f if line.strip() and not line.startswith('#')]

all_match = True
for line in lines:
    parts = line.split()
    expected_hash = parts[0]
    expected_size = int(parts[1])
    relpath = parts[2]
    with open(relpath, 'rb') as f:
        data = f.read()
    actual_hash = hashlib.sha256(data).hexdigest()
    actual_size = len(data)
    match = (actual_hash == expected_hash and actual_size == expected_size)
    status = "MATCH" if match else f"MISMATCH (expected {expected_hash}, got {actual_hash})"
    print(f"{relpath}: {status} ({actual_size} bytes)")
    if not match:
        all_match = False

print(f"\nL01 OVERALL: {'PASS' if all_match else 'FAIL'}")
