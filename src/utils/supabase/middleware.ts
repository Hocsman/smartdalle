import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.warn("Supabase Env Vars missing in Middleware. Skipping auth check.");
        return response;
    }

    try {
        const supabase = createServerClient(
            supabaseUrl,
            supabaseKey,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            request.cookies.set(name, value);
                        });
                        response = NextResponse.next({
                            request: {
                                headers: request.headers,
                            },
                        });
                        cookiesToSet.forEach(({ name, value, options }) => {
                            response.cookies.set(name, value, options);
                        });
                    },
                },
            }
        );

        // IMPORTANT: Avoid writing any logic between createServerClient and
        // supabase.auth.getUser().
        const {
            data: { user },
        } = await supabase.auth.getUser();

        // Redirect logged-in users away from login page
        if (
            user &&
            request.nextUrl.pathname.startsWith("/login")
        ) {
            const url = request.nextUrl.clone();
            url.pathname = "/dashboard";
            return NextResponse.redirect(url);
        }

        // Redirect non-logged-in users to login page
        if (
            !user &&
            !request.nextUrl.pathname.startsWith("/login") &&
            !request.nextUrl.pathname.startsWith("/auth") &&
            request.nextUrl.pathname !== "/"
        ) {
            const url = request.nextUrl.clone();
            url.pathname = "/login";
            return NextResponse.redirect(url);
        }
    } catch (e) {
        console.error("Middleware Error:", e);
        // On error, we allow the request to proceed (or could redirect to error page)
        // For MVP, safer to proceed than block everything with 500
        return response;
    }

    return response;
}
