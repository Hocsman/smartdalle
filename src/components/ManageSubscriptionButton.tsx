"use client";

import { useState } from "react";
import { createPortalSession } from "@/app/actions/create-portal-session";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ManageSubscriptionButton() {
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        setLoading(true);
        try {
            const { url } = await createPortalSession();
            if (url) {
                window.location.href = url;
            }
        } catch (error) {
            console.error("Failed to open billing portal:", error);
            toast.error("Impossible d'ouvrir le portail. Réessaie.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button onClick={handleClick} disabled={loading} variant="outline">
            {loading ? "Ouverture..." : "Gérer mon abonnement"}
        </Button>
    );
}
