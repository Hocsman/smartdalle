"use client";

import { useEffect, useState } from "react";
import { Wifi, WifiOff } from "lucide-react";

export function ServiceWorkerRegistration() {
    useEffect(() => {
        if (typeof window !== "undefined" && "serviceWorker" in navigator && process.env.NODE_ENV === "production") {
            navigator.serviceWorker
                .register("/sw.js")
                .then((registration) => {
                    console.log("SW registered:", registration.scope);
                })
                .catch((error) => {
                    console.error("SW registration failed:", error);
                });
        }
    }, []);

    return null;
}

export function OnlineIndicator() {
    const [isOnline, setIsOnline] = useState(true);
    const [showIndicator, setShowIndicator] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Mark as mounted (client-side only)
        setMounted(true);

        // Set initial state only on client
        if (typeof window !== "undefined") {
            setIsOnline(navigator.onLine);
        }

        const handleOnline = () => {
            setIsOnline(true);
            setShowIndicator(true);
            // Hide after 3 seconds
            setTimeout(() => setShowIndicator(false), 3000);
        };

        const handleOffline = () => {
            setIsOnline(false);
            setShowIndicator(true);
        };

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    // Don't render anything on server or if online and indicator should be hidden
    if (!mounted || (isOnline && !showIndicator)) return null;

    return (
        <div
            className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold shadow-lg transition-all duration-300 ${isOnline
                ? "bg-green-500 text-white"
                : "bg-orange-500 text-white animate-pulse"
                }`}
        >
            {isOnline ? (
                <>
                    <Wifi className="h-4 w-4" />
                    Connexion rétablie
                </>
            ) : (
                <>
                    <WifiOff className="h-4 w-4" />
                    Mode hors-ligne
                </>
            )}
        </div>
    );
}
