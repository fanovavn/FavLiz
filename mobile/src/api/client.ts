import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

const API_URL = Constants.expoConfig?.extra?.apiUrl || "https://www.favliz.com";
console.log("[API] Base URL:", API_URL);

type RequestOptions = {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
    params?: Record<string, string>;
};

async function getToken(): Promise<string | null> {
    try {
        return await SecureStore.getItemAsync("access_token");
    } catch {
        return null;
    }
}

async function getRefreshToken(): Promise<string | null> {
    try {
        return await SecureStore.getItemAsync("refresh_token");
    } catch {
        return null;
    }
}

async function refreshAccessToken(): Promise<string | null> {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) return null;

    try {
        const res = await fetch(`${API_URL}/api/mobile/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (!res.ok) return null;

        const data = await res.json();
        if (data.access_token) {
            await SecureStore.setItemAsync("access_token", data.access_token);
            if (data.refresh_token) {
                await SecureStore.setItemAsync("refresh_token", data.refresh_token);
            }
            return data.access_token;
        }
        return null;
    } catch {
        return null;
    }
}

export async function apiRequest<T = unknown>(
    path: string,
    options: RequestOptions = {}
): Promise<T> {
    const { method = "GET", body, headers = {}, params } = options;

    let url = `${API_URL}${path}`;
    if (params) {
        const searchParams = new URLSearchParams(params);
        url += `?${searchParams.toString()}`;
    }

    const token = await getToken();
    const requestHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        ...headers,
    };
    if (token) {
        requestHeaders["Authorization"] = `Bearer ${token}`;
    }

    let res = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
    });

    // Auto-refresh on 401
    if (res.status === 401 && token) {
        const newToken = await refreshAccessToken();
        if (newToken) {
            requestHeaders["Authorization"] = `Bearer ${newToken}`;
            res = await fetch(url, {
                method,
                headers: requestHeaders,
                body: body ? JSON.stringify(body) : undefined,
            });
        }
    }

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
    }

    return data as T;
}

// Convenience methods
export const api = {
    get: <T = unknown>(path: string, params?: Record<string, string>) =>
        apiRequest<T>(path, { params }),

    post: <T = unknown>(path: string, body?: unknown) =>
        apiRequest<T>(path, { method: "POST", body }),

    put: <T = unknown>(path: string, body?: unknown) =>
        apiRequest<T>(path, { method: "PUT", body }),

    delete: <T = unknown>(path: string) =>
        apiRequest<T>(path, { method: "DELETE" }),
};

// Upload file (image) to server
export async function uploadFile(fileUri: string): Promise<string> {
    const token = await getToken();

    // Get file info from URI
    const filename = fileUri.split("/").pop() || "image.jpg";
    const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
    const mimeType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : ext === "gif" ? "image/gif" : "image/jpeg";

    const formData = new FormData();
    formData.append("file", {
        uri: fileUri,
        name: filename,
        type: mimeType,
    } as unknown as Blob);

    const url = `${API_URL}/api/mobile/upload`;
    const headers: Record<string, string> = {};
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(url, {
        method: "POST",
        headers,
        body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || "Upload thất bại");
    }

    return data.url;
}
