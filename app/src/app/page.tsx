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
} from "lucide-react";

const features = [
  {
    icon: Heart,
    title: "Lưu mọi thứ yêu thích",
    description:
      "Thêm links, hình ảnh, ghi chú – tất cả ở một nơi duy nhất.",
  },
  {
    icon: List,
    title: "Tổ chức theo Lists",
    description:
      "Nhóm items vào nhiều lists khác nhau, dễ tìm kiếm và quản lý.",
  },
  {
    icon: Tag,
    title: "Gắn Tags thông minh",
    description:
      "Tạo tags để phân loại nhanh và lọc qua nhiều danh sách.",
  },
  {
    icon: Share2,
    title: "Chia sẻ dễ dàng",
    description:
      "Chuyển chế độ Public và chia sẻ link cho bạn bè ngay lập tức.",
  },
  {
    icon: Shield,
    title: "Riêng tư & An toàn",
    description:
      "Private mode mặc định, chỉ bạn mới xem được items của mình.",
  },
  {
    icon: Sparkles,
    title: "Giao diện đẹp mắt",
    description:
      "Glassmorphism modern, responsive trên mọi thiết bị.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      {/* Floating Orbs */}
      <div
        className="orb"
        style={{
          width: 300,
          height: 300,
          background: "rgba(244, 143, 177, 0.6)",
          top: "10%",
          left: "-5%",
        }}
      />
      <div
        className="orb"
        style={{
          width: 200,
          height: 200,
          background: "rgba(233, 30, 99, 0.4)",
          top: "60%",
          right: "-3%",
          animationDelay: "2s",
        }}
      />
      <div
        className="orb"
        style={{
          width: 150,
          height: 150,
          background: "rgba(255, 96, 144, 0.5)",
          bottom: "10%",
          left: "30%",
          animationDelay: "4s",
        }}
      />

      {/* ─── NAVBAR ────────────────────────────────────── */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 lg:px-20 py-5">
        <Link href="/" className="flex items-center gap-2">
          <Heart className="w-8 h-8 text-white fill-white" />
          <span className="text-2xl font-bold text-white tracking-tight">
            FavLiz
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-5 py-2.5 text-white font-medium rounded-xl hover:bg-white/10 transition-all"
          >
            Đăng nhập
          </Link>
          <Link
            href="/register"
            className="px-5 py-2.5 bg-white text-[#e91e63] font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            Đăng ký
          </Link>
        </div>
      </nav>

      {/* ─── HERO ──────────────────────────────────────── */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-16 md:pt-24 pb-20">
        <div className="animate-fade-in-up">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-8">
            <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
            <span className="text-sm font-medium text-white/90">
              Công cụ quản lý yêu thích #1
            </span>
          </div>
        </div>

        <h1 className="animate-fade-in-up text-4xl md:text-6xl lg:text-7xl font-extrabold text-white max-w-4xl leading-tight">
          Lưu giữ mọi thứ
          <br />
          <span className="text-white/90">bạn yêu thích</span>
        </h1>

        <p className="animate-fade-in-up-delay-1 text-lg md:text-xl text-white/80 max-w-2xl mt-6 leading-relaxed">
          FavLiz giúp bạn lưu trữ, phân loại và chia sẻ danh sách yêu thích
          một cách gọn gàng và đẹp mắt nhất.
        </p>

        <div className="animate-fade-in-up-delay-2 flex flex-col sm:flex-row gap-4 mt-10">
          <Link
            href="/register"
            className="gradient-btn inline-flex items-center gap-2 !bg-white !text-[#e91e63] !shadow-xl hover:!shadow-2xl text-lg !px-8 !py-4 !rounded-2xl"
          >
            Bắt đầu miễn phí
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="#features"
            className="gradient-btn-outline !border-white/40 !text-white hover:!bg-white/10 text-lg !px-8 !py-4 !rounded-2xl"
          >
            Tìm hiểu thêm
          </Link>
        </div>

        {/* Hero preview card */}
        <div className="animate-fade-in-up-delay-3 mt-16 w-full max-w-3xl">
          <div className="glass-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-bold text-sm">
                FL
              </div>
              <div>
                <p className="font-semibold text-gray-800">My Favorites</p>
                <p className="text-sm text-gray-500">3 lists · 24 items</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Nhà hàng", count: 8, color: "from-orange-300 to-rose-400" },
                { label: "Phim hay", count: 6, color: "from-purple-300 to-pink-400" },
                { label: "Cafe đẹp", count: 5, color: "from-pink-300 to-red-400" },
                { label: "Sách đọc", count: 5, color: "from-rose-300 to-pink-500" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="glass-card glass-card-hover p-4 text-center cursor-pointer"
                >
                  <div
                    className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white font-bold text-lg`}
                  >
                    {item.label.substring(0, 2)}
                  </div>
                  <p className="font-semibold text-gray-700 text-sm">{item.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.count} items</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ──────────────────────────────────── */}
      <section
        id="features"
        className="relative z-10 px-6 md:px-12 lg:px-20 py-20"
      >
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Tại sao chọn FavLiz?
          </h2>
          <p className="text-white/70 mt-4 max-w-xl mx-auto text-lg">
            Mọi thứ bạn cần để quản lý danh sách yêu thích
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="glass-card glass-card-hover p-6"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── CTA ───────────────────────────────────────── */}
      <section className="relative z-10 px-6 py-20">
        <div className="glass-card max-w-3xl mx-auto text-center p-10 md:p-14">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Bắt đầu ngay hôm nay
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            Tạo tài khoản miễn phí và bắt đầu lưu trữ những thứ yêu thích
            của bạn.
          </p>
          <Link
            href="/register"
            className="gradient-btn inline-flex items-center gap-2 text-lg !px-8 !py-4 !rounded-2xl"
          >
            Đăng ký miễn phí
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ────────────────────────────────────── */}
      <footer className="relative z-10 text-center py-8 text-white/60 text-sm">
        <p>© 2026 FavLiz. Made with ❤️</p>
      </footer>
    </div>
  );
}
