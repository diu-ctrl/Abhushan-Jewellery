/* ============================================================
   ABHUSHAN P1 — Edge Middleware: Basic-Auth gate
   ============================================================
   Protects:
     /admin.html        (studio admin dashboard)
     /api/admin-data    (admin cloud read proxy)

   Credentials come from Vercel env vars ONLY — never from code:
     ADMIN_USER   admin username
     ADMIN_PASS   admin password (generate a long random string)

   Reused, production-proven pattern from the DC project P5 (F13).
   Constant-time compare to avoid timing oracles.
   ============================================================ */

function safeEqual(a, b) {
  var ab = new TextEncoder().encode(String(a));
  var bb = new TextEncoder().encode(String(b));
  var len = Math.max(ab.length, bb.length);
  var diff = ab.length ^ bb.length; // length mismatch => never equal
  for (var i = 0; i < len; i++) {
    diff |= (ab[i] || 0) ^ (bb[i] || 0);
  }
  return diff === 0;
}

export default function middleware(req) {
  var user = process.env.ADMIN_USER || '';
  var pass = process.env.ADMIN_PASS || '';

  if (!user || !pass) {
    return new Response(
      'Admin not configured: set ADMIN_USER and ADMIN_PASS in Vercel project env vars, then redeploy.',
      {
        status: 503,
        headers: {
          'content-type': 'text/plain; charset=utf-8',
          'x-robots-tag': 'noindex, nofollow',
          'cache-control': 'no-store'
        }
      }
    );
  }

  var auth = req.headers.get('authorization') || '';
  var ok = false;
  if (auth.lastIndexOf('Basic ', 0) === 0) {
    try {
      var decoded = atob(auth.slice(6).trim());
      var idx = decoded.indexOf(':');
      var u = idx >= 0 ? decoded.slice(0, idx) : '';
      var p = idx >= 0 ? decoded.slice(idx + 1) : '';
      ok = safeEqual(u, user) && safeEqual(p, pass);
    } catch (e) {
      ok = false;
    }
  }

  if (ok) {
    if (typeof Response.next === 'function') {
      return Response.next();
    }
    return new Response(null, {
      headers: { 'x-middleware-next': '1' }
    });
  }

  return new Response('Authentication required.', {
    status: 401,
    headers: {
      'www-authenticate': 'Basic realm="Abhushan Studio Admin", charset="UTF-8"',
      'content-type': 'text/plain; charset=utf-8',
      'x-robots-tag': 'noindex, nofollow',
      'cache-control': 'no-store'
    }
  });
}

export const config = {
  matcher: ['/admin', '/admin.html', '/api/admin-data']
};
