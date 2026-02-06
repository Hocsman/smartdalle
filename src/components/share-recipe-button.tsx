"use client";

import { useState, useRef, useEffect } from "react";
import { Share2, MessageCircle, Link2, Download, X, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareRecipeButtonProps {
    recipe: {
        id: string;
        name: string;
        culture: string;
        calories: number;
        protein: number;
        price_estimated: number;
        image_url?: string | null;
    };
    variant?: "icon" | "button";
}

export function ShareRecipeButton({ recipe, variant = "icon" }: ShareRecipeButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [canNativeShare, setCanNativeShare] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        setCanNativeShare(typeof navigator !== "undefined" && !!navigator.share);
    }, []);

    const recipeUrl = typeof window !== "undefined"
        ? `${window.location.origin}/recipes/${recipe.id}`
        : `/recipes/${recipe.id}`;

    const shareText = `${recipe.name} - ${recipe.calories} kcal | ${recipe.protein}g prot | ${recipe.price_estimated}€`;

    const handleWhatsAppShare = () => {
        const text = encodeURIComponent(`${shareText}\n\nDecouvre cette recette sur SmartDalle:\n${recipeUrl}`);
        window.open(`https://wa.me/?text=${text}`, "_blank");
        setIsOpen(false);
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(recipeUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for older browsers
            const textArea = document.createElement("textarea");
            textArea.value = recipeUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDownloadStory = async () => {
        setIsGenerating(true);
        try {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            // Story dimensions (9:16 ratio for Instagram)
            const width = 1080;
            const height = 1920;
            canvas.width = width;
            canvas.height = height;

            // Background gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, "#1a1a1a");
            gradient.addColorStop(0.5, "#0f0f0f");
            gradient.addColorStop(1, "#1a1a1a");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // Grid pattern overlay
            ctx.strokeStyle = "rgba(255, 211, 0, 0.03)";
            ctx.lineWidth = 1;
            for (let x = 0; x < width; x += 50) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            }
            for (let y = 0; y < height; y += 50) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }

            // Load and draw recipe image if available
            let imageY = 200;
            if (recipe.image_url) {
                try {
                    const img = new Image();
                    img.crossOrigin = "anonymous";
                    await new Promise<void>((resolve, reject) => {
                        img.onload = () => resolve();
                        img.onerror = () => reject();
                        img.src = recipe.image_url!;
                    });

                    // Draw image with rounded corners effect
                    const imgSize = 700;
                    const imgX = (width - imgSize) / 2;
                    imageY = 250;

                    // Create clipping path for rounded corners
                    ctx.save();
                    ctx.beginPath();
                    const radius = 40;
                    ctx.moveTo(imgX + radius, imageY);
                    ctx.lineTo(imgX + imgSize - radius, imageY);
                    ctx.quadraticCurveTo(imgX + imgSize, imageY, imgX + imgSize, imageY + radius);
                    ctx.lineTo(imgX + imgSize, imageY + imgSize - radius);
                    ctx.quadraticCurveTo(imgX + imgSize, imageY + imgSize, imgX + imgSize - radius, imageY + imgSize);
                    ctx.lineTo(imgX + radius, imageY + imgSize);
                    ctx.quadraticCurveTo(imgX, imageY + imgSize, imgX, imageY + imgSize - radius);
                    ctx.lineTo(imgX, imageY + radius);
                    ctx.quadraticCurveTo(imgX, imageY, imgX + radius, imageY);
                    ctx.closePath();
                    ctx.clip();

                    ctx.drawImage(img, imgX, imageY, imgSize, imgSize);
                    ctx.restore();

                    // Image border
                    ctx.strokeStyle = "rgba(255, 211, 0, 0.3)";
                    ctx.lineWidth = 4;
                    ctx.beginPath();
                    ctx.moveTo(imgX + radius, imageY);
                    ctx.lineTo(imgX + imgSize - radius, imageY);
                    ctx.quadraticCurveTo(imgX + imgSize, imageY, imgX + imgSize, imageY + radius);
                    ctx.lineTo(imgX + imgSize, imageY + imgSize - radius);
                    ctx.quadraticCurveTo(imgX + imgSize, imageY + imgSize, imgX + imgSize - radius, imageY + imgSize);
                    ctx.lineTo(imgX + radius, imageY + imgSize);
                    ctx.quadraticCurveTo(imgX, imageY + imgSize, imgX, imageY + imgSize - radius);
                    ctx.lineTo(imgX, imageY + radius);
                    ctx.quadraticCurveTo(imgX, imageY, imgX + radius, imageY);
                    ctx.closePath();
                    ctx.stroke();

                    imageY += imgSize + 80;
                } catch {
                    imageY = 400;
                }
            } else {
                imageY = 400;
            }

            // Culture badge
            ctx.fillStyle = "#FFD300";
            const badgeText = recipe.culture.toUpperCase();
            ctx.font = "bold 36px system-ui, -apple-system, sans-serif";
            const badgeWidth = ctx.measureText(badgeText).width + 40;
            const badgeX = (width - badgeWidth) / 2;

            // Badge background
            ctx.beginPath();
            ctx.roundRect(badgeX, imageY, badgeWidth, 60, 12);
            ctx.fill();

            // Badge text
            ctx.fillStyle = "#000000";
            ctx.textAlign = "center";
            ctx.fillText(badgeText, width / 2, imageY + 42);

            imageY += 100;

            // Recipe name
            ctx.fillStyle = "#FFFFFF";
            ctx.font = "bold 72px system-ui, -apple-system, sans-serif";
            ctx.textAlign = "center";

            // Word wrap for long names
            const words = recipe.name.split(" ");
            const lines: string[] = [];
            let currentLine = "";
            const maxWidth = width - 120;

            for (const word of words) {
                const testLine = currentLine ? `${currentLine} ${word}` : word;
                if (ctx.measureText(testLine).width > maxWidth) {
                    if (currentLine) lines.push(currentLine);
                    currentLine = word;
                } else {
                    currentLine = testLine;
                }
            }
            if (currentLine) lines.push(currentLine);

            for (const line of lines) {
                ctx.fillText(line.toUpperCase(), width / 2, imageY);
                imageY += 85;
            }

            imageY += 40;

            // Stats cards
            const stats = [
                { value: `${recipe.protein}g`, label: "PROTEINES", color: "#FFD300" },
                { value: `${recipe.calories}`, label: "CALORIES", color: "#F97316" },
                { value: `${recipe.price_estimated}€`, label: "PRIX", color: "#22C55E" },
            ];

            const cardWidth = 280;
            const cardGap = 30;
            const totalCardsWidth = (cardWidth * 3) + (cardGap * 2);
            let cardX = (width - totalCardsWidth) / 2;

            for (const stat of stats) {
                // Card background
                ctx.fillStyle = `${stat.color}20`;
                ctx.beginPath();
                ctx.roundRect(cardX, imageY, cardWidth, 140, 20);
                ctx.fill();

                // Card border
                ctx.strokeStyle = `${stat.color}50`;
                ctx.lineWidth = 2;
                ctx.stroke();

                // Value
                ctx.fillStyle = stat.color;
                ctx.font = "bold 56px system-ui, -apple-system, sans-serif";
                ctx.textAlign = "center";
                ctx.fillText(stat.value, cardX + cardWidth / 2, imageY + 70);

                // Label
                ctx.fillStyle = `${stat.color}CC`;
                ctx.font = "bold 24px system-ui, -apple-system, sans-serif";
                ctx.fillText(stat.label, cardX + cardWidth / 2, imageY + 110);

                cardX += cardWidth + cardGap;
            }

            imageY += 200;

            // SmartDalle branding
            ctx.font = "bold italic 64px system-ui, -apple-system, sans-serif";
            ctx.fillStyle = "#FFFFFF";
            ctx.textAlign = "center";
            ctx.fillText("SMART", width / 2 - 80, height - 150);
            ctx.fillStyle = "#FFD300";
            ctx.fillText("DALLE", width / 2 + 110, height - 150);

            // Tagline
            ctx.font = "28px system-ui, -apple-system, sans-serif";
            ctx.fillStyle = "#888888";
            ctx.fillText("smartdalle.com", width / 2, height - 90);

            // Download the image
            const link = document.createElement("a");
            link.download = `smartdalle-${recipe.name.toLowerCase().replace(/\s+/g, "-")}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();

            setIsOpen(false);
        } catch (error) {
            console.error("Error generating story:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: recipe.name,
                    text: shareText,
                    url: recipeUrl,
                });
                setIsOpen(false);
            } catch {
                // User cancelled or error
            }
        }
    };

    return (
        <>
            {variant === "icon" ? (
                <Button
                    size="icon"
                    variant="secondary"
                    className="rounded-full shadow-lg cursor-pointer"
                    onClick={() => setIsOpen(true)}
                >
                    <Share2 className="h-5 w-5" />
                </Button>
            ) : (
                <Button
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => setIsOpen(true)}
                >
                    <Share2 className="h-4 w-4 mr-2" />
                    Partager
                </Button>
            )}

            {/* Share Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Modal Content */}
                    <div className="relative w-full sm:w-auto sm:min-w-[360px] bg-card border border-input rounded-t-3xl sm:rounded-2xl p-6 space-y-4 animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:fade-in duration-300">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">Partager la recette</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-full hover:bg-secondary/50 transition-colors"
                            >
                                <X className="h-5 w-5 text-muted-foreground" />
                            </button>
                        </div>

                        {/* Recipe Preview */}
                        <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl">
                            {recipe.image_url ? (
                                <img
                                    src={recipe.image_url}
                                    alt={recipe.name}
                                    className="w-16 h-16 rounded-lg object-cover"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center">
                                    <span className="text-2xl">🍽️</span>
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-white truncate">{recipe.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {recipe.calories} kcal | {recipe.protein}g prot
                                </p>
                            </div>
                        </div>

                        {/* Share Options */}
                        <div className="grid grid-cols-2 gap-3">
                            {/* WhatsApp */}
                            <button
                                onClick={handleWhatsAppShare}
                                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 transition-colors cursor-pointer"
                            >
                                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                                    <MessageCircle className="h-6 w-6 text-white" />
                                </div>
                                <span className="text-sm font-semibold text-white">WhatsApp</span>
                            </button>

                            {/* Copy Link */}
                            <button
                                onClick={handleCopyLink}
                                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 transition-colors cursor-pointer"
                            >
                                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                                    {copied ? (
                                        <Check className="h-6 w-6 text-white" />
                                    ) : (
                                        <Link2 className="h-6 w-6 text-white" />
                                    )}
                                </div>
                                <span className="text-sm font-semibold text-white">
                                    {copied ? "Copie !" : "Copier le lien"}
                                </span>
                            </button>

                            {/* Download Story */}
                            <button
                                onClick={handleDownloadStory}
                                disabled={isGenerating}
                                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 hover:from-purple-500/20 hover:to-pink-500/20 transition-colors cursor-pointer col-span-2"
                            >
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                    {isGenerating ? (
                                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                                    ) : (
                                        <Download className="h-6 w-6 text-white" />
                                    )}
                                </div>
                                <span className="text-sm font-semibold text-white">
                                    {isGenerating ? "Generation..." : "Telecharger Story Instagram"}
                                </span>
                            </button>

                            {/* Native Share (if available) */}
                            {canNativeShare && (
                                <button
                                    onClick={handleNativeShare}
                                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-secondary/30 border border-input hover:bg-secondary/50 transition-colors cursor-pointer col-span-2"
                                >
                                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                                        <Share2 className="h-6 w-6 text-white" />
                                    </div>
                                    <span className="text-sm font-semibold text-white">Plus d&apos;options</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden canvas for story generation */}
            <canvas ref={canvasRef} className="hidden" />
        </>
    );
}
