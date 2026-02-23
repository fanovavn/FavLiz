import { NextRequest } from "next/server";
import { corsResponse, corsError, handleCors, getSupabaseAdmin } from "../../helpers";

export async function OPTIONS() {
    return handleCors();
}

// POST /api/mobile/auth/refresh — Refresh access token
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { refresh_token } = body;

        if (!refresh_token) {
            return corsError("refresh_token is required", 400);
        }

        const supabase = getSupabaseAdmin();
        const { data, error } = await supabase.auth.refreshSession({ refresh_token });

        if (error) {
            return corsError(error.message, 401);
        }

        return corsResponse({
            access_token: data.session?.access_token,
            refresh_token: data.session?.refresh_token,
            expires_at: data.session?.expires_at,
        });
    } catch {
        return corsError("Token refresh failed", 500);
    }
}
