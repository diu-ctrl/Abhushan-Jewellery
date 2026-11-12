import glob
import re

for f in sorted(glob.glob('*.html')):
    with open(f, 'r', encoding='utf-8') as fp:
        txt = fp.read()
    m = re.search(r'<link\s+rel=["\']canonical["\']\s+href=["\']([^"\']+)["\']', txt)
    if m:
        print(f"{f:<30} canonical: {m.group(1)}")
    else:
        print(f"{f:<30} NO CANONICAL")
