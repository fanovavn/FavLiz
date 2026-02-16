import Link from "next/link";
import {
    Heart,
    Unlink,
    Bookmark,
    FolderOpen,
    Share2,
    Globe,
    Sparkles,
    ShieldCheck,
    ArrowRight,
} from "lucide-react";

export default function NotFound() {
    const features = [
        {
            icon: Bookmark,
            title: "Lưu mọi thứ yêu thích",
            desc: "Công thức, địa điểm, phim, sách... tất cả trong một nơi duy nhất.",
            color: "#DB2777",
            bg: "rgba(219,39,119,0.06)",
        },
        {
            icon: FolderOpen,
            title: "Sắp xếp theo bộ sưu tập",
            desc: "Tổ chức gọn gàng với Lists và Tags thông minh.",
            color: "#7C3AED",
            bg: "rgba(124,58,237,0.06)",
        },
        {
            icon: Share2,
            title: "Chia sẻ với bạn bè",
            desc: "Tạo link công khai để chia sẻ những yêu thích của bạn.",
            color: "#2563EB",
            bg: "rgba(37,99,235,0.06)",
        },
        {
            icon: ShieldCheck,
            title: "Riêng tư & bảo mật",
            desc: "Bạn quyết định ai được xem. Mặc định luôn là Private.",
            color: "#16A34A",
            bg: "rgba(22,163,74,0.06)",
        },
    ];

    return (
        <div
            className="min-h-screen flex flex-col"
            style={{
                background: "linear-gradient(180deg, #FDF2F8 0%, #FFFFFF 40%, #F8FAFC 100%)",
            }}
        >
            {/* Header */}
            <header className="px-6 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2" style={{ textDecoration: "none" }}>
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{
                            background: "linear-gradient(135deg, #DB2777, #EC4899)",
                        }}
                    >
                        <Heart className="w-4 h-4 text-white fill-white" />
                    </div>
                    <span
                        className="text-lg font-bold"
                        style={{
                            background: "linear-gradient(135deg, #DB2777, #EC4899)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        FavLiz
                    </span>
                </Link>
                <div className="flex items-center gap-3">
                    <Link
                        href="/login"
                        className="text-sm font-medium px-4 py-2 transition-colors"
                        style={{
                            color: "var(--muted, #64748B)",
                            textDecoration: "none",
                            borderRadius: "10px",
                        }}
                    >
                        Đăng nhập
                    </Link>
                    <Link
                        href="/register"
                        className="text-sm font-semibold text-white px-5 py-2.5 transition-all"
                        style={{
                            background: "linear-gradient(135deg, #DB2777, #EC4899)",
                            borderRadius: "12px",
                            textDecoration: "none",
                            boxShadow: "0 4px 15px rgba(219,39,119,0.25)",
                        }}
                    >
                        Đăng ký miễn phí
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
                {/* 404 Hero */}
                <div className="text-center max-w-lg mb-16">
                    {/* Broken link icon */}
                    <div
                        className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
                        style={{
                            background: "linear-gradient(135deg, rgba(219,39,119,0.08), rgba(236,72,153,0.04))",
                            border: "1.5px solid rgba(219,39,119,0.12)",
                        }}
                    >
                        <Unlink className="w-9 h-9" style={{ color: "#DB2777" }} />
                    </div>

                    <h1
                        className="text-3xl md:text-4xl font-bold mb-3"
                        style={{ color: "#1E293B" }}
                    >
                        Liên kết không khả dụng
                    </h1>

                    <p
                        className="text-base md:text-lg leading-relaxed mb-2"
                        style={{ color: "#64748B" }}
                    >
                        Nội dung này có thể đã bị xóa, chuyển sang chế độ riêng tư,
                        hoặc đường link không chính xác.
                    </p>

                    <p
                        className="text-sm"
                        style={{ color: "#94A3B8" }}
                    >
                        Nếu bạn nghĩ đây là lỗi, hãy liên hệ người chia sẻ link.
                    </p>
                </div>

                {/* Features Section */}
                <div className="w-full max-w-3xl">
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Sparkles className="w-5 h-5" style={{ color: "#DB2777" }} />
                            <h2
                                className="text-xl font-bold"
                                style={{ color: "#1E293B" }}
                            >
                                Khám phá FavLiz
                            </h2>
                        </div>
                        <p className="text-sm" style={{ color: "#64748B" }}>
                            Nơi lưu giữ mọi thứ yêu thích — gọn gàng, đẹp mắt, dễ chia sẻ
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                        {features.map((f) => (
                            <div
                                key={f.title}
                                className="p-5 transition-all"
                                style={{
                                    borderRadius: "16px",
                                    background: "rgba(255,255,255,0.7)",
                                    backdropFilter: "blur(12px)",
                                    border: "1px solid rgba(226,232,240,0.5)",
                                    boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
                                }}
                            >
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                                    style={{ background: f.bg }}
                                >
                                    <f.icon className="w-5 h-5" style={{ color: f.color }} />
                                </div>
                                <h3
                                    className="text-sm font-semibold mb-1"
                                    style={{ color: "#1E293B" }}
                                >
                                    {f.title}
                                </h3>
                                <p className="text-xs leading-relaxed" style={{ color: "#64748B" }}>
                                    {f.desc}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* CTA */}
                    <div
                        className="text-center p-8"
                        style={{
                            borderRadius: "20px",
                            background: "linear-gradient(135deg, rgba(219,39,119,0.04), rgba(124,58,237,0.04))",
                            border: "1px solid rgba(219,39,119,0.1)",
                        }}
                    >
                        <Globe className="w-8 h-8 mx-auto mb-3" style={{ color: "#DB2777" }} />
                        <h3
                            className="text-lg font-bold mb-2"
                            style={{ color: "#1E293B" }}
                        >
                            Bắt đầu lưu giữ yêu thích của bạn ngay hôm nay!
                        </h3>
                        <p className="text-sm mb-5" style={{ color: "#64748B" }}>
                            Tạo tài khoản miễn phí chỉ trong 30 giây. Không cần thẻ tín dụng.
                        </p>
                        <div className="flex items-center justify-center gap-3 flex-wrap">
                            <Link
                                href="/register"
                                className="inline-flex items-center gap-2 text-sm font-semibold text-white px-6 py-3 transition-all"
                                style={{
                                    background: "linear-gradient(135deg, #DB2777, #EC4899)",
                                    borderRadius: "14px",
                                    textDecoration: "none",
                                    boxShadow: "0 6px 20px rgba(219,39,119,0.3)",
                                }}
                            >
                                Đăng ký miễn phí
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 text-sm font-medium px-6 py-3 transition-all"
                                style={{
                                    background: "rgba(255,255,255,0.8)",
                                    border: "1.5px solid rgba(226,232,240,0.8)",
                                    borderRadius: "14px",
                                    color: "#64748B",
                                    textDecoration: "none",
                                }}
                            >
                                Về trang chủ
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="text-center py-6">
                <p className="text-xs" style={{ color: "#94A3B8" }}>
                    © 2026 FavLiz · Lưu giữ mọi thứ yêu thích ❤️
                </p>
            </footer>
        </div>
    );
}
