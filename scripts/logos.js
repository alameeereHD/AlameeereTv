(async function(){
  try {
    const res = await fetch('/assets/logos/logos.json', {cache: "no-cache"});
    if (!res.ok) throw new Error('فشل تحميل logos.json');
    const logos = await res.json();
    const container = document.getElementById('logos');
    if (!container) return;

    // ترتيب: عرض القنوات حسب grade ثم الاسم
    logos.sort((a,b)=> (a.grade||0) - (b.grade||0));

    for (const item of logos) {
      const a = document.createElement('a');
      a.className = 'logo-link';
      a.href = item.href || '#';
      a.target = '_blank';
      a.rel = 'noopener';
      a.setAttribute('aria-label', item.alt || 'قناة');

      const img = document.createElement('img');
      img.src = item.src;
      img.alt = item.alt || '';
      img.loading = 'lazy';

      a.appendChild(img);
      container.appendChild(a);
    }
  } catch (err) {
    console.error('load logos error:', err);
  }
})();
