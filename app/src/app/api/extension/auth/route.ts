import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { corsResponse, corsError, handleCors } from "../helpers";

export async function OPTIONS() {
    return handleCors();
}

// POST /api/extension/auth — Login
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return corsError("Email and password are required", 400);
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return corsError(error.message, 401);
        }

        // Sync user to Prisma DB
        if (data.user) {
            await prisma.user.upsert({
                where: { id: data.user.id },
                create: {
                    id: data.user.id,
                    email: data.user.email!,
                    password: "",
                },
                update: {},
            });
        }

        // Get user profile
        const profile = await prisma.user.findUnique({
            where: { id: data.user.id },
            select: {
                id: true,
                email: true,
                name: true,
                username: true,
                avatar: true,
                themeColor: true,
            },
        });

        return corsResponse({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_at: data.session.expires_at,
            user: profile,
        });
    } catch {
        return corsError("Login failed", 500);
    }
}
