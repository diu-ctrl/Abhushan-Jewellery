import urllib.request, re

html = urllib.request.urlopen('https://abhushan-by-divyaraj.vercel.app/story').read().decode('utf-8')
matches = re.findall(r'href=[\"\'][^\"\']*index\.html[^\"\']*[\"\']', html)
print('Remaining index.html hrefs on story page:', matches)

matches_all = re.findall(r'index\.html', html)
print('Total index.html occurrences on story page:', len(matches_all))
