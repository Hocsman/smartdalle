"use client";

import { useState, useEffect, useCallback } from "react";
import { savePushSubscription, removePushSubscription } from "@/app/api/push/actions";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const buffer = new ArrayBuffer(rawData.length);
    const outputArray = new Uint8Array(buffer);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function usePushNotifications() {
    const [permission, setPermission] = useState<NotificationPermission>("default");
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [isSupported, setIsSupported] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Check support on mount
    useEffect(() => {
        const checkSupport = () => {
            const supported =
                typeof window !== "undefined" &&
                "serviceWorker" in navigator &&
                "PushManager" in window &&
                "Notification" in window;

            setIsSupported(supported);

            if (supported) {
                setPermission(Notification.permission);
            }
        };

        checkSupport();
    }, []);

    // Get existing subscription
    useEffect(() => {
        const getSubscription = async () => {
            if (!isSupported) return;

            try {
                const registration = await navigator.serviceWorker.ready;
                const existingSub = await registration.pushManager.getSubscription();
                setSubscription(existingSub);
            } catch {
                console.error("Error getting subscription");
            }
        };

        getSubscription();
    }, [isSupported]);

    // Subscribe to push notifications
    const subscribe = useCallback(async () => {
        if (!isSupported || !VAPID_PUBLIC_KEY) {
            setError("Push notifications non supportées");
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Request permission
            const permissionResult = await Notification.requestPermission();
            setPermission(permissionResult);

            if (permissionResult !== "granted") {
                setError("Permission refusée");
                return false;
            }

            // Get service worker registration
            const registration = await navigator.serviceWorker.ready;

            // Subscribe to push
            const newSubscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
            });

            setSubscription(newSubscription);

            // Save to database
            const subJson = newSubscription.toJSON();
            await savePushSubscription({
                endpoint: subJson.endpoint!,
                keys: {
                    p256dh: subJson.keys!.p256dh!,
                    auth: subJson.keys!.auth!,
                },
            });

            return true;
        } catch (err) {
            console.error("Error subscribing:", err);
            setError("Erreur lors de l'abonnement");
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [isSupported]);

    // Unsubscribe from push notifications
    const unsubscribe = useCallback(async () => {
        if (!subscription) return false;

        setIsLoading(true);
        setError(null);

        try {
            // Unsubscribe from push
            await subscription.unsubscribe();

            // Remove from database
            await removePushSubscription(subscription.endpoint);

            setSubscription(null);
            return true;
        } catch (err) {
            console.error("Error unsubscribing:", err);
            setError("Erreur lors de la désinscription");
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [subscription]);

    return {
        permission,
        subscription,
        isSupported,
        isLoading,
        error,
        isSubscribed: !!subscription,
        subscribe,
        unsubscribe,
    };
}
