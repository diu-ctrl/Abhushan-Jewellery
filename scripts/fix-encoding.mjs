import fs from 'fs';
import path from 'path';

const MAP = new Map([
  // Each key is the mojibake of one real character (UTF-8 bytes mis-read as cp1252).
  ['\u00E2\u201A\u00B9', '\u20B9'],   // mojibake of the rupee sign
  ['\u00E2\u017E\u201D', ''],          // mojibake of the heavy arrow glyph - removed entirely
  ['\u00E2\u20AC\u2019', '\u2019'],    // right single quote (apostrophe)
  ['\u00E2\u20AC\u2018', '\u2018'],    // left single quote
  ['\u00E2\u20AC\u0153', '\u201C'],    // left double quote
  ['\u00E2\u20AC\u201D', '\u2014'],    // em dash
  ['\u00E2\u20AC\u201C', '\u2013'],    // en dash
  ['\u00E2\u20AC\u00A6', '\u2026'],    // ellipsis
  ['\u00E2\u20AC\u00A2', '\u2022'],    // bullet
  ['\u00E2\u20AC\u00B9', '\u2039'],    // left single guillemet
  ['\u00E2\u20AC\u00BA', '\u203A'],    // right single guillemet
  ['\u00E2\u201E\u00A2', '\u2122'],    // trademark
  // Safety net: same sequences when the third byte was kept as a C1 control
  ['\u00E2\u20AC\u0093', '\u2013'],
  ['\u00E2\u20AC\u0094', '\u2014'],
  ['\u00E2\u20AC\u0098', '\u2018'],
  ['\u00E2\u20AC\u0099', '\u2019'],
  ['\u00E2\u20AC\u009C', '\u201C'],
  ['\u00E2\u20AC\u009D', '\u201D'],
  ['\u00C2\u00A0', ' '],                // non-breaking space artifact -> normal space
  ['\u00C2\u00B0', '\u00B0'], ['\u00C2\u00AE', '\u00AE'], ['\u00C2\u00A9', '\u00A9'],
  ['\u00C2\u00AB', '\u00AB'], ['\u00C2\u00BB', '\u00BB'], ['\u00C2\u00B7', '\u00B7'],
  ['\u00C2\u00B4', '\u00B4'], ['\u00C2\u00B8', '\u00B8']
]);

function fixText(t) {
  for (const [k, v] of MAP) t = t.split(k).join(v);
  t = t.replace(/[\u0090-\u009F\u0080-\u008F]/g, '');  // stray C1 controls
  t = t.replace(/\u00C2(?![\u0080-\u00BF])/g, '');      // lone Â
  return t;
}

const exts = ['.html', '.js', '.css'];
const skipDirs = new Set(['node_modules', '.git', 'assets']);
let changed = 0;
function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    const st = fs.statSync(p);
    if (st.isDirectory()) { if (!skipDirs.has(f)) walk(p); continue; }
    if (!exts.includes(path.extname(f).toLowerCase())) continue;
    const before = fs.readFileSync(p, 'utf8');
    const after = fixText(before);
    if (after !== before) { fs.writeFileSync(p, after, 'utf8'); changed++; console.log('fixed:', p); }
  }
}
walk('.');
console.log('files changed:', changed);
