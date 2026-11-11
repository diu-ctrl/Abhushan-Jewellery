/* ============================================================
   ABHUSHAN P1 — /api/cloud-post  (customer cloud WRITE proxy)
   ============================================================
   POST /api/cloud-post      body: text/plain JSON
     { action: 'order' | 'appointment' | 'status' | 'delete', ... }

   Replaces the old flow where cart.js/admin.html embedded the
   Google Apps Script key in client JS (publicly viewable!). The
   key now lives in the AB_CLOUD_KEY env var and is injected here.

   Hardening (honest scope):
     - action whitelist
     - body size cap (16 KB)
     - same-site Origin/Referer check when the header is present
     - client-supplied `key` fields are stripped before forwarding
   Residual risk (documented): the endpoint itself is open to
   direct scripted calls — same class of risk as the public
   Web3Forms email endpoint. Rate limiting is a P3 candidate.
   ============================================================ */

const FALLBACK_ENDPOINT =
  'https://script.google.com/macros/s/AKfycbwVRr6rSiNdVNXSGa1lgxXxqiMLBkDz_h9N0sVpSOJygLw-zf85udMTKNr7aaCY4Wi7/exec';

const ALLOWED_ACTIONS = new Set(['order', 'appointment', 'status', 'delete']);
const MAX_BODY = 16 * 1024;

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

  // 3. env gate
  const key = process.env.AB_CLOUD_KEY;
  const endpoint = process.env.AB_CLOUD_ENDPOINT || FALLBACK_ENDPOINT;
  if (!key) {
    return res.status(503).json({ ok: false, error: 'cloud-not-configured' });
  }

  // 4. read + size-capped body
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

  // 5. JSON gate
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch (e) {
    return res.status(400).json({ ok: false, error: 'bad-json' });
  }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return res.status(400).json({ ok: false, error: 'bad-payload' });
  }
  if (!ALLOWED_ACTIONS.has(payload.action)) {
    return res.status(400).json({ ok: false, error: 'bad-action' });
  }

  // 6. strip client keys, inject server key
  delete payload.key;
  payload.key = key;

  // 7. forward (text/plain on purpose: avoids the CORS preflight Apps Script can't answer)
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
