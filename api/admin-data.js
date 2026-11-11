/* ============================================================
   ABHUSHAN P1 — /api/admin-data  (admin cloud READ proxy)
   ============================================================
   GET /api/admin-data?action=orders|appointments

   The Google Apps Script key lives server-side (env var), so the
   browser never sees it. This function is additionally protected
   by Edge Middleware (Basic-Auth) via the matcher in middleware.js.

   Env vars (set in Vercel):
     AB_CLOUD_KEY       the key the Apps Script expects (rotated value)
     AB_CLOUD_ENDPOINT  (optional) override of the Apps Script URL
   ============================================================ */

const FALLBACK_ENDPOINT =
  'https://script.google.com/macros/s/AKfycbwVRr6rSiNdVNXSGa1lgxXxqiMLBkDz_h9N0sVpSOJygLw-zf85udMTKNr7aaCY4Wi7/exec';

const ALLOWED_ACTIONS = new Set(['orders', 'appointments']);

module.exports = async function handler(req, res) {
  // 1. method gate
  if (req.method !== 'GET') {
    res.setHeader('allow', 'GET');
    return res.status(405).json({ ok: false, error: 'method-not-allowed' });
  }

  // 2. action whitelist
  const action = String(req.query.action || '');
  if (!ALLOWED_ACTIONS.has(action)) {
    return res.status(400).json({ ok: false, error: 'bad-action' });
  }

  // 3. env gate — never leak whether it's the key or the endpoint that's missing
  const key = process.env.AB_CLOUD_KEY;
  const endpoint = process.env.AB_CLOUD_ENDPOINT || FALLBACK_ENDPOINT;
  if (!key) {
    return res
      .status(503)
      .json({ ok: false, error: 'cloud-not-configured' });
  }

  // 4. upstream fetch (server injects the key)
  try {
    const url =
      endpoint + '?action=' + encodeURIComponent(action) + '&key=' + encodeURIComponent(key);
    const upstream = await fetch(url, { redirect: 'follow' });
    if (!upstream.ok) {
      return res.status(502).json({ ok: false, error: 'upstream-http-' + upstream.status });
    }
    let data;
    try {
      data = await upstream.json();
    } catch (e) {
      return res.status(502).json({ ok: false, error: 'upstream-not-json' });
    }
    if (!data || data.ok !== true || !Array.isArray(data[action])) {
      const reason = data && typeof data.error === 'string' ? data.error : 'upstream-rejected';
      return res.status(502).json({ ok: false, error: reason });
    }
    res.setHeader('cache-control', 'no-store');
    return res.status(200).json({ ok: true, [action]: data[action] });
  } catch (e) {
    return res.status(502).json({ ok: false, error: 'upstream-unreachable' });
  }
};
