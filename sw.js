const CACHE_NAME = "cbl-season-3-v7";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/season3-site.css",
  "./assets/season3-home.css",
  "./assets/pwa.css",
  "./assets/season3-site.js",
  "./assets/pwa.js?v=20260816-pushfix2",
  "./assets/season3-main-logo.webp"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  const path = decodeURIComponent(url.pathname);
  if (path.endsWith("/admin.html") || path.endsWith("/content-admin.html") || path.endsWith("/賽程戰績表.html")) return;
  if (url.origin !== self.location.origin) return;

  const isDocument = event.request.mode === "navigate" || event.request.destination === "document" || path.endsWith(".html");
  const isFreshAsset = event.request.destination === "style" || event.request.destination === "script" || path.endsWith(".css") || path.endsWith(".js") || path.endsWith(".webmanifest");

  if (isDocument || isFreshAsset) {
    event.respondWith(networkFirst(event.request, isDocument));
    return;
  }

  event.respondWith(caches.match(event.request).then((cached) => {
    if (cached) return cached;
    return fetch(event.request).then((response) => {
      if (response && response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      }
      return response;
    });
  }));
});

async function networkFirst(request, allowNavigationFallback) {
  try {
    const freshRequest = new Request(request, { cache: "no-store" });
    const response = await fetch(freshRequest);
    if (response && response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (_) {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (allowNavigationFallback) {
      const fallback = await caches.match("./index.html");
      if (fallback) return fallback;
    }
    return Response.error();
  }
}

self.addEventListener("push", (event) => {
  let data = { title: "CBL 最新消息", body: "有新的球隊消息，點擊查看。", url: "./index.html" };
  try { data = { ...data, ...(event.data ? event.data.json() : {}) }; } catch (_) {}
  event.waitUntil(self.registration.showNotification(data.title, {
    body: data.body,
    icon: "./assets/season3-main-logo.webp",
    badge: "./assets/season3-main-logo.webp",
    data: { url: data.url }
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data?.url || "./index.html"));
});
