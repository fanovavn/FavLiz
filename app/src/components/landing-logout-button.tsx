"use client";

import { LogOut } from "lucide-react";
import { signOut } from "@/lib/auth-actions";
import { useRouter } from "next/navigation";

export function LandingLogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        await signOut();
        router.push("/");
        router.refresh();
    };

    return (
        <button
            onClick={handleLogout}
            title="Đăng xuất"
            className="flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 cursor-pointer"
            style={{
                color: "#64748B",
                border: "1px solid rgba(0,0,0,0.08)",
            }}
        >
            <LogOut className="w-4 h-4" />
        </button>
    );
}
