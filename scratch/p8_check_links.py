import os

for f in ['collection.html', 'story.html', 'privacy.html', '404.html']:
    p = os.path.join('scratch', 'p8_extracted', f)
    with open(p, 'r', encoding='utf-8') as file:
        for idx, line in enumerate(file, 1):
            if 'logo-link' in line or 'index.html' in line or 'href="/"' in line:
                print(f"{f}:{idx}: {line.strip()}")
