import glob
import re

html_files = glob.glob('*.html')
all_hrefs = set()
file_hrefs = {}

for f in sorted(html_files):
    with open(f, 'r', encoding='utf-8') as fp:
        content = fp.read()
    hrefs = re.findall(r'href=[\'"]([^\'"]+)[\'"]', content)
    file_hrefs[f] = hrefs
    for h in hrefs:
        if not h.startswith(('http', '#', 'mailto:', 'tel:', 'whatsapp:')):
            all_hrefs.add(h)

print("Unique internal hrefs across all HTML files:")
for h in sorted(all_hrefs):
    print(f"  {h}")
