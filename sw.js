const CACHE = 'pamiatka-dps-v24';
const CORE = ['./', './index.html', './styles.css', './app.js', './manifest.webmanifest', './data/routes.json', './data/strings.xml', './data/styled-runs.json'];
self.addEventListener('install', event => event.waitUntil((async () => {
  const cache = await caches.open(CACHE);
  const routes = await fetch('./data/routes.json').then(response => response.json());
  const layouts = Object.values(routes).map(route => `./assets/res/layout/${route.layout}.xml`);
  await cache.addAll([...CORE, ...layouts]);
  await self.skipWaiting();
})()));
self.addEventListener('activate', event => event.waitUntil((async () => {
  const names = await caches.keys();
  await Promise.all(names.filter(name => name !== CACHE).map(name => caches.delete(name)));
  await self.clients.claim();
})()));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const response = await fetch(event.request);
      if (response.ok) await cache.put(event.request, response.clone());
      return response;
    } catch {
      return (await cache.match(event.request)) || Response.error();
    }
  })());
});
