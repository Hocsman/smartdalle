"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
    const data = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
    };

    let error;

    try {
        const supabase = await createClient();
        const { error: signInError } = await supabase.auth.signInWithPassword(data);
        error = signInError;
    } catch (e) {
        console.error("Unexpected login error:", e);
        return redirect("/login?error=Server error");
    }

    if (error) {
        console.error("Login error:", error);
        return redirect("/login?error=Could not authenticate user");
    }

    revalidatePath("/", "layout");
    redirect("/onboarding");
}

export async function signup(formData: FormData) {
    const data = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
    };

    let error;

    try {
        const supabase = await createClient();
        const { error: signUpError } = await supabase.auth.signUp(data);
        error = signUpError;
    } catch (e) {
        console.error("Unexpected signup error:", e);
        return redirect("/login?error=Server error");
    }

    if (error) {
        console.error("Signup error:", error);
        return redirect("/login?error=Could not authenticate user");
    }

    revalidatePath("/", "layout");
    redirect("/onboarding");
}
