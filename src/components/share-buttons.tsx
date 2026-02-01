"use client";

import { Button } from "@/components/ui/button";
import { Share2, Twitter, MessageCircle, Link2, Check } from "lucide-react";
import { useState } from "react";

interface ShareButtonsProps {
    title: string;
    url?: string;
}

export function ShareButtons({ title, url }: ShareButtonsProps) {
    const [copied, setCopied] = useState(false);
    const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
    const shareText = `🔥 ${title} - Check out this recipe on SmartDalle!`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: shareText,
                    url: shareUrl,
                });
            } catch (err) {
                // User cancelled or error
                console.log("Share cancelled");
            }
        }
    };

    const shareOnTwitter = () => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(twitterUrl, "_blank", "noopener,noreferrer");
    };

    const shareOnWhatsApp = () => {
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    };

    return (
        <div className="flex flex-wrap gap-2">
            {/* Native Share (Mobile) */}
            {"share" in navigator && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNativeShare}
                    className="cursor-pointer"
                >
                    <Share2 className="h-4 w-4 mr-2" />
                    Partager
                </Button>
            )}

            {/* Twitter */}
            <Button
                variant="outline"
                size="icon"
                onClick={shareOnTwitter}
                className="cursor-pointer hover:bg-blue-500/20 hover:border-blue-500/50"
                title="Partager sur X/Twitter"
            >
                <Twitter className="h-4 w-4" />
            </Button>

            {/* WhatsApp */}
            <Button
                variant="outline"
                size="icon"
                onClick={shareOnWhatsApp}
                className="cursor-pointer hover:bg-green-500/20 hover:border-green-500/50"
                title="Partager sur WhatsApp"
            >
                <MessageCircle className="h-4 w-4" />
            </Button>

            {/* Copy Link */}
            <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                className={`cursor-pointer transition-colors ${copied ? "bg-green-500/20 border-green-500/50 text-green-400" : ""}`}
                title="Copier le lien"
            >
                {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
            </Button>
        </div>
    );
}
