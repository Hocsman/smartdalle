import { NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";
import { createClient } from "@/utils/supabase/server";

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check Premium Status
    const { data: profile } = await supabase
        .from("profiles")
        .select("is_premium")
        .eq("id", user.id)
        .single();

    if (!profile?.is_premium) {
        return new NextResponse("Premium Required", { status: 403 });
    }

    const { recipeName, recipeId } = await req.json();

    if (!recipeName) return new NextResponse("Recipe name required", { status: 400 });

    const openai = getOpenAIClient();

    try {
        const prompt = `A professional, hyper-realistic, appetizing food photography shot of ${recipeName}. Michelin guide style, 8k resolution, soft natural lighting, shallow depth of field.`;

        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: "1024x1024",
        });

        const imageUrl = response.data?.[0]?.url;

        if (!imageUrl) throw new Error("No image generated");

        // Fetch image blob
        const imageRes = await fetch(imageUrl);
        const blob = await imageRes.blob();

        // Upload to Supabase Storage (bucket 'recipes')
        const fileName = `${user.id}/${Date.now()}-${recipeId}.png`;
        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('recipes')
            .upload(fileName, blob, {
                contentType: 'image/png'
            });

        if (uploadError) throw uploadError;

        // Get Public URL
        const { data: { publicUrl } } = supabase
            .storage
            .from('recipes')
            .getPublicUrl(fileName);

        // Update Recipe in DB
        if (recipeId) {
            await supabase.from("recipes").update({ image_url: publicUrl }).eq("id", recipeId);
        }

        return NextResponse.json({ url: publicUrl });

    } catch (error: any) {
        console.error("OpenAI Error:", error);
        return new NextResponse(error.message || "Internal Server Error", { status: 500 });
    }
}
