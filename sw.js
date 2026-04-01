const CACHE_NAME = 'cyprus-guide-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
  // アイコンファイルもキャッシュする場合:
  // '/icon-192.png',
  // '/icon-512.png'
];

// インストール時
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// フェッチ時: ネットワーク優先、フォールバックでキャッシュ
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 有効なレスポンスはキャッシュに追加 (ただし画像はキャッシュしない簡易版)
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          if (event.request.url.indexOf('http') === 0 && event.request.method === 'GET') {
            cache.put(event.request, clone);
          }
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request)
          .then(response => response || caches.match('/index.html'));
      })
  );
});

// アクティベート時に古いキャッシュ削除
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    })
  );
});