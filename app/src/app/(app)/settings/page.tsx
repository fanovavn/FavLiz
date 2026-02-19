import { getProfile, getLanguage } from "@/lib/user-actions";
import { SettingsForm } from "@/components/settings-form";
import { t } from "@/lib/i18n";
import { Settings } from "lucide-react";

export default async function SettingsPage() {
    const profile = await getProfile();
    const locale = await getLanguage();

    return (
        <div className="p-4 md:p-8 max-w-[1280px] mx-auto">
            {/* Page Header */}
            <div className="flex items-center gap-3 mb-6">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: "var(--primary)", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}
                >
                    <Settings className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: "#1E293B" }}>
                        {t(locale, "settings.title")}
                    </h1>
                    <p className="text-sm" style={{ color: "var(--muted)" }}>
                        Quản lý tài khoản và tùy chỉnh ứng dụng
                    </p>
                </div>
            </div>
            <SettingsForm profile={profile} />
        </div>
    );
}
