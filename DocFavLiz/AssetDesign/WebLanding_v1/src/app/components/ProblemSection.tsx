import { motion } from "motion/react";
import { Camera, FolderSearch, MessageCircle, Link2 } from "lucide-react";

const problems = [
  {
    icon: Camera,
    text: "Thấy một công thức hay trên TikTok, screenshot lại rồi… không tìm thấy nữa.",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: FolderSearch,
    text: "Bookmark browser quá nhiều, không nhớ đã lưu ở đâu.",
    color: "from-rose-500 to-pink-600",
  },
  {
    icon: MessageCircle,
    text: "Lưu link trong Messenger/Zalo nhưng không phân loại được.",
    color: "from-pink-600 to-rose-500",
  },
  {
    icon: Link2,
    text: "Muốn share một list tài liệu cho team nhưng phải copy từng link.",
    color: "from-rose-500 to-pink-500",
  },
];

export function ProblemSection() {
  return (
    <section className="py-20 md:py-28 bg-gray-50/50">
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
            Vấn đề thực tế
          </span>
          <h2
            style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 800, lineHeight: 1.2 }}
            className="text-gray-900"
          >
            Bạn đã từng gặp
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">
              những tình huống này?
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {problems.map((problem, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-pink-200 hover:shadow-lg hover:shadow-pink-500/5 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${problem.color} flex items-center justify-center flex-shrink-0`}>
                  <problem.icon className="w-6 h-6 text-white" />
                </div>
                <p
                  style={{ fontSize: "1.05rem", lineHeight: 1.6 }}
                  className="text-gray-600"
                >
                  {problem.text}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <div className="inline-block bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-[1px]">
            <div className="bg-white rounded-2xl px-8 py-5">
              <p style={{ fontSize: "1.15rem", fontWeight: 600 }} className="text-gray-800">
                FavLiz được xây dựng để giải quyết{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">
                  chính xác những vấn đề đó.
                </span>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
