const CACHE_NAME = "fermermarket-shell-v5";
const APP_SHELL = [
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/offline.html"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch((err) => console.error("SW install cache error:", err))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (!url.protocol.startsWith("http")) return;

  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_next/webpack-hmr")
  ) {
    return;
  }

  // Do NOT intercept navigation requests — let the browser handle them
  // directly. Interception caused ERR_FAILED in some browsers when the
  // middleware issued 307 locale redirects (the SW's fetch with redirect:"follow"
  // didn't resolve properly in all cases). The app works fine without SW
  // navigation interception; the middleware handles auth + locale correctly.
  if (request.mode === "navigate") {
    return;
  }

  // CRITICAL: never intercept cross-origin requests (e.g. Vercel Blob storage
  // product/slide/avatar images, external APIs). These change frequently
  // (users upload new images, old blob URLs get replaced) and a cache-first
  // strategy here permanently "freezes" images in every visitor's browser,
  // masking real content updates indefinitely — including making it look
  // like a freshly-uploaded image "isn't showing" when it's actually just
  // stuck serving a stale cached response (or a stale opaque no-cors
  // response) from a much earlier visit. Cross-origin assets always go
  // straight to the network.
  if (url.origin !== self.location.origin) {
    return;
  }

  // Only same-origin build assets (hashed Next.js chunks, icons, manifest)
  // are safe to cache-first — their filenames change on every deploy, so a
  // stale cache entry is never served for new code. Everything else
  // (including same-origin /uploads-style paths if ever added) skips SW
  // caching entirely to avoid freezing stale content.
  const isHashedBuildAsset = url.pathname.startsWith("/_next/static/");
  const isAppShellAsset =
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.json" ||
    url.pathname === "/offline.html";

  if (!isHashedBuildAsset && !isAppShellAsset) {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }

        const networkResponse = await fetch(request, { redirect: "follow" });
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache).catch(() => {});
          }).catch(() => {});
        }
        if (networkResponse) {
          return networkResponse;
        }
      } catch (error) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) return cachedResponse;
      }

      return new Response("", { status: 408, statusText: "Request Timeout" });
    })()
  );
});

self.addEventListener("push", (event) => {
  if (!event.data) return;
  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "FermerMarket", body: event.data.text() };
  }
  const title = payload.title || "Fermer Market";
  const options = {
    body: payload.body || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: { url: payload.url || "/" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
