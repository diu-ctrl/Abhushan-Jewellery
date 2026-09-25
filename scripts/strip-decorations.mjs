import fs from 'fs';
import path from 'path';
// Emojis, pictographs, dingbats, arrows, variation selectors, ZWJ - stripped from HTML.
const DECOR = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2190}-\u{21FF}\u{FE00}-\u{FE0F}\u{200D}\u{203C}\u{2049}\u{2764}\u{2B50}]/gu;
let changed = 0;
function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    const st = fs.statSync(p);
    if (st.isDirectory()) { if (f !== 'node_modules' && f !== '.git' && f !== 'assets' && f !== 'scripts') walk(p); continue; }
    if (!f.toLowerCase().endsWith('.html')) continue;
    const before = fs.readFileSync(p, 'utf8');
    const after = before.replace(DECOR, '');
    if (after !== before) { fs.writeFileSync(p, after, 'utf8'); changed++; console.log('cleaned:', p); }
  }
}
walk('.');
console.log('files changed:', changed);
