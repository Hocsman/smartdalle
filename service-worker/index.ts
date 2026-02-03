/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

// Push notification handler
self.addEventListener("push", (event) => {
    console.log("[SW] Push event received");

    if (!event.data) {
        console.log("[SW] Push event has no data");
        return;
    }

    try {
        const data = event.data.json();
        const options: NotificationOptions = {
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
        };

        event.waitUntil(
            self.registration.showNotification(data.title || "SmartDalle 🔥", options)
        );
    } catch (error) {
        console.error("[SW] Error parsing push data:", error);
    }
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
    console.log("[SW] Notification clicked");

    event.notification.close();

    const urlToOpen = (event.notification.data?.url as string) || "/dashboard";

    event.waitUntil(
        self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
            // Find an existing window
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && "focus" in client) {
                    (client as WindowClient).navigate(urlToOpen);
                    return (client as WindowClient).focus();
                }
            }
            // Open a new window if none exists
            if (self.clients.openWindow) {
                return self.clients.openWindow(urlToOpen);
            }
        })
    );
});

// Notification close handler
self.addEventListener("notificationclose", () => {
    console.log("[SW] Notification closed");
});

export {};
