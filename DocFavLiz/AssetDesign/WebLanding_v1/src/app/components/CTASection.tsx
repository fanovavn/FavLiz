import { motion } from "motion/react";
import { ArrowRight, Chrome, Heart } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          {/* Glow */}
          <div className="absolute -inset-4 bg-gradient-to-r from-pink-500/20 via-rose-500/20 to-pink-500/20 rounded-[2rem] blur-2xl" />

          <div className="relative bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 rounded-3xl p-10 md:p-16 text-center text-white overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <Heart className="w-10 h-10 mx-auto mb-6 text-white/80" />

              <h2
                style={{
                  fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                  fontWeight: 800,
                  lineHeight: 1.2,
                }}
                className="mb-4"
              >
                Đừng để những thứ bạn yêu thích
                <br />
                biến mất.
              </h2>

              <p
                style={{ fontSize: "1.15rem", lineHeight: 1.7 }}
                className="text-white/80 max-w-lg mx-auto mb-10"
              >
                Bắt đầu xây dựng kho yêu thích của bạn ngay hôm nay. Miễn phí, nhanh chóng, dễ sử dụng.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="#"
                  className="group px-8 py-4 bg-white text-pink-600 rounded-full hover:shadow-xl transition-all flex items-center gap-2"
                  style={{ fontSize: "1.05rem", fontWeight: 700 }}
                >
                  Tạo tài khoản miễn phí
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
                <a
                  href="#"
                  className="group px-8 py-4 bg-white/15 border border-white/30 text-white rounded-full hover:bg-white/25 transition-all flex items-center gap-2"
                  style={{ fontSize: "1.05rem", fontWeight: 600 }}
                >
                  <Chrome className="w-5 h-5" />
                  Cài Chrome Extension
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
