const CACHE = 'tutovie-v2';
const ASSETS = [
  './', './index.html', './base.css', './components.css', './screens.css',
  './core.js', './onboarding.js', './screens.js', './actions.js',
  './manifest.webmanifest', './icon.svg'
];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS))));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(fetch(event.request).then(response => {
    const clone = response.clone();
    caches.open(CACHE).then(cache => cache.put(event.request, clone));
    return response;
  }).catch(() => caches.match(event.request).then(match => match || caches.match('./index.html'))));
});
