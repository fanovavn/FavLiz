import { ArrowRight, Chrome, Sparkles } from "lucide-react";
import { motion } from "motion/react";

export function HeroSection() {
  return (
    <section className="relative pt-28 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-pink-200/40 rounded-full blur-[120px]" />
        <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-rose-200/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-pink-100/40 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-pink-50 border border-pink-200 rounded-full mb-8"
          >
            <Sparkles className="w-4 h-4 text-pink-500" />
            <span style={{ fontSize: "0.85rem", fontWeight: 500 }} className="text-pink-700">
              Công cụ quản lý yêu thích #1 Việt Nam
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", fontWeight: 800, lineHeight: 1.1 }}
            className="text-gray-900 mb-6"
          >
            Lưu mọi thứ bạn yêu thích.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600">
              Ở một nơi duy nhất.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ fontSize: "1.2rem", lineHeight: 1.7 }}
            className="text-gray-500 max-w-2xl mx-auto mb-10"
          >
            FavLiz giúp bạn lưu, tổ chức và chia sẻ bất kỳ nội dung nào trên internet — từ công thức nấu ăn, video YouTube, sản phẩm Shopee đến repo GitHub.
          </motion.p>

          {/* Secondary text */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{ fontSize: "1rem", fontWeight: 500 }}
            className="text-gray-400 mb-10"
          >
            Không còn bookmark lộn xộn. Không còn screenshot rồi quên.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href="#"
              className="group px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full hover:shadow-xl hover:shadow-pink-500/30 transition-all flex items-center gap-2"
              style={{ fontSize: "1.05rem", fontWeight: 600 }}
            >
              Bắt đầu miễn phí
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#"
              className="group px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-full hover:border-pink-300 hover:text-pink-600 transition-all flex items-center gap-2"
              style={{ fontSize: "1.05rem", fontWeight: 600 }}
            >
              <Chrome className="w-5 h-5" />
              Cài Chrome Extension
            </a>
          </motion.div>
        </div>

        {/* Hero Screenshot Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 md:mt-24 max-w-5xl mx-auto"
        >
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-pink-500/20 via-rose-500/20 to-pink-500/20 rounded-3xl blur-2xl" />

            {/* Main screenshot container */}
            <div className="relative bg-white rounded-2xl border border-pink-100 shadow-2xl shadow-pink-500/10 overflow-hidden">
              {/* Browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-white rounded-md px-3 py-1.5 text-gray-400 border border-gray-200" style={{ fontSize: "0.8rem" }}>
                    app.favliz.com/dashboard
                  </div>
                </div>
              </div>

              {/* Dashboard mockup */}
              <div className="p-6 md:p-8 bg-gradient-to-b from-white to-pink-50/30 min-h-[300px] md:min-h-[420px]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Stats cards */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-pink-50">
                    <div style={{ fontSize: "0.8rem", fontWeight: 500 }} className="text-gray-400 mb-1">Total Items</div>
                    <div style={{ fontSize: "2rem", fontWeight: 700 }} className="text-gray-900">247</div>
                    <div style={{ fontSize: "0.75rem" }} className="text-green-500 mt-1">+12 tuần này</div>
                  </div>
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-pink-50">
                    <div style={{ fontSize: "0.8rem", fontWeight: 500 }} className="text-gray-400 mb-1">Lists</div>
                    <div style={{ fontSize: "2rem", fontWeight: 700 }} className="text-gray-900">18</div>
                    <div style={{ fontSize: "0.75rem" }} className="text-green-500 mt-1">+3 tuần này</div>
                  </div>
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-pink-50">
                    <div style={{ fontSize: "0.8rem", fontWeight: 500 }} className="text-gray-400 mb-1">Tags</div>
                    <div style={{ fontSize: "2rem", fontWeight: 700 }} className="text-gray-900">42</div>
                    <div style={{ fontSize: "0.75rem" }} className="text-pink-500 mt-1">5 được dùng nhiều nhất</div>
                  </div>
                </div>

                {/* Recent items */}
                <div className="mt-6">
                  <div style={{ fontSize: "0.9rem", fontWeight: 600 }} className="text-gray-900 mb-4">Recent Items</div>
                  <div className="space-y-3">
                    {[
                      { title: "Cách làm Phở Bò tại nhà chuẩn vị", platform: "YouTube", color: "bg-red-100 text-red-600" },
                      { title: "NextJS 15 App Router Best Practices", platform: "GitHub", color: "bg-gray-100 text-gray-700" },
                      { title: "Áo khoác mùa đông giảm 50%", platform: "Shopee", color: "bg-orange-100 text-orange-600" },
                    ].map((item) => (
                      <div key={item.title} className="flex items-center gap-4 bg-white rounded-lg p-3 border border-gray-100">
                        <div className="w-12 h-12 bg-pink-50 rounded-lg flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div style={{ fontSize: "0.85rem", fontWeight: 500 }} className="text-gray-900 truncate">
                            {item.title}
                          </div>
                          <span
                            className={`inline-block mt-1 px-2 py-0.5 rounded-full ${item.color}`}
                            style={{ fontSize: "0.7rem", fontWeight: 500 }}
                          >
                            {item.platform}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Placeholder notice */}
                <div className="mt-6 text-center py-4 border-2 border-dashed border-pink-200 rounded-xl bg-pink-50/50">
                  <span style={{ fontSize: "0.85rem" }} className="text-pink-400">
                    📸 Chụp screenshot Dashboard thật để thay thế
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
