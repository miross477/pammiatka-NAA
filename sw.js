const CACHE = 'pamiatka-dps-v3';
const CORE = ['./', './index.html', './styles.css', './app.js', './manifest.webmanifest', './data/routes.json', './data/strings.xml'];
self.addEventListener('install', event => event.waitUntil((async () => {
  const cache = await caches.open(CACHE);
  const routes = await fetch('./data/routes.json').then(response => response.json());
  const layouts = Object.values(routes).map(route => `./assets/res/layout/${route.layout}.xml`);
  await cache.addAll([...CORE, ...layouts]);
})()));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response.ok && new URL(event.request.url).origin === location.origin) caches.open(CACHE).then(cache => cache.put(event.request, response.clone()));
    return response;
  })));
});
