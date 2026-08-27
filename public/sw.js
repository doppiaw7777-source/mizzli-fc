const CACHE = "mizzli-fc-v6";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  event.respondWith(fetch(req, { cache: "no-store" }));
});

self.addEventListener("push", (event) => {
  let data = { title: "MIZZLI FC", body: "Nuovo avviso", url: "/" };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    /* keep default */
  }
  event.waitUntil(
    self.registration.showNotification(data.title || "MIZZLI FC", {
      body: data.body || "",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: data.url || "/" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          client.focus();
          if ("navigate" in client) client.navigate(url);
          return;
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});

self.addEventListener("message", (event) => {
  const msg = event.data || {};
  if (msg.type !== "SHOW_NOTICE") return;
  event.waitUntil(
    self.registration.showNotification(msg.title || "MIZZLI FC", {
      body: msg.body || "",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: msg.url || "/" },
    })
  );
});
