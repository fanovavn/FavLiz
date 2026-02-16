import { getProfile, getLanguage } from "@/lib/user-actions";
import { SettingsForm } from "@/components/settings-form";
import { t } from "@/lib/i18n";

export default async function SettingsPage() {
    const profile = await getProfile();
    const locale = await getLanguage();

    return (
        <div className="p-4 md:p-8 max-w-2xl mx-auto">
            <h1
                className="text-2xl font-bold mb-6"
                style={{ color: "#1E293B" }}
            >
                ⚙️ {t(locale, "settings.title")}
            </h1>
            <SettingsForm profile={profile} />
        </div>
    );
}
