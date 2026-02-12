"use client";

import { useEffect } from "react";

export function ServiceWorkerProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        if (typeof window === "undefined") return;
        if (!("serviceWorker" in navigator)) {
            console.log("[PWA] Service Worker non supporté");
            return;
        }

        // next-pwa devrait gérer l'enregistrement automatiquement
        // Ce provider sert de fallback et de debug
        const checkServiceWorker = async () => {
            try {
                const registrations = await navigator.serviceWorker.getRegistrations();
                if (registrations.length > 0) {
                    console.log("[PWA] Service Worker actif:", registrations[0].active?.scriptURL);
                } else {
                    console.log("[PWA] Aucun Service Worker enregistré, tentative manuelle...");
                    // Fallback: enregistrer manuellement si next-pwa n'a pas fonctionné
                    const registration = await navigator.serviceWorker.register("/sw.js", {
                        scope: "/",
                    });
                    console.log("[PWA] Service Worker enregistré manuellement:", registration.scope);
                }
            } catch (error) {
                console.error("[PWA] Erreur Service Worker:", error);
            }
        };

        // Attendre que la page soit complètement chargée
        if (document.readyState === "complete") {
            checkServiceWorker();
        } else {
            window.addEventListener("load", checkServiceWorker);
            return () => window.removeEventListener("load", checkServiceWorker);
        }
    }, []);

    return <>{children}</>;
}
