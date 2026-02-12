import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
    dest: "public",
    // Ne pas désactiver en dev pour tester les push notifications
    disable: false,
    register: true,
    cacheOnFrontEndNav: true,
    reloadOnOnline: true,
    customWorkerSrc: "service-worker",
    customWorkerDest: "public",
    customWorkerPrefix: "sw",
});

const nextConfig: NextConfig = {
    // Allow Turbopack to work with webpack-based plugins
    turbopack: {},
};

export default withPWA(nextConfig);
