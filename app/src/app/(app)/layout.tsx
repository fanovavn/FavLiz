import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ItemsLabelProvider } from "@/components/items-label-provider";
import { LanguageProvider } from "@/components/language-provider";
import { TagPopupProvider } from "@/components/tag-detail-popup";
import { OnboardingPopup } from "@/components/onboarding-popup";
import { prisma } from "@/lib/prisma";
import { SUPPORTED_LOCALES, type Locale, DEFAULT_LOCALE } from "@/lib/i18n";

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch user's theme color, items label, and language
    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { themeColor: true, itemsLabel: true, language: true, onboardingComplete: true, name: true },
    });

    // Sync landing_locale cookie → DB language (so landing language choice carries into the app)
    const cookieStore = await cookies();
    const cookieLocale = cookieStore.get("landing_locale")?.value as Locale | undefined;
    let locale = (dbUser?.language as Locale) || DEFAULT_LOCALE;

    if (
        cookieLocale &&
        (SUPPORTED_LOCALES as readonly string[]).includes(cookieLocale) &&
        cookieLocale !== locale
    ) {
        // Update DB to match the cookie
        await prisma.user.update({
            where: { id: user.id },
            data: { language: cookieLocale },
        });
        locale = cookieLocale;
    }

    const showOnboarding = !dbUser?.onboardingComplete || !dbUser?.name;
    const itemsLabel = dbUser?.itemsLabel || "Items";

    return (
        <ThemeProvider themeColor={dbUser?.themeColor || null}>
            <LanguageProvider locale={locale}>
                <ItemsLabelProvider itemsLabel={dbUser?.itemsLabel || null}>
                    <TagPopupProvider>
                        <div className="min-h-screen bg-[var(--background)]">
                            <AppSidebar userEmail={user.email || ""} itemsLabel={itemsLabel} />
                            {/* Main content */}
                            <main className="md:ml-[260px] min-h-screen pb-20 md:pb-0">
                                {children}
                            </main>
                        </div>
                        {showOnboarding && <OnboardingPopup />}
                    </TagPopupProvider>
                </ItemsLabelProvider>
            </LanguageProvider>
        </ThemeProvider>
    );
}

