import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ItemsLabelProvider } from "@/components/items-label-provider";
import { LanguageProvider } from "@/components/language-provider";
import { prisma } from "@/lib/prisma";
import { type Locale, DEFAULT_LOCALE } from "@/lib/i18n";

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
        select: { themeColor: true, itemsLabel: true, language: true },
    });

    const itemsLabel = dbUser?.itemsLabel || "Items";
    const locale = (dbUser?.language as Locale) || DEFAULT_LOCALE;

    return (
        <ThemeProvider themeColor={dbUser?.themeColor || null}>
            <LanguageProvider locale={locale}>
                <ItemsLabelProvider itemsLabel={dbUser?.itemsLabel || null}>
                    <div className="min-h-screen bg-[var(--background)]">
                        <AppSidebar userEmail={user.email || ""} itemsLabel={itemsLabel} />
                        {/* Main content */}
                        <main className="md:ml-[260px] min-h-screen pb-20 md:pb-0">
                            {children}
                        </main>
                    </div>
                </ItemsLabelProvider>
            </LanguageProvider>
        </ThemeProvider>
    );
}

