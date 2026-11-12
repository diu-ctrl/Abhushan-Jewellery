import shutil
import os

pkg_dir = r'c:\Users\levol\Desktop\Websites folder\Abhushan\scratch\pkg_p4'
repo_dir = r'c:\Users\levol\Desktop\Websites folder\Abhushan'

files = [
    'home.html',
    'collection.html',
    'story.html',
    'product-threadbare-ring.html',
    'product-tomboy-ring.html',
    'product-hammered-hoop.html',
    'product-greco-lariat.html',
    'product-sweet-nothing.html',
    'script.js',
    'styles.css',
    'cart.css',
    'test_p4.js',
    'ABHUSHAN-P4-PROMPT.md',
    'PACKAGE-MANIFEST.txt'
]

for f in files:
    src = os.path.join(pkg_dir, f)
    dst = os.path.join(repo_dir, f)
    shutil.copy2(src, dst)
    print(f'Copied {f}')

# Synchronize index.html with home.html
shutil.copy2(os.path.join(repo_dir, 'home.html'), os.path.join(repo_dir, 'index.html'))
print('Synchronized index.html with home.html')
