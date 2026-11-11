#!/usr/bin/env node
/* ============================================================
   ABHUSHAN P3 — offline package self-test (run: node test_p3.js)
   Exits non-zero on any failure. No network, no deps.
   ============================================================ */
const fs = require("fs");
const path = require("path");

let pass = 0, fail = 0;
const failures = [];
function check(id, desc, ok, detail) {
  if (ok) { pass++; console.log(`PASS  ${id}  ${desc}`); }
  else { fail++; failures.push(id); console.log(`FAIL  ${id}  ${desc}  [${detail || ""}]`); }
}
const PKG = __dirname;
const read = (p) => fs.readFileSync(path.join(PKG, p), "utf8");
const readBuf = (p) => fs.readFileSync(path.join(PKG, p));

const PAGES = ["collection.html", "story.html", "product-threadbare-ring.html",
  "product-tomboy-ring.html", "product-hammered-hoop.html",
  "product-greco-lariat.html", "product-sweet-nothing.html"];

/* ---- F2: api/cloud-post.js v3 ---- */
const cp = read("api/cloud-post.js");
check("T01", "v3 rate limit present (12/hour window)", /RL_LIMIT\s*=\s*12/.test(cp) && /RL_WINDOW_MS\s*=\s*60\s*\*\s*60\s*\*\s*1000/.test(cp));
check("T02", "429 + retry-after + x-ratelimit headers", cp.includes("429") && cp.includes("retry-after") && cp.includes("x-ratelimit-limit"));
check("T03", "server-side honeypot drop before upstream forward", /payload\.botcheck\)\s*\{\s*return res\.status\(200\)\.json\(\{ ok: true, dropped: 'honeypot' \}\)/.test(cp) && cp.indexOf("payload.botcheck") < cp.indexOf("// 9. forward"));
check("T04", "v2 behaviour kept: 405 / 403 origin / 413 cap / 400 bad-action", cp.includes("405") && cp.includes("bad-origin") && cp.includes("413") && cp.includes("bad-action"));
check("T05", "client key still stripped, env key injected", /delete payload\.key;/.test(cp) && /payload\.key = key;/.test(cp) && cp.includes("AB_CLOUD_KEY"));
check("T06", "in-memory store pruned when > 5000 entries", cp.includes("rlMap.size > 5000"));

/* ---- F1: 7 pages clean of admin modal ---- */
for (const p of PAGES) {
  const t = read(p);
  const clean = !t.includes("admin-modal-overlay") && !t.includes("admin123") &&
    !t.includes("admin-login-error") && !t.includes("admin-password-input") &&
    !t.includes("admin-login-form");
  check("T07", `${p}: zero admin-modal remnants`, clean);
  check("T08", `${p}: intact document`, t.trim().toLowerCase().startsWith("<!doctype html") && t.includes("</html>"));
}

/* ---- F3: script.js dead wiring removed, P1 behaviour intact ---- */
const sj = read("script.js");
check("T09", "script.js: initFooterSubscribe / footer-subscribe-form removed", !sj.includes("initFooterSubscribe") && !sj.includes("footer-subscribe-form"));
check("T10", "script.js: P1 merged-booking marker + botcheck intact", sj.includes("AB-P1-MERGED-BOOKING") && sj.includes("botcheck"));
const bookingListeners = (sj.match(/bookingForm\.addEventListener\(\s*['"]submit['"]/g) || []).length;
check("T11", "script.js: exactly ONE bookingForm submit listener", bookingListeners === 1, `count=${bookingListeners}`);

/* ---- F4: sitemap.xml ---- */
const sm = read("sitemap.xml");
const locs = (sm.match(/<loc>(.*?)<\/loc>/g) || []).map(s => s.replace(/<\/?loc>/g, ""));
check("T12", "sitemap: exactly 9 URLs", locs.length === 9, `count=${locs.length}`);
check("T13", "sitemap: home loc has NO trailing slash (== canonical)", locs.includes("https://abhushan-by-divyaraj.vercel.app"));
check("T14", "sitemap: no admin/api URLs", !locs.some(u => u.includes("admin") || u.includes("/api/")));

/* ---- manifest sanity ---- */
const man = read("PACKAGE-MANIFEST.txt");
check("T15", "PACKAGE-MANIFEST lists all package files", PAGES.every(p => man.includes(p)) &&
  ["api/cloud-post.js", "script.js", "sitemap.xml", "test_p3.js", "ABHUSHAN-P3-PROMPT.md"].every(p => man.includes(p)));

console.log(`\nRESULT: PASS ${pass} / FAIL ${fail}`);
if (fail > 0) { console.log("FAILED:", failures.join(", ")); process.exit(1); }
