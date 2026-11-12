import glob
import re

html_files = glob.glob('*.html')
for f in sorted(html_files):
    with open(f, 'r', encoding='utf-8') as fp:
        content = fp.read()
    index_links = len(re.findall(r'href=[\'"](?:/)?index\.html[\'"]', content))
    home_links = len(re.findall(r'href=[\'"](?:/)?home\.html[\'"]', content))
    slash_links = len(re.findall(r'href=[\'"]/[\'"]', content))
    print(f"{f:<30} index.html: {index_links} | home.html: {home_links} | /: {slash_links}")
