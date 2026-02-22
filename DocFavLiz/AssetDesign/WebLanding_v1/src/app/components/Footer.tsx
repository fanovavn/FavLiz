import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <a href="#" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
                <Heart className="w-4 h-4 text-white fill-white" />
              </div>
              <span style={{ fontSize: "1.2rem", fontWeight: 700 }} className="text-gray-900">
                Fav<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">Liz</span>
              </span>
            </a>
            <p style={{ fontSize: "0.9rem", lineHeight: 1.6 }} className="text-gray-400">
              Lưu, tổ chức và chia sẻ mọi thứ bạn yêu thích trên internet.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4
              style={{ fontSize: "0.9rem", fontWeight: 600 }}
              className="text-gray-900 mb-4"
            >
              Sản phẩm
            </h4>
            <ul className="space-y-3">
              {["Web App", "Chrome Extension", "Mobile App (Soon)"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    style={{ fontSize: "0.9rem" }}
                    className="text-gray-400 hover:text-pink-500 transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4
              style={{ fontSize: "0.9rem", fontWeight: 600 }}
              className="text-gray-900 mb-4"
            >
              Tài nguyên
            </h4>
            <ul className="space-y-3">
              {["Blog", "Hướng dẫn", "Changelog", "API Docs"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    style={{ fontSize: "0.9rem" }}
                    className="text-gray-400 hover:text-pink-500 transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4
              style={{ fontSize: "0.9rem", fontWeight: 600 }}
              className="text-gray-900 mb-4"
            >
              Liên hệ
            </h4>
            <ul className="space-y-3">
              {["Twitter / X", "GitHub", "Email", "Discord"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    style={{ fontSize: "0.9rem" }}
                    className="text-gray-400 hover:text-pink-500 transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <p style={{ fontSize: "0.85rem" }} className="text-gray-400">
            &copy; 2026 FavLiz &middot; From{" "}
            <span style={{ fontWeight: 600 }} className="text-pink-500">
              Favosa
            </span>{" "}
            Team with{" "}
            <Heart className="w-3 h-3 inline text-pink-500 fill-pink-500" />
          </p>
          <div className="flex items-center gap-6">
            <a
              href="#"
              style={{ fontSize: "0.85rem" }}
              className="text-gray-400 hover:text-pink-500 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              style={{ fontSize: "0.85rem" }}
              className="text-gray-400 hover:text-pink-500 transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
