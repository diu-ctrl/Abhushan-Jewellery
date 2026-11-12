import urllib.request, re

html = urllib.request.urlopen('https://abhushan-by-divyaraj.vercel.app/').read().decode('utf-8')
matches = re.findall(r'href=[\"\'][^\"\']*index\.html[^\"\']*[\"\']', html)
print('Remaining index.html hrefs on live homepage:', matches)

matches_all = re.findall(r'index\.html', html)
print('Total index.html occurrences on live homepage:', len(matches_all))
