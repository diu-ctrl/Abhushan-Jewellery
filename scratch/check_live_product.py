import urllib.request, re

html = urllib.request.urlopen('https://abhushan-by-divyaraj.vercel.app/product-threadbare-ring').read().decode('utf-8')
matches = re.findall(r'href=[\"\'][^\"\']*index\.html[^\"\']*[\"\']', html)
print('Remaining index.html hrefs on product page:', matches)

matches_all = re.findall(r'index\.html', html)
print('Total index.html occurrences on product page:', len(matches_all))
