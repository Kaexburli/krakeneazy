// Cache Name
const CACHE_NAME = "WALLTRADE-V2";
// Cache Files
const FILES_TO_CACHE = [
  "/offline.html",
  "/favicon.png",
  "/assets/favicon-32x32.png",
  "/assets/favicon-16x16.png",
  "/assets/favicon.ico",
  "/assets/browserconfig.xml",
  "/assets/apple-touch-icon.png",
  "/assets/safari-pinned-tab.svg",
  "/assets/mstile-150x150.png",
  "/assets/no-wifi.svg"
];

// install
self.addEventListener("install", (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Active PWA Cache and clear out anything older
self.addEventListener("activate", (evt) => {
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// listen for fetch events in page navigation and return anything that has been cached
self.addEventListener("fetch", (evt) => {
  evt.respondWith(
    caches.match(evt.request).then(function (response) {
      return response || fetch(evt.request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        return await cache.match('offline.html');
      });
    })
  );
});