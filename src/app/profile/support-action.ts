"use server";

import { createClient } from "@/utils/supabase/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendSupportEmail(formData: FormData) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Non authentifié" };
    }

    // Get user profile to check premium status
    const { data: profile } = await supabase
        .from("profiles")
        .select("is_premium, username")
        .eq("id", user.id)
        .single();

    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    if (!subject?.trim() || !message?.trim()) {
        return { success: false, error: "Sujet et message requis" };
    }

    const isPremium = profile?.is_premium === true;
    const username = profile?.username || user.email?.split("@")[0] || "Utilisateur";
    const priorityTag = isPremium ? "[PRIORITAIRE - PRO]" : "[Standard]";
    const slaInfo = isPremium ? "Réponse attendue sous 24h" : "Réponse attendue sous 72h";

    try {
        await resend.emails.send({
            from: "SmartDalle Support <onboarding@resend.dev>",
            to: ["contact@smartdalle.com"],
            replyTo: user.email || undefined,
            subject: `${priorityTag} ${subject}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: ${isPremium ? "#FFD300" : "#333"}; color: ${isPremium ? "#000" : "#fff"}; padding: 20px; border-radius: 8px 8px 0 0;">
                        <h1 style="margin: 0; font-size: 24px;">
                            ${isPremium ? "👑 Support Prioritaire" : "📧 Support Standard"}
                        </h1>
                        <p style="margin: 5px 0 0 0; font-size: 14px;">${slaInfo}</p>
                    </div>

                    <div style="background: #1a1a1a; color: #fff; padding: 20px; border-radius: 0 0 8px 8px;">
                        <p style="margin: 0 0 10px 0;"><strong>De:</strong> ${username}</p>
                        <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${user.email}</p>
                        <p style="margin: 0 0 10px 0;"><strong>User ID:</strong> ${user.id}</p>
                        <p style="margin: 0 0 10px 0;"><strong>Statut:</strong> ${isPremium ? "Premium 👑" : "Gratuit"}</p>

                        <hr style="border: none; border-top: 1px solid #333; margin: 20px 0;" />

                        <p style="margin: 0 0 10px 0;"><strong>Sujet:</strong> ${subject}</p>
                        <div style="background: #2a2a2a; padding: 15px; border-radius: 8px; margin-top: 10px;">
                            <p style="margin: 0; white-space: pre-wrap;">${message}</p>
                        </div>
                    </div>
                </div>
            `,
        });

        return { success: true };
    } catch (error) {
        console.error("Failed to send support email:", error);
        return { success: false, error: "Erreur lors de l'envoi. Réessaie plus tard." };
    }
}
