import { motion } from "motion/react";
import { Shield, Lock, UserCheck, Eye } from "lucide-react";

const privacyFeatures = [
  {
    icon: Lock,
    title: "Private by Default",
    desc: "Mọi item và list đều PRIVATE mặc định.",
  },
  {
    icon: Eye,
    title: "Bạn kiểm soát",
    desc: "Chỉ khi bạn bật PUBLIC thì người khác mới xem được.",
  },
  {
    icon: UserCheck,
    title: "Dữ liệu tách biệt",
    desc: "Dữ liệu tách biệt theo từng user.",
  },
  {
    icon: Shield,
    title: "An toàn tuyệt đối",
    desc: "Không ai xem được nội dung nếu bạn không cho phép.",
  },
];

export function PrivacySection() {
  return (
    <section className="py-20 md:py-28 bg-white">
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
            Quyền riêng tư
          </span>
          <h2
            style={{
              fontSize: "clamp(1.8rem, 4vw, 3rem)",
              fontWeight: 800,
              lineHeight: 1.2,
            }}
            className="text-gray-900 mb-4"
          >
            Private{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">
              by Default
            </span>
          </h2>
          <p style={{ fontSize: "1.1rem" }} className="text-gray-400 max-w-xl mx-auto">
            Bạn hoàn toàn kiểm soát ai được xem nội dung của mình
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {privacyFeatures.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-gradient-to-br from-gray-50 to-pink-50/30 rounded-2xl p-6 border border-pink-100/50"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3
                style={{ fontSize: "1.15rem", fontWeight: 700 }}
                className="text-gray-900 mb-2"
              >
                {feature.title}
              </h3>
              <p style={{ fontSize: "0.95rem", lineHeight: 1.6 }} className="text-gray-500">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
