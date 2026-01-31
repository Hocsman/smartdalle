"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function logWeight(weight: number) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const today = new Date().toISOString().split("T")[0];

    const { error } = await supabase.from("weight_logs").insert({
        user_id: user.id,
        weight: weight,
        date: today
    });

    if (error) {
        console.error("Weight log failed:", error);
        throw new Error("Failed to log weight");
    }

    revalidatePath("/progress");
}
