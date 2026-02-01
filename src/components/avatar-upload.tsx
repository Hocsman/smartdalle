"use client";

import { useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { updateAvatarUrl } from "@/app/actions/update-profile";
import { Button } from "@/components/ui/button";

interface AvatarUploadProps {
    userId: string;
    avatarUrl?: string | null;
}

export function AvatarUpload({ userId, avatarUrl }: AvatarUploadProps) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(avatarUrl || null);

    const handlePick = () => inputRef.current?.click();

    const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const supabase = createClient();
            const ext = file.name.split(".").pop() || "png";
            const filePath = `${userId}/${Date.now()}.${ext}`;

            const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(filePath, file, {
                    cacheControl: "3600",
                    upsert: true,
                });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
            const publicUrl = data.publicUrl;

            await updateAvatarUrl(publicUrl);
            setPreview(publicUrl);
        } catch (error) {
            console.error("Avatar upload failed:", error);
            alert("Upload impossible. Réessaie.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full overflow-hidden bg-secondary border border-input">
                {preview ? (
                    <img src={preview} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                    <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">
                        ?
                    </div>
                )}
            </div>
            <div>
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleChange}
                />
                <Button
                    type="button"
                    onClick={handlePick}
                    disabled={isUploading}
                    className="bg-primary text-black font-bold hover:bg-primary/90"
                >
                    {isUploading ? "Upload..." : "Changer la photo"}
                </Button>
            </div>
        </div>
    );
}
