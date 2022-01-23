// Cache Name
const CACHE_NAME = "WALLTRADE-V1";
// Cache Files
const FILES_TO_CACHE = [
  "/offline.html",
  "/assets/no-wifi.png"
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