// Service Worker for Push Notifications
// Ce fichier sera inclus par next-pwa

// Écouter les événements push
self.addEventListener("push", (event) => {
    console.log("[SW] Push reçu:", event);

    if (!event.data) {
        console.log("[SW] Push sans données");
        return;
    }

    try {
        const data = event.data.json();
        const options = {
            body: data.body || "Nouvelle notification SmartDalle",
            icon: data.icon || "/icon-192x192.png",
            badge: data.badge || "/badge-72x72.png",
            vibrate: [100, 50, 100],
            data: {
                url: data.url || "/dashboard",
                dateOfArrival: Date.now(),
            },
            tag: data.tag || "smartdalle-notification",
            renotify: true,
            requireInteraction: false,
            actions: [
                {
                    action: "open",
                    title: "Ouvrir",
                },
                {
                    action: "close",
                    title: "Fermer",
                },
            ],
        };

        event.waitUntil(
            self.registration.showNotification(data.title || "SmartDalle 🔥", options)
        );
    } catch (error) {
        console.error("[SW] Erreur parsing push data:", error);
    }
});

// Écouter les clics sur les notifications
self.addEventListener("notificationclick", (event) => {
    console.log("[SW] Notification cliquée:", event);

    event.notification.close();

    if (event.action === "close") {
        return;
    }

    const urlToOpen = event.notification.data?.url || "/dashboard";

    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
            // Chercher une fenêtre existante
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && "focus" in client) {
                    client.navigate(urlToOpen);
                    return client.focus();
                }
            }
            // Ouvrir une nouvelle fenêtre si aucune n'existe
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

// Écouter la fermeture des notifications
self.addEventListener("notificationclose", (event) => {
    console.log("[SW] Notification fermée:", event);
});

// Message depuis l'app principale
self.addEventListener("message", (event) => {
    console.log("[SW] Message reçu:", event.data);

    if (event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
});

console.log("[SW] Push Service Worker chargé");
