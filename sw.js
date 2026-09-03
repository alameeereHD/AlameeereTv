const AHMSRV = 'http://ahm79.store/live/0545580310/7337741654/';
const CFPROXY = 'https://alameeere-proxy.alameeeretv.workers.dev/';
const AHM_IDS = ['746714.m3u8','746717.m3u8','746720.m3u8'];

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/stream/')) {
    const id = url.pathname.replace('/stream/', '');
    const isAhm = AHM_IDS.includes(id);
    const target = isAhm ? AHMSRV + id : CFPROXY + id;
    const headers = isAhm ? {
      'User-Agent': 'Mozilla/5.0 (SMART-TV; Linux; Tizen 5.0) AppleWebKit/538.1 (KHTML, like Gecko) Version/5.0 TV Safari/538.1',
      'Referer': 'http://ahm79.store/',
      'Origin': 'http://ahm79.store',
      'Accept': '*/*'
    } : { 'Accept': '*/*' };
    event.respondWith(
      fetch(target, { headers })
        .then(r => new Response(r.body, {
          status: r.status,
          headers: {
            'Content-Type': r.headers.get('Content-Type') || 'application/vnd.apple.mpegurl',
            'Access-Control-Allow-Origin': '*'
          }
        }))
    );
  }
});