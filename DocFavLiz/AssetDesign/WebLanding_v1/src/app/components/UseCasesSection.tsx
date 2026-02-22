import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const useCases = [
  {
    emoji: "🍳",
    title: "Người yêu nấu ăn",
    image:
      "https://images.unsplash.com/photo-1761839257845-9283b7d1b933?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb29raW5nJTIwcmVjaXBlJTIwa2l0Y2hlbiUyMGZvb2QlMjBwcmVwYXJhdGlvbnxlbnwxfHx8fDE3NzE3MjQwNzZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    items: [
      "Lưu công thức từ YouTube, blog, TikTok",
      "Tạo list theo bữa: Sáng / Trưa / Tối",
      "Gắn tag nguyên liệu chính",
      "Share list \"Món Tết 2026\" cho gia đình",
    ],
  },
  {
    emoji: "👨‍💻",
    title: "Developer / Researcher",
    image:
      "https://images.unsplash.com/photo-1607971422532-73f9d45d7a47?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXZlbG9wZXIlMjBjb2RpbmclMjBsYXB0b3AlMjBwcm9ncmFtbWluZ3xlbnwxfHx8fDE3NzE3MjQwNzZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    items: [
      "Lưu GitHub repo, StackOverflow, MDN",
      "Tạo list \"AI Tools\", \"NextJS Resources\"",
      "Gắn tag: react, prisma, postgres",
      "Chia sẻ bộ tài liệu cho team",
    ],
  },
  {
    emoji: "🛍",
    title: "Shopping & Du lịch",
    image:
      "https://images.unsplash.com/photo-1768987439370-bd60d3d0b28b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjBzaG9wcGluZyUyMGVjb21tZXJjZSUyMG1vYmlsZXxlbnwxfHx8fDE3NzE3MjQwNzd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    items: [
      "Lưu sản phẩm Shopee / Amazon",
      "Lưu địa điểm Google Maps",
      "Lưu homestay Airbnb",
      "Tạo list \"Đi Đà Lạt\", \"Wishlist 2026\"",
    ],
  },
  {
    emoji: "🎥",
    title: "Content Creator",
    image:
      "https://images.unsplash.com/photo-1639426191907-ecbec8568bcb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb250ZW50JTIwY3JlYXRvciUyMHZpZGVvJTIwZmlsbWluZ3xlbnwxfHx8fDE3NzE3MjQwNzd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    items: [
      "Lưu idea video & inspiration",
      "Lưu competitor analysis",
      "Lưu post viral trên Reddit / X",
      "Gắn tag theo format nội dung",
    ],
  },
];

export function UseCasesSection() {
  return (
    <section id="usecases" className="py-20 md:py-28 bg-gray-50/50">
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
            Use Cases
          </span>
          <h2
            style={{
              fontSize: "clamp(1.8rem, 4vw, 3rem)",
              fontWeight: 800,
              lineHeight: 1.2,
            }}
            className="text-gray-900 mb-4"
          >
            FavLiz{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">
              dành cho ai?
            </span>
          </h2>
          <p style={{ fontSize: "1.1rem" }} className="text-gray-400 max-w-xl mx-auto">
            Bất kỳ ai lưu nội dung trên internet đều cần FavLiz
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {useCases.map((useCase, i) => (
            <motion.div
              key={useCase.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-pink-200 hover:shadow-xl hover:shadow-pink-500/5 transition-all"
            >
              {/* Image */}
              <div className="h-48 overflow-hidden relative">
                <ImageWithFallback
                  src={useCase.image}
                  alt={useCase.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-4 left-5 flex items-center gap-3">
                  <span style={{ fontSize: "2rem" }}>{useCase.emoji}</span>
                  <span
                    style={{ fontSize: "1.3rem", fontWeight: 700 }}
                    className="text-white"
                  >
                    {useCase.title}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <ul className="space-y-3">
                  {useCase.items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-pink-400 mt-2 flex-shrink-0" />
                      <span
                        style={{ fontSize: "0.95rem", lineHeight: 1.6 }}
                        className="text-gray-600"
                      >
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
