import zipfile
import shutil
import os

zip_path = r'C:\Users\levol\.gemini\antigravity\brain\34fdaebb-905d-4cbc-af08-0de9ae12490d\.user_uploaded\media_1794421159387_c4b66fbe.zip'
pkg_dir = r'c:\Users\levol\Desktop\Websites folder\Abhushan\scratch\pkg_p7'
repo_dir = r'c:\Users\levol\Desktop\Websites folder\Abhushan'

os.makedirs(pkg_dir, exist_ok=True)
with zipfile.ZipFile(zip_path, 'r') as z:
    z.extractall(pkg_dir)

files = [
    'styles.css',
    '404.html',
    'home.html',
    'collection.html',
    'story.html',
    'privacy.html',
    'product-threadbare-ring.html',
    'product-tomboy-ring.html',
    'product-hammered-hoop.html',
    'product-greco-lariat.html',
    'product-sweet-nothing.html',
    'test_p7.js',
    'ABHUSHAN-P7-PROMPT.md',
    'PACKAGE-MANIFEST.txt'
]

for f in files:
    src = os.path.join(pkg_dir, f)
    dst = os.path.join(repo_dir, f)
    shutil.copy2(src, dst)
    print(f'Applied: {f}')

# Synchronize index.html with home.html
shutil.copy2(os.path.join(repo_dir, 'home.html'), os.path.join(repo_dir, 'index.html'))
print('Synchronized index.html with home.html')
