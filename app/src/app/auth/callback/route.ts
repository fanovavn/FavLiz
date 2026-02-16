import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/dashboard';

    if (code) {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error && data.user) {
            // Sync user to Prisma
            try {
                await prisma.user.upsert({
                    where: { id: data.user.id },
                    update: { email: data.user.email! },
                    create: {
                        id: data.user.id,
                        email: data.user.email!,
                        password: '',
                    },
                });
            } catch (err) {
                console.error('Failed to sync user:', err);
            }

            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    // Return to login with error
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
