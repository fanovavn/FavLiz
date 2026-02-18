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

/* ── Password Recovery ─────────────────────── */

export async function requestPasswordReset(email: string) {
    // Check if email exists in our database
    const existingUser = await prisma.user.findFirst({
        where: { email },
        select: { id: true },
    });

    if (!existingUser) {
        return { error: 'Email chưa được đăng ký trong hệ thống' };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
        return { error: error.message };
    }

    return { error: null };
}

export async function verifyRecoveryOtp(email: string, token: string) {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'recovery',
    });

    if (error) {
        return { error: error.message };
    }

    return { data, error: null };
}

export async function updatePassword(newPassword: string) {
    const supabase = await createClient();

    const { error } = await supabase.auth.updateUser({
        password: newPassword,
    });

    if (error) {
        return { error: error.message };
    }

    // Sign out so user can log in fresh with new password
    await supabase.auth.signOut();

    return { error: null };
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
