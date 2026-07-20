// Altın Defter Service Worker for Web Push / Notifications
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Push bildirimlerini yakalama (İleride Web Push Server entegre edilirse)
self.addEventListener("push", (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: "Altın Defter", body: event.data.text() };
    }
  }

  const title = data.title || "⚠️ Altın Defter Bildirimi";
  const options = {
    body: data.body || "Yeni bir borç vade uyarısı bulunmaktadır.",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    data: data.url || "/dashboard",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Bildirime tıklandığında uygulamayı açma veya odaklama
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data || "/dashboard";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      // Eğer sekme zaten açıksa oraya odaklan
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus();
        }
      }
      // Açık değilse yeni sekmede aç
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
