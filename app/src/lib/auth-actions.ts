'use server';

import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export async function signUp(email: string, password: string) {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        return { error: error.message };
    }

    return { data, error: null };
}

export async function verifyOtp(email: string, token: string) {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup',
    });

    if (error) {
        return { error: error.message };
    }

    // Sync user to Prisma after successful verification
    if (data.user) {
        await syncUserToPrisma(data.user.id, data.user.email!);
    }

    return { data, error: null };
}

export async function signIn(email: string, password: string) {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { error: error.message };
    }

    // Sync user to Prisma on login
    if (data.user) {
        await syncUserToPrisma(data.user.id, data.user.email!);
    }

    return { data, error: null };
}

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
}

async function syncUserToPrisma(supabaseId: string, email: string) {
    try {
        await prisma.user.upsert({
            where: { id: supabaseId },
            update: { email },
            create: {
                id: supabaseId,
                email,
                password: '', // managed by Supabase Auth
            },
        });
    } catch (err) {
        console.error('Failed to sync user to Prisma:', err);
    }
}
