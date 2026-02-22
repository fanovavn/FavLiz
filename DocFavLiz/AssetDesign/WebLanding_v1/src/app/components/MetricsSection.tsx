import { motion } from "motion/react";
import { Server, Puzzle, Layers, Zap, Code } from "lucide-react";

const metrics = [
  { icon: Server, value: "Production", label: "Web App đang chạy thực tế" },
  { icon: Puzzle, value: "Chrome", label: "Extension đang hoạt động" },
  { icon: Layers, value: "34+", label: "Platform extractors" },
  { icon: Zap, value: "< 5s", label: "Để save 1 item" },
  { icon: Code, value: "Next.js", label: "+ Supabase production ready" },
];

export function MetricsSection() {
  return (
    <section className="py-20 md:py-24 bg-gray-50/50">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span
            className="inline-block px-4 py-1.5 bg-pink-100 text-pink-600 rounded-full mb-6"
            style={{ fontSize: "0.85rem", fontWeight: 600 }}
          >
            Chỉ số thực tế
          </span>
          <h2
            style={{
              fontSize: "clamp(1.8rem, 4vw, 3rem)",
              fontWeight: 800,
              lineHeight: 1.2,
            }}
            className="text-gray-900"
          >
            Không chỉ là concept.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">
              Đây là sản phẩm thật.
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {metrics.map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-white rounded-2xl p-5 border border-pink-100/50 text-center hover:shadow-lg hover:shadow-pink-500/5 transition-all"
            >
              <metric.icon className="w-6 h-6 text-pink-500 mx-auto mb-3" />
              <div
                style={{ fontSize: "1.5rem", fontWeight: 800 }}
                className="text-gray-900 mb-1"
              >
                {metric.value}
              </div>
              <div style={{ fontSize: "0.8rem" }} className="text-gray-400">
                {metric.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
