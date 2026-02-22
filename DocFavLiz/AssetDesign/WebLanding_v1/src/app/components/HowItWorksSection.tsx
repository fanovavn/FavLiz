import { motion } from "motion/react";
import { MousePointerClick, Tags, Share2 } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: MousePointerClick,
    title: "Lưu trực tiếp từ mọi website",
    description:
      "Click nút FavLiz hoặc mở popup extension. FavLiz tự động lấy title, thumbnail, description, tags và link gốc.",
    features: [
      "Hỗ trợ 34+ nền tảng",
      "YouTube, TikTok, GitHub, Shopee...",
      "Extract metadata tự động",
      "Lưu nhanh < 5 giây",
    ],
    screenshotHint: "📸 Screenshot: FAB button trên YouTube + Save Modal extract tự động",
  },
  {
    number: "02",
    icon: Tags,
    title: "Tổ chức bằng Lists & Tags",
    description:
      "Một item có thể thuộc nhiều lists và nhiều tags. Search, filter, sort linh hoạt theo mọi tiêu chí.",
    features: [
      "Multi-list: \"Món Việt\", \"Meal Prep\"",
      "Multi-tag: \"chicken\", \"30 phút\"",
      "Tìm kiếm theo title",
      "Sort theo thời gian / A-Z",
    ],
    screenshotHint: "📸 Screenshot: Trang Items với filter + Tags cloud",
  },
  {
    number: "03",
    icon: Share2,
    title: "Chia sẻ chỉ với một link",
    description:
      "Chuyển item hoặc list sang Public và share qua URL đẹp. Không cần người xem đăng nhập.",
    features: [
      "URL: favliz.com/lisa/mon-viet",
      "Public profile đẹp mắt",
      "Không cần đăng nhập để xem",
      "Chia sẻ qua mọi nền tảng",
    ],
    screenshotHint: "📸 Screenshot: Trang share public list + Public profile",
  },
];

export function HowItWorksSection() {
  return (
    <section id="features" className="py-20 md:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span
            className="inline-block px-4 py-1.5 bg-pink-100 text-pink-600 rounded-full mb-6"
            style={{ fontSize: "0.85rem", fontWeight: 600 }}
          >
            Đơn giản & Nhanh chóng
          </span>
          <h2
            style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 800, lineHeight: 1.2 }}
            className="text-gray-900"
          >
            Lưu trong{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">
              3 giây.
            </span>{" "}
            Quản lý{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-600">
              trọn đời.
            </span>
          </h2>
        </motion.div>

        <div className="space-y-20 md:space-y-32">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center ${i % 2 === 1 ? "lg:direction-rtl" : ""}`}
            >
              {/* Content */}
              <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400"
                    style={{ fontSize: "3.5rem", fontWeight: 900 }}
                  >
                    {step.number}
                  </span>
                </div>

                <h3
                  style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 700, lineHeight: 1.3 }}
                  className="text-gray-900 mb-4"
                >
                  {step.title}
                </h3>

                <p
                  style={{ fontSize: "1.05rem", lineHeight: 1.7 }}
                  className="text-gray-500 mb-6"
                >
                  {step.description}
                </p>

                <div className="space-y-3">
                  {step.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span style={{ fontSize: "0.95rem" }} className="text-gray-600">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Screenshot placeholder */}
              <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                <div className="relative">
                  <div className="absolute -inset-3 bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-3xl blur-xl" />
                  <div className="relative bg-white rounded-2xl border border-pink-100 shadow-xl overflow-hidden">
                    {/* Mini browser bar */}
                    <div className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-300" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-300" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-300" />
                    </div>

                    <div className="p-6 bg-gradient-to-b from-white to-pink-50/20 min-h-[280px] md:min-h-[340px] flex items-center justify-center">
                      <div className="text-center border-2 border-dashed border-pink-200 rounded-xl p-8 bg-pink-50/30 w-full">
                        <div style={{ fontSize: "2rem" }} className="mb-3">📸</div>
                        <p style={{ fontSize: "0.9rem", fontWeight: 500 }} className="text-pink-400">
                          {step.screenshotHint}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
