import { api } from "./client";

export type AuthResponse = {
    access_token: string;
    refresh_token: string;
    expires_at: number;
    user: {
        id: string;
        email: string;
        name: string | null;
        username: string | null;
        avatar: string | null;
        themeColor: string | null;
        itemsLabel: string | null;
        language: string;
    };
};

export const authApi = {
    login: (email: string, password: string) =>
        api.post<AuthResponse>("/api/mobile/auth", { email, password }),

    register: (email: string, password: string) =>
        api.post<{ message: string }>("/api/mobile/auth/register", { email, password }),

    verifyOtp: (email: string, token: string) =>
        api.post<AuthResponse>("/api/mobile/auth/verify-otp", { email, token }),

    forgotPassword: (email: string) =>
        api.post<{ message: string }>("/api/mobile/auth/forgot-password", { email }),

    refreshToken: (refresh_token: string) =>
        api.post<{ access_token: string; refresh_token: string }>("/api/mobile/auth/refresh", { refresh_token }),
};
