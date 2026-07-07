// Chie Daily Tap — offline support
// network-first: オンライン時は常に最新を取得（stale cache問題を回避）、オフライン時はキャッシュで起動
const CACHE = 'cdt-v1';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return; // webhookへのPOSTは素通し
  if (e.request.url.includes('assignments.json')) return; // 当日指定は常にネット直読み（キャッシュしない）
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request))
  );
});
