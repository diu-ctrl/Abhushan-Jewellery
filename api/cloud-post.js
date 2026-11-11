/* ============================================================
   ABHUSHAN P3 — /api/cloud-post v3 (hardening: rate limit + honeypot)
   ============================================================
   v2 behaviour preserved: action whitelist, 16KB cap, same-site
   origin check, client `key` stripped, env key injected.

   NEW in v3:
   1. Per-IP fixed-window rate limit: 12 requests / hour / IP.
      Counted AFTER the origin gate (so foreign-origin 403s do not
      consume quota), before the body is read (413s count).
      Store: in-memory Map on the serverless instance.
      HONEST SCOPE: per-instance, resets on cold start / deploy.
      At this site's traffic level a single warm instance serves
      effectively all requests; this stops scripted flooding the
      way an unbounded endpoint would not. Persistent store would
      require a paid KV — out of scope ($0 constraint).
   2. Server-side honeypot drop: payload.botcheck truthy ->
      200 {ok:true, dropped:'honeypot'} WITHOUT forwarding upstream
      (silent, indistinguishable from success for bots). The request
      still counts toward the rate limit.
   ============================================================ */

const FALLBACK_ENDPOINT =
  'https://script.google.com/macros/s/AKfycbwVRr6rSiNdVNXSGa1lgxXxqiMLBkDz_h9N0sVpSOJygLw-zf85udMTKNr7aaCY4Wi7/exec';

const ALLOWED_ACTIONS = new Set(['order', 'appointment', 'status', 'delete']);
const MAX_BODY = 16 * 1024;

// --- v3 rate limit (in-memory, per instance) ---
const RL_LIMIT = 12;
const RL_WINDOW_MS = 60 * 60 * 1000; // 1 hour fixed window
const rlMap = new Map(); // ip -> { n, ws }

function rlCheck(req) {
  const ip = (req.headers['x-real-ip']
    || (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
    || 'unknown');
  const now = Date.now();
  let e = rlMap.get(ip);
  if (!e || now - e.ws >= RL_WINDOW_MS) {
    e = { n: 0, ws: now };
    rlMap.set(ip, e);
  }
  e.n += 1;
  // opportunistic prune to keep the map bounded
  if (rlMap.size > 5000) {
    for (const [k, v] of rlMap) {
      if (now - v.ws >= RL_WINDOW_MS) rlMap.delete(k);
    }
  }
  const resetSec = Math.ceil((e.ws + RL_WINDOW_MS - now) / 1000);
  return {
    allowed: e.n <= RL_LIMIT,
    remaining: Math.max(0, RL_LIMIT - e.n),
    resetSec
  };
}

function rlHeaders(res, rl) {
  res.setHeader('x-ratelimit-limit', String(RL_LIMIT));
  res.setHeader('x-ratelimit-remaining', String(rl.remaining));
  res.setHeader('x-ratelimit-reset', String(rl.resetSec));
}

function sameSiteOrigin(req) {
  const origin = req.headers.origin || req.headers.referer || '';
  if (!origin) return true; // non-browser clients send no Origin; upstream key still gates abuse
  try {
    const host = new URL(origin).hostname;
    const allowed = (process.env.SITE_URL || 'https://abhushan-by-divyaraj.vercel.app')
      .replace(/^https?:\/\//, '');
    return host === allowed || host.endsWith('.vercel.app');
  } catch (e) {
    return false;
  }
}

module.exports = async function handler(req, res) {
  // 1. method gate
  if (req.method !== 'POST') {
    res.setHeader('allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method-not-allowed' });
  }

  // 2. origin gate (best-effort CSRF shield)
  if (!sameSiteOrigin(req)) {
    return res.status(403).json({ ok: false, error: 'bad-origin' });
  }

  // 3. v3 rate limit (counts every request that passes the origin gate)
  const rl = rlCheck(req);
  rlHeaders(res, rl);
  if (!rl.allowed) {
    res.setHeader('retry-after', String(rl.resetSec));
    return res.status(429).json({ ok: false, error: 'rate-limited', retry_after_seconds: rl.resetSec });
  }

  // 4. env gate
  const key = process.env.AB_CLOUD_KEY;
  const endpoint = process.env.AB_CLOUD_ENDPOINT || FALLBACK_ENDPOINT;
  if (!key) {
    return res.status(503).json({ ok: false, error: 'cloud-not-configured' });
  }

  // 5. read + size-capped body
  let raw = '';
  try {
    for await (const chunk of req) {
      raw += chunk;
      if (raw.length > MAX_BODY) {
        return res.status(413).json({ ok: false, error: 'payload-too-large' });
      }
    }
  } catch (e) {
    return res.status(400).json({ ok: false, error: 'unreadable-body' });
  }

  // 6. JSON gate
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch (e) {
    return res.status(400).json({ ok: false, error: 'bad-json' });
  }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return res.status(400).json({ ok: false, error: 'bad-payload' });
  }

  // 7. v3 server-side honeypot drop (silent, no upstream write, still rate-counted)
  if (payload.botcheck) {
    return res.status(200).json({ ok: true, dropped: 'honeypot' });
  }

  if (!ALLOWED_ACTIONS.has(payload.action)) {
    return res.status(400).json({ ok: false, error: 'bad-action' });
  }

  // 8. strip client keys, inject server key
  delete payload.key;
  payload.key = key;

  // 9. forward (text/plain on purpose: avoids the CORS preflight Apps Script can't answer)
  try {
    const upstream = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    if (!upstream.ok) {
      return res.status(502).json({ ok: false, error: 'upstream-http-' + upstream.status });
    }
    const text = await upstream.text();
    let out;
    try {
      out = JSON.parse(text);
    } catch (e) {
      out = { ok: false, error: 'upstream-not-json' };
    }
    res.setHeader('cache-control', 'no-store');
    return res.status(200).json(out);
  } catch (e) {
    return res.status(502).json({ ok: false, error: 'upstream-unreachable' });
  }
};
