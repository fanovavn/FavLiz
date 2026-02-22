import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/extension/set-session?access_token=...&refresh_token=...&redirect=...
// Called by the extension to sync auth. Sets Supabase cookies then redirects.
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const access_token = searchParams.get("access_token");
    const refresh_token = searchParams.get("refresh_token");
    const redirect = searchParams.get("redirect") || "/dashboard";

    if (!access_token || !refresh_token) {
        return NextResponse.redirect(
            new URL("/login?error=missing_tokens", request.url)
        );
    }

    try {
        const supabase = await createClient();

        const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
        });

        if (error) {
            console.error("[set-session] Supabase error:", error.message);
            return NextResponse.redirect(
                new URL("/login?error=session_failed", request.url)
            );
        }

        // Redirect to the requested page (default: dashboard)
        return NextResponse.redirect(new URL(redirect, request.url));
    } catch (err) {
        console.error("[set-session] Error:", err);
        return NextResponse.redirect(
            new URL("/login?error=session_failed", request.url)
        );
    }
}
