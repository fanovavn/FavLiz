import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ─── CORS Headers ────────────────────────────────────────────
const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
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
export async function getMobileUserId(request: NextRequest): Promise<{
    userId: string | null;
    error: string | null;
}> {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        return { userId: null, error: "Missing or invalid Authorization header" };
    }

    const token = authHeader.replace("Bearer ", "");

    try {
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

// ─── Supabase Admin Client ───────────────────────────────────
export function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

// ─── Slug Generator ──────────────────────────────────────────
export function generateSlug(title: string): string {
    const base = title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 50)
        .replace(/^-|-$/g, "");
    const suffix = Math.random().toString(36).slice(2, 10);
    return `${base}-${suffix}`;
}
