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
        return redirect("/login?error=server");
    }

    if (error) {
        console.error("Login error:", error);
        // Check if email is not confirmed
        if (error.message?.toLowerCase().includes("email not confirmed")) {
            return redirect("/login?error=email_not_confirmed");
        }
        // Check for invalid credentials
        if (error.message?.toLowerCase().includes("invalid login credentials")) {
            return redirect("/login?error=invalid_credentials");
        }
        return redirect("/login?error=auth_failed");
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
        return redirect("/login?error=server");
    }

    if (error) {
        console.error("Signup error:", error);
        // Check if user already exists
        if (error.message?.toLowerCase().includes("already registered")) {
            return redirect("/login?error=already_registered");
        }
        return redirect("/login?error=signup_failed");
    }

    // Redirect with success message to confirm email
    redirect("/login?success=signup");
}
