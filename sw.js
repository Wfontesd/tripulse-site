const CACHE_NAME = '3-pulse-neon-nexus-v3';
const ROOT = new URL('./', self.registration.scope).href;
const CORE_ASSETS = [
  ROOT,
  new URL('index.html', ROOT).href,
  new URL('manifest.webmanifest', ROOT).href,
  new URL('canvaskit.wasm', ROOT).href,
  new URL('icons/icon-192.png', ROOT).href,
  new URL('icons/icon-512.png', ROOT).href,
  new URL('icons/icon.svg', ROOT).href,
  new URL('art/nexus-hall-1280.webp', ROOT).href,
  new URL('art/nexus-hall-1920.webp', ROOT).href,
  new URL('art/pulse-station-1280.webp', ROOT).href,
  new URL('art/pulse-station-1920.webp', ROOT).href,
];

self.addEventListener('install', (event) => {
  event.waitUntil(precacheApplication());
  self.skipWaiting();
});

async function precacheApplication() {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(CORE_ASSETS);
  const indexUrl = new URL('index.html', ROOT).href;
  const indexResponse = await fetch(indexUrl);
  const html = await indexResponse.clone().text();
  await cache.put(indexUrl, indexResponse);
  const entryAssets = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
    .map((match) => new URL(match[1], ROOT).href)
    .filter((url) => url.startsWith(ROOT));

  for (const url of entryAssets) {
    const response = await fetch(url);
    if (!response.ok) continue;
    await cache.put(url, response.clone());
    if (!url.endsWith('.js')) continue;
    const source = await response.text();
    const lazyAssets = [...source.matchAll(/\.\/[\w-]+\.(?:js|css)/g)].map(
      (match) => new URL(match[0], url).href,
    );
    await Promise.all(
      lazyAssets.map(async (assetUrl) => {
        const assetResponse = await fetch(assetUrl);
        if (assetResponse.ok) await cache.put(assetUrl, assetResponse);
      }),
    );
  }
}

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          void caches.open(CACHE_NAME).then((cache) => cache.put(ROOT, copy));
          return response;
        })
        .catch(async () => (await caches.match(ROOT)) ?? Response.error()),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ??
        fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            void caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        }),
    ),
  );
});
