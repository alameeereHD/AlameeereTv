const http = require('http');
const https = require('https');
const url = require('url');
const crypto = require('crypto');

const SECRET = 'Alam33re#2026';
const VALIDITY = 2 * 60 * 60 * 1000;

function makeToken(ts) {
  const w = Math.floor(ts / VALIDITY);
  return crypto.createHash('sha256').update(`${SECRET}:${w}`).digest('hex').substring(0, 24);
}

const CHANNELS = {
  'bein1':     'http://ahm79.store/live/0545580310/7337741654/14670.m3u8',
  'bein2':     'http://ahm79.store/live/0545580310/7337741654/769629.m3u8',
  'bein3':     'http://ahm79.store/live/0545580310/7337741654/14672.m3u8',
  'bein4':     'http://ahm79.store/live/0545580310/7337741654/14673.m3u8',
  'bein5':     'http://ahm79.store/live/0545580310/7337741654/14657.m3u8',
  '8a-j1':     'http://ahm79.store/live/0545580310/7337741654/746713.m3u8',
  '8a-j2':     'http://ahm79.store/live/0545580310/7337741654/746716.m3u8',
  '8b':        'http://ahm79.store/live/0545580310/7337741654/746717.m3u8',
  '8c-j1':     'http://ahm79.store/live/0545580310/7337741654/746719.m3u8',
  '8c-j2':     'http://ahm79.store/live/0545580310/7337741654/746720.m3u8',
  'alwan1-j1': 'http://ahm79.store/live/0545580310/7337741654/772277.m3u8',
  'alwan1-j2': 'http://ahm79.store/live/0545580310/7337741654/772276.m3u8',
  'alwan2-j1': 'http://ahm79.store/live/0545580310/7337741654/772274.m3u8',
  'alwan2-j2': 'http://ahm79.store/live/0545580310/7337741654/772273.m3u8',
  'alwan3-j1': 'http://ahm79.store/live/0545580310/7337741654/772270.m3u8',
  'alwan3-j2': 'http://ahm79.store/live/0545580310/7337741654/772269.m3u8'
};

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': '*'
};

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  const path = parsed.pathname;

  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS);
    res.end();
    return;
  }

  if (path === '/token') {
    const now = Date.now();
    const token = makeToken(now);
    const expires = VALIDITY - (now % VALIDITY);
    res.writeHead(200, { ...CORS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ token, expires }));
    return;
  }

  if (path === '/stream') {
    const ch = parsed.query.ch;
    const token = parsed.query.token;
    if (!ch || !token) {
      res.writeHead(400, CORS);
      res.end('Missing params');
      return;
    }
    const now = Date.now();
    const cur = makeToken(now);
    const prev = makeToken(now - VALIDITY);
    if (token !== cur && token !== prev) {
      res.writeHead(403, CORS);
      res.end('Token Expired');
      return;
    }
    const streamUrl = CHANNELS[ch];
    if (!streamUrl) {
      res.writeHead(404, CORS);
      res.end('Not Found');
      return;
    }
    http.get(streamUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (upstream) => {
      res.writeHead(upstream.statusCode, {
        ...CORS,
        'Content-Type': upstream.headers['content-type'] || 'application/vnd.apple.mpegurl'
      });
      upstream.pipe(res);
    }).on('error', (e) => {
      res.writeHead(500, CORS);
      res.end('Error: ' + e.message);
    });
    return;
  }

  res.writeHead(404, CORS);
  res.end('Not Found');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Server running on port ' + PORT));
