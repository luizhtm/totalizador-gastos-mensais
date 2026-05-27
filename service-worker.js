const APP_CACHE_VERSION = "2026.05.27.10";
const APP_CACHE_NAME = `gastos-mensais-${APP_CACHE_VERSION}`;

const APP_SHELL_URLS = [
  "./",
  "./index.html",
  "./vendor/pico/pico.min.css",
  "./styles.css?v=20260527-form-enter",
  "./app.js?v=20260527-form-enter",
  "./app-core.js",
  "./ofx-category-rules.js",
  "./site.webmanifest",
  "./assets/icon.svg",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/icon-maskable-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL_URLS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames
          .filter((cacheName) => cacheName.startsWith("gastos-mensais-") && cacheName !== APP_CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => cachedResponse || fetch(event.request))
  );
});
