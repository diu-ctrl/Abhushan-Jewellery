import urllib.request

base = 'https://abhushan-by-divyaraj.vercel.app'
for p in ['collection.html', 'story.html', 'privacy.html']:
    html = urllib.request.urlopen(base + '/' + p).read().decode('utf-8')
    has_maincontent = 'id="maincontent"' in html
    has_skip = 'href="#maincontent"' in html
    has_logo_current = 'aria-current="page"' in html and 'id="logo-link"' in html and 'id="logo-link" href="index.html" aria-current="page"' in html
    print(p, 'maincontent:', has_maincontent, 'skip:', has_skip, 'logo_current:', has_logo_current)
