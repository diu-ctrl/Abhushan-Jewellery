import zipfile
import hashlib
import os

zip_path = r'C:\Users\levol\.gemini\antigravity\brain\34fdaebb-905d-4cbc-af08-0de9ae12490d\.user_uploaded\media_1794413800040_0221419f.zip'
with zipfile.ZipFile(zip_path, 'r') as z:
    man_raw = z.read('PACKAGE-MANIFEST.txt').decode('utf-8')
    manifest_lines = [l.strip() for l in man_raw.splitlines() if l.strip() and not l.startswith('#')]
    
    print('Checking zip files against PACKAGE-MANIFEST.txt:')
    all_match = True
    for line in manifest_lines:
        exp_hash, exp_size, fname = line.split()
        data = z.read(fname)
        act_hash = hashlib.sha256(data).hexdigest()
        act_size = len(data)
        ok = (exp_hash == act_hash and int(exp_size) == act_size)
        res = "MATCH" if ok else "MISMATCH"
        print(f"{fname:<32} expected: {exp_size:>6} actual: {act_size:>6} {res}")
        if not ok:
            all_match = False
    print('\nL01 Check result in zip:', 'PASS' if all_match else 'FAIL')
