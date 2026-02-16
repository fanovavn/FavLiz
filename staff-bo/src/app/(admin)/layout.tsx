import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-actions";
import AdminSidebar from "@/components/admin-sidebar";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();
    if (!session) redirect("/login");

    return (
        <div className="min-h-screen flex">
            <AdminSidebar
                adminName={session.name}
                isRoot={session.isRoot}
                permissions={session.permissions}
                roles={session.roles}
            />
            <main
                className="flex-1 transition-all duration-300 lg:ml-[260px]"
                style={{ minHeight: "100vh" }}
            >
                {/* Top bar */}
                <header
                    className="sticky top-0 z-10 flex items-center justify-between px-6 lg:px-8 py-4"
                    style={{
                        background: "rgba(15, 23, 42, 0.8)",
                        backdropFilter: "blur(12px)",
                        borderBottom: "1px solid var(--color-border)",
                    }}
                >
                    <div className="lg:hidden w-10" />
                    <div className="flex-1" />
                    <div className="flex items-center gap-3">
                        <span
                            className="text-xs font-medium"
                            style={{ color: "var(--color-text-muted)" }}
                        >
                            Xin chào,{" "}
                            <span className="text-white font-semibold">
                                {session.name || session.username}
                            </span>
                        </span>
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                            style={{
                                background:
                                    "linear-gradient(135deg, #6366F1, #8B5CF6)",
                            }}
                        >
                            {(session.name || session.username)
                                .charAt(0)
                                .toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <div className="px-6 lg:px-8 py-6">{children}</div>
            </main>
        </div>
    );
}
