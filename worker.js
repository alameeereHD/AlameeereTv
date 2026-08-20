const BROWSER_HEADERS = {
  'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Accept':          '*/*',
  'Accept-Language': 'ar,en-US;q=0.9,en;q=0.8',
  'Accept-Encoding': 'identity',
  'Cache-Control':   'no-cache',
  'Pragma':          'no-cache',
  'Connection':      'keep-alive',
  'Referer':         'http://lynovo.cc/'
};

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': '*'
};

function getContentType(url) {
  if (url.includes('.m3u8')) return 'application/vnd.apple.mpegurl';
  if (url.includes('.ts'))   return 'video/mp2t';
  if (url.includes('.mp4'))  return 'video/mp4';
  if (url.includes('.aac'))  return 'audio/aac';
  return 'application/octet-stream';
}

function rewriteM3u8(text, originalUrl, proxyBase) {
  const base = originalUrl.substring(0, originalUrl.lastIndexOf('/') + 1);
  return text.split('\n').map(line => {
    const t = line.trim();
    if (!t || t.startsWith('#')) return line;
    if (t.startsWith('http://') || t.startsWith('https://'))
      return proxyBase + encodeURIComponent(t);
    return proxyBase + encodeURIComponent(base + t);
  }).join('\n');
}

async function fetchWithRedirect(url, headers, count = 0) {
  if (count > 5) throw new Error('too many redirects');
  const res = await fetch(url, { headers, redirect: 'manual' });
  if ([301, 302, 303, 307, 308].includes(res.status)) {
    const loc = res.headers.get('location');
    if (!loc) throw new Error('redirect without location');
    const next = loc.startsWith('http') ? loc : new URL(loc, url).href;
    return fetchWithRedirect(next, headers, count + 1);
  }
  return res;
}

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    const targetUrl = url.searchParams.get('url');
    if (!targetUrl) {
      return new Response(JSON.stringify({ error: 'missing url param' }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' }
      });
    }

    let decoded;
    try { decoded = decodeURIComponent(targetUrl); }
    catch { return new Response('invalid url', { status: 400, headers: CORS }); }

    if (!decoded.startsWith('http://') && !decoded.startsWith('https://')) {
      return new Response('forbidden', { status: 403, headers: CORS });
    }

    try {
      const resp = await fetchWithRedirect(decoded, BROWSER_HEADERS);
      const ct   = getContentType(decoded);
      const isM3u8 = ct.includes('mpegurl') || decoded.includes('.m3u8');

      const proxyBase = 'https://alameeeretv.mkhtar80.workers.dev/?url=';

      if (isM3u8) {
        const text = await resp.text();
        const rewritten = rewriteM3u8(text, decoded, proxyBase);
        return new Response(rewritten, {
          headers: { ...CORS, 'Content-Type': 'application/vnd.apple.mpegurl', 'Cache-Control': 'no-cache' }
        });
      }

      const body = await resp.arrayBuffer();
      return new Response(body, {
        headers: { ...CORS, 'Content-Type': ct, 'Cache-Control': 'no-cache' }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 502, headers: { ...CORS, 'Content-Type': 'application/json' }
      });
    }
  }
};