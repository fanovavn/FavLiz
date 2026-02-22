import { motion } from "motion/react";
import { X, Check } from "lucide-react";

const bookmarkFeatures = [
  "Không có thumbnail preview",
  "Không có tag phân loại",
  "Không có multi-list",
  "Không share public đẹp",
  "Không đồng bộ tốt",
];

const favlizFeatures = [
  "Preview hình ảnh tự động",
  "Tag & Multi-list linh hoạt",
  "Public sharing với URL đẹp",
  "Extension lưu từ mọi website",
  "Dashboard quản lý chuyên nghiệp",
];

export function ComparisonSection() {
  return (
    <section id="comparison" className="py-20 md:py-28 bg-gray-50/50">
      <div className="max-w-5xl mx-auto px-6">
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
            So sánh
          </span>
          <h2
            style={{
              fontSize: "clamp(1.8rem, 4vw, 3rem)",
              fontWeight: 800,
              lineHeight: 1.2,
            }}
            className="text-gray-900"
          >
            Tại sao không dùng{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">
              Bookmark?
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bookmark */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl border border-gray-200 p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <X className="w-5 h-5 text-gray-400" />
              </div>
              <h3
                style={{ fontSize: "1.3rem", fontWeight: 700 }}
                className="text-gray-400"
              >
                Bookmark truyền thống
              </h3>
            </div>
            <div className="space-y-4">
              {bookmarkFeatures.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <X className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                  <span
                    style={{ fontSize: "0.95rem" }}
                    className="text-gray-400"
                  >
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* FavLiz */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl p-8 text-white"
          >
            {/* Glow */}
            <div className="absolute -inset-1 bg-gradient-to-br from-pink-500/30 to-rose-500/30 rounded-2xl blur-xl -z-10" />

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
              <h3
                style={{ fontSize: "1.3rem", fontWeight: 700 }}
                className="text-white"
              >
                FavLiz
              </h3>
            </div>
            <div className="space-y-4">
              {favlizFeatures.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span style={{ fontSize: "0.95rem" }} className="text-white/90">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
