import { api } from "./client";

export type UserProfile = {
    id: string; email: string; name: string | null; username: string | null;
    avatar: string | null; themeColor: string | null;
    itemsLabel: string | null; language: string;
};

export type UpdateProfileData = {
    name?: string;
    username?: string;
    themeColor?: string | null;
    itemsLabel?: string | null;
    language?: string;
};

export const profileApi = {
    getProfile: () => api.get<UserProfile>("/api/mobile/profile"),

    updateProfile: (data: UpdateProfileData) =>
        api.put<UserProfile>("/api/mobile/profile", data),

    changePassword: (currentPassword: string, newPassword: string) =>
        api.post<{ message: string }>("/api/mobile/profile/password", { currentPassword, newPassword }),
};
