import { motion } from "motion/react";
import { Users, Bookmark, List, Star } from "lucide-react";

const stats = [
  { icon: Users, value: "500+", label: "Người dùng", color: "text-pink-500" },
  { icon: Bookmark, value: "10K+", label: "Items đã lưu", color: "text-rose-500" },
  { icon: List, value: "2K+", label: "Lists được tạo", color: "text-pink-600" },
  { icon: Star, value: "4.9", label: "Đánh giá", color: "text-rose-600" },
];

export function StatsSection() {
  return (
    <section className="py-16 bg-white border-y border-pink-50">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <stat.icon className={`w-6 h-6 mx-auto mb-3 ${stat.color}`} />
              <div
                style={{ fontSize: "2.5rem", fontWeight: 800 }}
                className="text-gray-900"
              >
                {stat.value}
              </div>
              <div style={{ fontSize: "0.9rem" }} className="text-gray-400 mt-1">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
