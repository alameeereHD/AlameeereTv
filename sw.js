const AHMSRV = 'http://ahm79.store/live/0545580310/7337741654/';
const CFPROXY = 'https://alameeere-proxy.alameeeretv.workers.dev/';

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/stream/')) {
    const id = url.pathname.replace('/stream/', '');
    // قنوات ثمانية الجديدة من ahm79
    const ahmIds = ['746714.m3u8','746717.m3u8','746720.m3u8'];
    const target = ahmIds.includes(id) ? AHMSRV + id : CFPROXY + id;
    event.respondWith(
      fetch(target, { headers: { 'Accept': '*/*' } })
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