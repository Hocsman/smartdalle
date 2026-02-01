"use client";

import dynamic from "next/dynamic";

const ServiceWorkerRegistration = dynamic(() => import("./service-worker-registration"), { ssr: false });
const OnlineIndicator = dynamic(() => import("./online-indicator"), { ssr: false });

export default function PwaWrapper() {
    return (
        <>
            <ServiceWorkerRegistration />
            <OnlineIndicator />
        </>
    );
}
