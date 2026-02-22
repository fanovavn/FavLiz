import { motion } from "motion/react";
import {
  Globe,
  Puzzle,
  Smartphone,
  LayoutDashboard,
  ListChecks,
  Tags,
  Upload,
  Share2,
  Languages,
  MousePointerClick,
  Zap,
  Clock,
  MessageSquare,
  Ban,
  RefreshCw,
  Link,
  BellRing,
} from "lucide-react";

const products = [
  {
    status: "Production",
    statusColor: "bg-green-100 text-green-700",
    icon: Globe,
    title: "Web App",
    subtitle: "Dashboard đầy đủ tính năng",
    gradient: "from-pink-500 to-rose-500",
    features: [
      { icon: LayoutDashboard, text: "Dashboard tổng quan" },
      { icon: ListChecks, text: "Items CRUD đầy đủ" },
      { icon: Tags, text: "Lists + Tags linh hoạt" },
      { icon: Upload, text: "Upload thumbnail" },
      { icon: Share2, text: "Share public" },
      { icon: Languages, text: "6 ngôn ngữ" },
    ],
    screenshotHint: "📸 Screenshot: Dashboard + Item detail",
  },
  {
    status: "Production",
    statusColor: "bg-green-100 text-green-700",
    icon: Puzzle,
    title: "Chrome Extension",
    subtitle: "Lưu nhanh không cần rời trang",
    gradient: "from-rose-500 to-pink-600",
    features: [
      { icon: MousePointerClick, text: "Floating button mọi website" },
      { icon: Zap, text: "Extract metadata tự động" },
      { icon: Clock, text: "Save nhanh < 5 giây" },
      { icon: MessageSquare, text: "Inline button: Reddit, FB, IG, X" },
      { icon: Ban, text: "Không cần rời trang" },
    ],
    screenshotHint: "📸 Screenshot: Inline button Reddit + Popup extension",
  },
  {
    status: "Coming Soon",
    statusColor: "bg-pink-100 text-pink-700",
    icon: Smartphone,
    title: "Mobile App",
    subtitle: "iOS & Android (React Native)",
    gradient: "from-pink-600 to-rose-600",
    features: [
      { icon: RefreshCw, text: "Sync toàn bộ items" },
      { icon: Share2, text: "Share sheet từ app khác" },
      { icon: Zap, text: "Save từ Safari / Chrome mobile" },
      { icon: Link, text: "Deep link mở đúng item" },
    ],
    screenshotHint: "📸 Screenshot: Mobile app mockup",
    cta: true,
  },
];

export function ProductsSection() {
  return (
    <section id="products" className="py-20 md:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span
            className="inline-block px-4 py-1.5 bg-pink-100 text-pink-600 rounded-full mb-6"
            style={{ fontSize: "0.85rem", fontWeight: 600 }}
          >
            Sản phẩm
          </span>
          <h2
            style={{
              fontSize: "clamp(1.8rem, 4vw, 3rem)",
              fontWeight: 800,
              lineHeight: 1.2,
            }}
            className="text-gray-900 mb-4"
          >
            FavLiz hoạt động trên{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">
              mọi thiết bị
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {products.map((product, i) => (
            <motion.div
              key={product.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="group bg-white rounded-2xl border border-gray-100 hover:border-pink-200 hover:shadow-xl hover:shadow-pink-500/5 transition-all overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className={`p-6 bg-gradient-to-br ${product.gradient} text-white`}>
                <div className="flex items-center justify-between mb-4">
                  <product.icon className="w-8 h-8" />
                  <span
                    className={`px-3 py-1 rounded-full ${product.statusColor}`}
                    style={{ fontSize: "0.75rem", fontWeight: 600 }}
                  >
                    {product.status}
                  </span>
                </div>
                <h3
                  style={{ fontSize: "1.5rem", fontWeight: 700 }}
                  className="mb-1"
                >
                  {product.title}
                </h3>
                <p style={{ fontSize: "0.9rem" }} className="text-white/80">
                  {product.subtitle}
                </p>
              </div>

              {/* Features */}
              <div className="p-6 flex-1">
                <div className="space-y-3">
                  {product.features.map((feature) => (
                    <div key={feature.text} className="flex items-center gap-3">
                      <feature.icon className="w-4 h-4 text-pink-400 flex-shrink-0" />
                      <span
                        style={{ fontSize: "0.9rem" }}
                        className="text-gray-600"
                      >
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Screenshot placeholder */}
                <div className="mt-5 border-2 border-dashed border-pink-200 rounded-xl p-4 bg-pink-50/30 text-center">
                  <span
                    style={{ fontSize: "0.8rem", fontWeight: 500 }}
                    className="text-pink-400"
                  >
                    {product.screenshotHint}
                  </span>
                </div>

                {product.cta && (
                  <button
                    className="mt-5 w-full py-3 rounded-full bg-pink-50 text-pink-600 hover:bg-pink-100 transition-colors flex items-center justify-center gap-2"
                    style={{ fontSize: "0.9rem", fontWeight: 600 }}
                  >
                    <BellRing className="w-4 h-4" />
                    Nhận thông báo khi app ra mắt
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
