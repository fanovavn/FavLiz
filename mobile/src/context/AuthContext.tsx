import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as SecureStore from "expo-secure-store";
import { authApi, AuthResponse } from "../api/auth";
import { profileApi, UserProfile } from "../api/profile";

type AuthState = {
    isLoading: boolean;
    isAuthenticated: boolean;
    user: UserProfile | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    verifyOtp: (email: string, token: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (user: Partial<UserProfile>) => void;
};

const AuthContext = createContext<AuthState>({} as AuthState);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<UserProfile | null>(null);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = await SecureStore.getItemAsync("access_token");
            console.log("[Auth] Stored token:", token ? `${token.substring(0, 20)}...` : "null");

            if (token) {
                // Try to load cached user data first for fast startup
                const userData = await SecureStore.getItemAsync("user_data");
                if (userData) {
                    console.log("[Auth] Restoring cached user session");
                    setUser(JSON.parse(userData));
                }

                // Then verify token is still valid by fetching profile
                try {
                    const profile = await profileApi.getProfile();
                    console.log("[Auth] Token valid, profile loaded:", profile.email);
                    setUser(profile);
                    await SecureStore.setItemAsync("user_data", JSON.stringify(profile));
                } catch (profileErr) {
                    console.log("[Auth] Token expired, trying refresh...");
                    // Token might be expired, try refresh
                    try {
                        const refreshToken = await SecureStore.getItemAsync("refresh_token");
                        if (refreshToken) {
                            const data = await authApi.refreshToken(refreshToken);
                            await saveSession(data);
                            console.log("[Auth] Token refreshed successfully");
                        } else {
                            console.log("[Auth] No refresh token, logging out");
                            await clearSession();
                        }
                    } catch {
                        console.log("[Auth] Refresh failed, logging out");
                        await clearSession();
                    }
                }
            } else {
                console.log("[Auth] No stored token, user is not authenticated");
            }
        } catch (err) {
            console.log("[Auth] checkAuth error:", err);
            await clearSession();
        } finally {
            setIsLoading(false);
        }
    };

    const saveSession = async (data: AuthResponse) => {
        console.log("[Auth] Saving session for:", data.user?.email);
        await SecureStore.setItemAsync("access_token", data.access_token);
        await SecureStore.setItemAsync("refresh_token", data.refresh_token);
        await SecureStore.setItemAsync("user_data", JSON.stringify(data.user));
        setUser(data.user as UserProfile);
    };

    const clearSession = async () => {
        await SecureStore.deleteItemAsync("access_token");
        await SecureStore.deleteItemAsync("refresh_token");
        await SecureStore.deleteItemAsync("user_data");
        setUser(null);
    };

    const login = useCallback(async (email: string, password: string) => {
        const data = await authApi.login(email, password);
        await saveSession(data);
    }, []);

    const register = useCallback(async (email: string, password: string) => {
        await authApi.register(email, password);
    }, []);

    const verifyOtp = useCallback(async (email: string, token: string) => {
        const data = await authApi.verifyOtp(email, token);
        if (data.access_token) {
            await saveSession(data);
        }
    }, []);

    const logout = useCallback(async () => {
        console.log("[Auth] Logging out");
        await clearSession();
    }, []);

    const updateUser = useCallback((updates: Partial<UserProfile>) => {
        setUser((prev) => {
            if (!prev) return prev;
            const updated = { ...prev, ...updates };
            SecureStore.setItemAsync("user_data", JSON.stringify(updated));
            return updated;
        });
    }, []);

    return (
        <AuthContext.Provider
            value={{
                isLoading,
                isAuthenticated: !!user,
                user,
                login,
                register,
                verifyOtp,
                logout,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
