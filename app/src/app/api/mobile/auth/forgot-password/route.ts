import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { corsResponse, corsError, handleCors, getSupabaseAdmin } from "../../helpers";

export async function OPTIONS() {
    return handleCors();
}

// POST /api/mobile/auth/forgot-password — Request password reset
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return corsError("Email is required", 400);
        }

        // Check if email exists
        const existingUser = await prisma.user.findFirst({
            where: { email },
            select: { id: true },
        });

        if (!existingUser) {
            return corsError("Email not registered", 404);
        }

        const supabase = getSupabaseAdmin();
        const { error } = await supabase.auth.resetPasswordForEmail(email);

        if (error) {
            return corsError(error.message, 400);
        }

        return corsResponse({ message: "Password reset email sent" });
    } catch {
        return corsError("Failed to request password reset", 500);
    }
}
