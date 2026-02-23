import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { corsResponse, corsError, handleCors, getSupabaseAdmin } from "../../helpers";

export async function OPTIONS() {
    return handleCors();
}

// POST /api/mobile/auth/verify-otp — Verify OTP
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, token } = body;

        if (!email || !token) {
            return corsError("Email and token are required", 400);
        }

        const supabase = getSupabaseAdmin();
        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: "signup",
        });

        if (error) {
            return corsError(error.message, 400);
        }

        // Sync user to Prisma after successful verification
        if (data.user) {
            await prisma.user.upsert({
                where: { id: data.user.id },
                create: { id: data.user.id, email: data.user.email!, password: "" },
                update: { email: data.user.email! },
            });
        }

        return corsResponse({
            access_token: data.session?.access_token,
            refresh_token: data.session?.refresh_token,
            expires_at: data.session?.expires_at,
            user: data.user ? { id: data.user.id, email: data.user.email } : null,
        });
    } catch {
        return corsError("OTP verification failed", 500);
    }
}
