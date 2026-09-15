const CACHE_NAME = "roll-call-v3";
const APP_SHELL_URL = "./index.html";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js",
  "https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap",
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js",
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(
        // IMPORTANT: no "no-cors" here. These CDNs (gstatic, unpkg,
        // fonts.googleapis) all send proper CORS headers, and the
        // Firebase files are loaded as ES modules — browsers refuse to
        // execute a module from an opaque (no-cors) cached response,
        // which is what was causing the app to silently fail offline.
        APP_SHELL.map((url) =>
          fetch(url)
            .then((res) => cache.put(url, res))
            .catch(() => {}) // don't fail install if one asset is slow/unreachable
        )
      )
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const isNavigation = event.request.mode === "navigate";

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return res;
        })
        .catch(() => {
          // Offline and nothing cached for this exact request.
          // For page navigations, always fall back to the cached app
          // shell so the app still opens instead of failing to load
          // at all. For everything else (fonts, etc.), just let it
          // fail quietly — a missing font shouldn't break the app.
          if (isNavigation) {
            return caches.match(APP_SHELL_URL);
          }
          return cached; // undefined is fine here — non-critical asset
        });
    })
  );
});
