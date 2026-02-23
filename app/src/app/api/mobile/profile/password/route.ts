import { NextRequest } from "next/server";
import { getMobileUserId, corsResponse, corsError, handleCors, getSupabaseAdmin } from "../../helpers";

export async function OPTIONS() {
    return handleCors();
}

// POST /api/mobile/profile/password — Change password
export async function POST(request: NextRequest) {
    const { userId, error: authError } = await getMobileUserId(request);
    if (!userId) return corsError(authError || "Unauthorized", 401);

    try {
        const body = await request.json();
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return corsError("Current password and new password are required", 400);
        }

        if (newPassword.length < 6) {
            return corsError("New password must be at least 6 characters", 400);
        }

        // Get the user's email for re-auth
        const { prisma } = await import("@/lib/prisma");
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true },
        });

        if (!user) return corsError("User not found", 404);

        // Verify current password by trying to sign in
        const supabase = getSupabaseAdmin();
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: currentPassword,
        });

        if (signInError) {
            return corsError("Current password is incorrect", 401);
        }

        // Update password using admin client
        // Note: since we have the token from getMobileUserId, we use admin API
        const { createServerClient } = await import("@supabase/ssr");
        const authHeader = request.headers.get("Authorization")!;
        const token = authHeader.replace("Bearer ", "");

        const userSupabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                global: { headers: { Authorization: `Bearer ${token}` } },
                cookies: { getAll() { return []; }, setAll() { } },
            }
        );

        const { error: updateError } = await userSupabase.auth.updateUser({
            password: newPassword,
        });

        if (updateError) {
            return corsError(updateError.message, 400);
        }

        return corsResponse({ message: "Password updated successfully" });
    } catch (err) {
        console.error("Change password error:", err);
        return corsError("Failed to change password", 500);
    }
}
