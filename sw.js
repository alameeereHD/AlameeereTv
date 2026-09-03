const BASE = 'http://ahm79.store/live/0545580310/7337741654/';
const IDS = ['746714.m3u8','746717.m3u8','746720.m3u8','746713.m3u8','421785.m3u8','421786.m3u8'];

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/stream/')) {
    const id = url.pathname.replace('/stream/', '');
    const target = BASE + id;
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