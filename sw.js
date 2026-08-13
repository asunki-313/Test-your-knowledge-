const CACHE_NAME = "v13.50.4-pwa";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL).catch(() => {});
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const url = request.url;

  // لا نخزن طلبات Firebase في الكاش
  if (
    url.includes("firestore.googleapis.com") ||
    url.includes("firebaseio.com") ||
    url.includes("googleapis.com/identitytoolkit") ||
    url.includes("securetoken.googleapis.com")
  ) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, copy);
        });

        return response;
      })
      .catch(() => {
        return caches.match(request).then((cached) => {
          return cached || caches.match("./index.html");
        });
      })
  );
});
