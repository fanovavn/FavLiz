import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ─── CORS Headers ────────────────────────────────────────────
const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function corsResponse(data: unknown, status = 200) {
    return NextResponse.json(data, { status, headers: CORS_HEADERS });
}

export function corsError(message: string, status = 400) {
    return NextResponse.json({ error: message }, { status, headers: CORS_HEADERS });
}

export function handleCors() {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// ─── Auth Helper ─────────────────────────────────────────────
// Extract Bearer token → create Supabase client → get user → return userId
export async function getExtensionUserId(request: NextRequest): Promise<{
    userId: string | null;
    error: string | null;
}> {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        return { userId: null, error: "Missing or invalid Authorization header" };
    }

    const token = authHeader.replace("Bearer ", "");

    try {
        // Create a Supabase client with the user's access token
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                global: {
                    headers: { Authorization: `Bearer ${token}` },
                },
                cookies: {
                    getAll() { return []; },
                    setAll() { },
                },
            }
        );

        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return { userId: null, error: "Invalid or expired token" };
        }

        // Ensure user exists in Prisma DB
        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { id: true },
        });

        if (!dbUser) {
            return { userId: null, error: "User not found in database" };
        }

        return { userId: user.id, error: null };
    } catch {
        return { userId: null, error: "Authentication failed" };
    }
}
