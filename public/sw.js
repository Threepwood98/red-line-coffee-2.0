const CACHE_NAME = "redline-v1"; // cambiá por el nombre de tu app
const SHELL_URLS = ["/", "/menu", "/store", "/ps4", "/pokedex"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_URLS).catch(() => {})),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Assets estáticos → Cache-first
  if (url.pathname.match(/\.(js|css|woff2?|svg|png|jpg|webp|ico)$/)) {
    event.respondWith(
      caches.match(event.request).then(
        (cached) =>
          cached ??
          fetch(event.request).then((res) => {
            if (res.ok)
              caches
                .open(CACHE_NAME)
                .then((c) => c.put(event.request, res.clone()));
            return res;
          }),
      ),
    );
    return;
  }

  // HTML / navegación → Network-first con fallback offline
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          caches
            .open(CACHE_NAME)
            .then((c) => c.put(event.request, res.clone()));
          return res;
        })
        .catch(() =>
          caches
            .match("/")
            .then((c) => c ?? new Response("Offline", { status: 503 })),
        ),
    );
  }
});
