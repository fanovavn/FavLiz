import { NextRequest } from "next/server";
import { corsResponse, corsError, handleCors, getSupabaseAdmin } from "../../helpers";

export async function OPTIONS() {
    return handleCors();
}

// POST /api/mobile/auth/register — Sign up (sends OTP)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return corsError("Email and password are required", 400);
        }

        const supabase = getSupabaseAdmin();
        const { data, error } = await supabase.auth.signUp({ email, password });

        if (error) {
            return corsError(error.message, 400);
        }

        return corsResponse({ message: "OTP sent to email", user: data.user ? { id: data.user.id, email: data.user.email } : null });
    } catch {
        return corsError("Registration failed", 500);
    }
}
