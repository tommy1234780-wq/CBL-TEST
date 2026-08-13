const CACHE_NAME = "cbl-season-3-v1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/season3-site.css",
  "./assets/season3-home.css",
  "./assets/pwa.css",
  "./assets/season3-site.js",
  "./assets/pwa.js",
  "./assets/season3-main-logo.webp"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))) )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match("./index.html")))
  );
});

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
