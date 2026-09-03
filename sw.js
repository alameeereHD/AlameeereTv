const PROXY = 'https://alameeere-proxy.alameeeretv.workers.dev/';

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/stream/')) {
    const id = url.pathname.replace('/stream/', '');
    const target = PROXY + id;
    event.respondWith(
      fetch(target, { headers: { 'Accept': '*/*' } })
        .then(r => new Response(r.body, {
          status: r.status,
          headers: { 'Content-Type': r.headers.get('Content-Type') || 'application/vnd.apple.mpegurl', 'Access-Control-Allow-Origin': '*' }
        }))
    );
  }
});