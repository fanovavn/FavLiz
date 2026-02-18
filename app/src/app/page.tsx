import Link from "next/link";
import {
  Heart,
  List,
  Tag,
  Share2,
  Shield,
  Sparkles,
  ArrowRight,
  Star,
  Zap,
  UserPlus,
  FolderPlus,
  Globe,
  Bookmark,
  Users,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { LandingLogoutButton } from "@/components/landing-logout-button";

/* ── Data ────────────────────────────────────────────── */
const features = [
  {
    icon: Heart,
    title: "Lưu mọi thứ yêu thích",
    description: "Thêm links, hình ảnh, ghi chú – tất cả ở một nơi duy nhất.",
    gradient: "from-rose-500 to-pink-600",
  },
  {
    icon: List,
    title: "Tổ chức theo Lists",
    description: "Nhóm items vào nhiều lists khác nhau, dễ tìm kiếm và quản lý.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: Tag,
    title: "Gắn Tags thông minh",
    description: "Tạo tags để phân loại nhanh và lọc qua nhiều danh sách.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Share2,
    title: "Chia sẻ dễ dàng",
    description: "Chuyển chế độ Public và chia sẻ link cho bạn bè ngay lập tức.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: Shield,
    title: "Riêng tư & An toàn",
    description: "Private mode mặc định, chỉ bạn mới xem được items của mình.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: Sparkles,
    title: "Giao diện đẹp mắt",
    description: "Glassmorphism modern, responsive trên mọi thiết bị.",
    gradient: "from-pink-500 to-rose-500",
  },
];

const steps = [
  {
    icon: UserPlus,
    number: "01",
    title: "Tạo tài khoản",
    description: "Đăng ký miễn phí chỉ trong 30 giây với email của bạn.",
  },
  {
    icon: FolderPlus,
    number: "02",
    title: "Thêm items yêu thích",
    description: "Lưu trữ links, hình ảnh, ghi chú vào các lists tùy chỉnh.",
  },
  {
    icon: Globe,
    number: "03",
    title: "Chia sẻ với mọi người",
    description: "Public lists và share link cho bạn bè, đồng nghiệp.",
  },
];

const stats = [
  { icon: Users, value: "500+", label: "Người dùng" },
  { icon: Bookmark, value: "10K+", label: "Items đã lưu" },
  { icon: List, value: "2K+", label: "Lists được tạo" },
  { icon: Star, value: "4.9", label: "Đánh giá" },
];

export default async function LandingPage() {
  /* ── Auth check ────────────────────────────── */
  let isLoggedIn = false;
  let userName: string | null = null;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      isLoggedIn = true;
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { name: true },
      });
      userName = dbUser?.name || null;
    }
  } catch {
    // Not logged in, proceed as guest
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ background: "#F8FAFC", color: "#1E293B" }}
    >
      {/* ── Animated Background ──────────────────── */}
      <div className="landing-bg-gradient" />
      <div className="landing-grid-overlay" />

      {/* Floating Orbs */}
      <div className="landing-orb landing-orb-1" />
      <div className="landing-orb landing-orb-2" />
      <div className="landing-orb landing-orb-3" />
      <div className="landing-orb landing-orb-4" />

      {/* ─── NAVBAR ────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50"
        style={{
          background: "rgba(248, 250, 252, 0.8)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
        }}
      >
        <div className="flex items-center justify-between max-w-[1200px] mx-auto px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <Heart className="w-7 h-7 fill-pink-500" style={{ color: "#DB2777" }} />
            <span className="text-2xl font-extrabold landing-gradient-text">FavLiz</span>
          </Link>

          {isLoggedIn ? (
            /* ── Authenticated state ─── */
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium" style={{ color: "#64748B" }}>
                Xin chào,{" "}
                <span className="font-semibold" style={{ color: "#1E293B" }}>
                  {userName || "bạn"}
                </span>
              </span>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white rounded-lg transition-all duration-200 no-underline hover:scale-[1.02]"
                style={{
                  background: "linear-gradient(135deg, #DB2777, #EC4899)",
                  boxShadow: "0 4px 16px rgba(219, 39, 119, 0.25)",
                }}
              >
                Vào ứng dụng
              </Link>
              <LandingLogoutButton />
            </div>
          ) : (
            /* ── Guest state ─── */
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden md:inline-flex px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200 no-underline"
                style={{ color: "#64748B" }}
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white rounded-lg transition-all duration-200 no-underline hover:scale-[1.02]"
                style={{
                  background: "linear-gradient(135deg, #DB2777, #EC4899)",
                  boxShadow: "0 4px 16px rgba(219, 39, 119, 0.25)",
                }}
              >
                <Zap className="w-4 h-4" />
                Bắt đầu miễn phí
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* ─── HERO ──────────────────────────────────── */}
      <section className="relative z-[1] grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-10 items-center max-w-[1200px] mx-auto px-6 pt-12 lg:pt-20 pb-16">
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[0.82rem] font-medium mb-7 animate-fade-in-up"
            style={{
              background: "rgba(219, 39, 119, 0.08)",
              border: "1px solid rgba(219, 39, 119, 0.15)",
              color: "#DB2777",
            }}
          >
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span>Công cụ quản lý yêu thích #1 Việt Nam</span>
          </div>

          {/* Heading */}
          <h1
            className="text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.1] tracking-tight animate-fade-in-up"
            style={{ color: "#1E293B" }}
          >
            Lưu giữ mọi thứ
            <br />
            <span className="landing-gradient-text-accent">bạn yêu thích</span>
          </h1>

          {/* Subheading */}
          <p
            className="text-lg leading-relaxed mt-5 max-w-[480px] animate-fade-in-up"
            style={{ color: "#64748B", animationDelay: "150ms" }}
          >
            FavLiz giúp bạn lưu trữ, phân loại và chia sẻ danh sách yêu thích
            một cách gọn gàng và đẹp mắt nhất.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3.5 mt-9 w-full sm:w-auto animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            <Link
              href={isLoggedIn ? "/dashboard" : "/register"}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold text-white rounded-[14px] transition-all duration-250 no-underline hover:translate-y-[-2px]"
              style={{
                background: "linear-gradient(135deg, #DB2777, #EC4899)",
                boxShadow: "0 4px 24px rgba(219, 39, 119, 0.3)",
              }}
            >
              {isLoggedIn ? "Vào ứng dụng" : "Bắt đầu miễn phí"}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-medium rounded-[14px] transition-all duration-250 no-underline hover:translate-y-[-1px]"
              style={{
                color: "#64748B",
                border: "1px solid rgba(0, 0, 0, 0.1)",
              }}
            >
              Tìm hiểu thêm
            </Link>
          </div>
        </div>

        {/* Hero Preview Card */}
        <div className="relative flex justify-center animate-fade-in-up" style={{ animationDelay: "450ms" }}>
          <div
            className="relative w-full max-w-[440px] rounded-[20px] overflow-hidden"
            style={{
              background: "rgba(255, 255, 255, 0.72)",
              border: "1px solid rgba(0, 0, 0, 0.06)",
              boxShadow: "0 24px 80px rgba(0, 0, 0, 0.08), 0 4px 24px rgba(219, 39, 119, 0.06)",
            }}
          >
            {/* Browser Header */}
            <div
              className="flex items-center gap-3 px-4 py-3"
              style={{
                background: "rgba(241, 245, 249, 0.6)",
                borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
              }}
            >
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
              </div>
              <span className="text-[0.72rem] font-mono" style={{ color: "#94A3B8" }}>
                favliz.com/my-favorites
              </span>
            </div>

            {/* Body */}
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-[42px] h-[42px] rounded-xl flex items-center justify-center font-bold text-sm text-white"
                  style={{ background: "linear-gradient(135deg, #DB2777, #EC4899)" }}
                >
                  FL
                </div>
                <div>
                  <p className="font-bold text-[0.95rem]" style={{ color: "#1E293B" }}>My Favorites</p>
                  <p className="text-[0.78rem] mt-0.5" style={{ color: "#94A3B8" }}>3 lists · 24 items</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: "Nhà hàng", count: 8, emoji: "🍜", bg: "rgba(249, 115, 22, 0.08)" },
                  { label: "Phim hay", count: 6, emoji: "🎬", bg: "rgba(168, 85, 247, 0.08)" },
                  { label: "Cafe đẹp", count: 5, emoji: "☕", bg: "rgba(20, 184, 166, 0.08)" },
                  { label: "Sách đọc", count: 5, emoji: "📚", bg: "rgba(236, 72, 153, 0.08)" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="p-4 rounded-[14px] text-center transition-all duration-250 hover:translate-y-[-2px]"
                    style={{
                      background: item.bg,
                      border: "1px solid rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <span className="text-[1.6rem] block mb-2">{item.emoji}</span>
                    <p className="text-[0.82rem] font-semibold" style={{ color: "#1E293B" }}>
                      {item.label}
                    </p>
                    <p className="text-[0.7rem] mt-0.5" style={{ color: "#94A3B8" }}>
                      {item.count} items
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating badges */}
            <div className="landing-float-badge landing-float-badge-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Đã lưu!</span>
            </div>
            <div className="landing-float-badge landing-float-badge-2">
              <Share2 className="w-4 h-4 text-blue-500" />
              <span>Đã chia sẻ</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS BAR ─────────────────────────────── */}
      <section
        className="relative z-[1]"
        style={{
          borderTop: "1px solid rgba(0, 0, 0, 0.05)",
          borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
          background: "rgba(255, 255, 255, 0.5)",
        }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 max-w-[1000px] mx-auto px-6 py-8 gap-6 md:gap-0">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex flex-col items-center gap-1.5 text-center">
                <Icon className="w-5 h-5" style={{ color: "#DB2777" }} />
                <span className="text-3xl font-extrabold tracking-tight" style={{ color: "#1E293B" }}>{stat.value}</span>
                <span className="text-[0.82rem] font-medium" style={{ color: "#94A3B8" }}>
                  {stat.label}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── HOW IT WORKS ──────────────────────────── */}
      <section className="relative z-[1] py-20 px-6" id="how">
        <div className="max-w-[1100px] mx-auto">
          {/* Header */}
          <div className="text-center mb-14">
            <span
              className="inline-block px-4 py-1.5 rounded-full text-[0.8rem] font-semibold tracking-wide mb-4"
              style={{
                background: "rgba(219, 39, 119, 0.08)",
                border: "1px solid rgba(219, 39, 119, 0.15)",
                color: "#DB2777",
              }}
            >
              Đơn giản & Nhanh chóng
            </span>
            <h2 className="text-3xl md:text-[2.4rem] font-extrabold tracking-tight" style={{ color: "#1E293B" }}>
              Bắt đầu trong <span className="landing-gradient-text-accent">3 bước</span>
            </h2>
            <p className="text-[1.05rem] mt-3 max-w-[500px] mx-auto" style={{ color: "#64748B" }}>
              Chỉ mất chưa đến 1 phút để bắt đầu lưu trữ những thứ yêu thích của bạn
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7 max-w-[400px] md:max-w-none mx-auto">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="relative p-8 rounded-[20px] text-center transition-all duration-300 hover:translate-y-[-4px]"
                  style={{
                    background: "rgba(255, 255, 255, 0.72)",
                    border: "1px solid rgba(0, 0, 0, 0.06)",
                    boxShadow: "0 4px 24px rgba(0, 0, 0, 0.04)",
                  }}
                >
                  <div className="text-[0.72rem] font-bold tracking-widest mb-4" style={{ color: "#F472B6" }}>
                    {step.number}
                  </div>
                  <div
                    className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, #DB2777, #EC4899)",
                      boxShadow: "0 8px 24px rgba(219, 39, 119, 0.25)",
                    }}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-[1.1rem] font-bold mb-2" style={{ color: "#1E293B" }}>{step.title}</h3>
                  <p className="text-[0.88rem] leading-relaxed" style={{ color: "#64748B" }}>
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ──────────────────────────────── */}
      <section className="relative z-[1] py-20 px-6" id="features">
        <div className="max-w-[1100px] mx-auto">
          {/* Header */}
          <div className="text-center mb-14">
            <span
              className="inline-block px-4 py-1.5 rounded-full text-[0.8rem] font-semibold tracking-wide mb-4"
              style={{
                background: "rgba(219, 39, 119, 0.08)",
                border: "1px solid rgba(219, 39, 119, 0.15)",
                color: "#DB2777",
              }}
            >
              Tính năng nổi bật
            </span>
            <h2 className="text-3xl md:text-[2.4rem] font-extrabold tracking-tight" style={{ color: "#1E293B" }}>
              Tại sao chọn <span className="landing-gradient-text-accent">FavLiz?</span>
            </h2>
            <p className="text-[1.05rem] mt-3 max-w-[500px] mx-auto" style={{ color: "#64748B" }}>
              Mọi thứ bạn cần để quản lý danh sách yêu thích
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-[400px] md:max-w-none mx-auto">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="p-7 rounded-[20px] transition-all duration-300 hover:translate-y-[-4px]"
                  style={{
                    background: "rgba(255, 255, 255, 0.72)",
                    border: "1px solid rgba(0, 0, 0, 0.06)",
                    boxShadow: "0 4px 24px rgba(0, 0, 0, 0.04)",
                  }}
                >
                  <div
                    className={`w-12 h-12 rounded-[14px] flex items-center justify-center mb-4 bg-gradient-to-br ${feature.gradient}`}
                    style={{ boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)" }}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-[1.05rem] font-bold mb-2" style={{ color: "#1E293B" }}>{feature.title}</h3>
                  <p className="text-[0.88rem] leading-relaxed" style={{ color: "#64748B" }}>
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── CTA ───────────────────────────────────── */}
      <section className="relative z-[1] py-20 px-6">
        <div
          className="relative max-w-[720px] mx-auto text-center py-14 px-6 md:px-10 rounded-[28px] overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(219, 39, 119, 0.06), rgba(236, 72, 153, 0.04))",
            border: "1px solid rgba(219, 39, 119, 0.12)",
          }}
        >
          {/* Glow */}
          <div
            className="absolute pointer-events-none"
            style={{
              inset: "-50%",
              background: "radial-gradient(ellipse at center, rgba(219, 39, 119, 0.06) 0%, transparent 70%)",
            }}
          />
          <Sparkles className="w-10 h-10 mx-auto mb-4 relative" style={{ color: "#DB2777" }} />
          <h2 className="text-2xl md:text-[2.2rem] font-extrabold mb-3 relative" style={{ color: "#1E293B" }}>
            Bắt đầu ngay hôm nay
          </h2>
          <p className="text-base relative mb-8 leading-relaxed" style={{ color: "#64748B" }}>
            Tạo tài khoản miễn phí và bắt đầu lưu trữ những thứ yêu thích của bạn.
            <br />
            Không cần thẻ tín dụng.
          </p>
          <Link
            href={isLoggedIn ? "/dashboard" : "/register"}
            className="relative inline-flex items-center gap-2 px-10 py-4 text-lg font-semibold text-white rounded-[14px] transition-all duration-250 no-underline hover:translate-y-[-2px]"
            style={{
              background: "linear-gradient(135deg, #DB2777, #EC4899)",
              boxShadow: "0 4px 24px rgba(219, 39, 119, 0.3)",
            }}
          >
            {isLoggedIn ? "Vào ứng dụng" : "Đăng ký miễn phí"}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ────────────────────────────────── */}
      <footer
        className="relative z-[1] px-6 py-7"
        style={{ borderTop: "1px solid rgba(0, 0, 0, 0.06)" }}
      >
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 fill-pink-500" style={{ color: "#DB2777" }} />
            <span className="text-lg font-bold" style={{ color: "#1E293B" }}>FavLiz</span>
          </div>
          <p className="text-[0.82rem]" style={{ color: "#94A3B8" }}>
            © 2026 FavLiz. Made with ❤️ in Vietnam
          </p>
        </div>
      </footer>
    </div>
  );
}
