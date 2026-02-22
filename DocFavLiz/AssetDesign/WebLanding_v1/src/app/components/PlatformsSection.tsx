import { motion } from "motion/react";

const platforms = [
  "YouTube", "TikTok", "Reddit", "Facebook", "Instagram",
  "GitHub", "Shopee", "Amazon", "Google Maps", "Medium",
  "LinkedIn", "Twitter / X", "Airbnb", "StackOverflow",
  "Pinterest", "Spotify", "DevDocs", "MDN", "Netflix",
  "Apple Music", "Notion", "Figma", "Dribbble", "Behance",
  "Product Hunt", "Hacker News", "Substack", "Wikipedia",
  "Lazada", "Tiki", "Grab Food", "ShopeeFood", "Foody",
  "Google Docs",
];

export function PlatformsSection() {
  return (
    <section className="py-16 bg-white border-y border-pink-50">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <p style={{ fontSize: "0.9rem", fontWeight: 500 }} className="text-gray-400">
            Hỗ trợ <span style={{ fontWeight: 700 }} className="text-pink-500">34+</span> nền tảng và không ngừng mở rộng
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2.5"
        >
          {platforms.map((platform, i) => (
            <motion.span
              key={platform}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.02 }}
              className="px-4 py-2 bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100 rounded-full text-gray-600 hover:border-pink-300 hover:text-pink-600 hover:shadow-sm transition-all cursor-default"
              style={{ fontSize: "0.8rem", fontWeight: 500 }}
            >
              {platform}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
