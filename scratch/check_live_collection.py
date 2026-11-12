import urllib.request, re

html = urllib.request.urlopen('https://abhushan-by-divyaraj.vercel.app/collection').read().decode('utf-8')
matches = re.findall(r'href=[\"\'][^\"\']*index\.html[^\"\']*[\"\']', html)
print('Remaining index.html hrefs on collection page:', matches)

matches_all = re.findall(r'index\.html', html)
print('Total index.html occurrences on collection page:', len(matches_all))
