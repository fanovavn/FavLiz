import { useState } from "react";
import { Heart, Menu, X } from "lucide-react";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: "Tính năng", href: "#features" },
    { label: "Use Cases", href: "#usecases" },
    { label: "Sản phẩm", href: "#products" },
    { label: "So sánh", href: "#comparison" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-pink-100/50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          <span style={{ fontSize: "1.25rem", fontWeight: 700 }} className="text-gray-900">
            Fav<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">Liz</span>
          </span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-gray-600 hover:text-pink-600 transition-colors"
              style={{ fontSize: "0.9rem", fontWeight: 500 }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="#"
            className="px-4 py-2 text-gray-700 hover:text-pink-600 transition-colors"
            style={{ fontSize: "0.9rem", fontWeight: 500 }}
          >
            Đăng nhập
          </a>
          <a
            href="#"
            className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full hover:shadow-lg hover:shadow-pink-500/25 transition-all"
            style={{ fontSize: "0.9rem", fontWeight: 600 }}
          >
            Bắt đầu miễn phí
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-gray-700"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-pink-100 px-6 py-4 space-y-3">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block py-2 text-gray-600 hover:text-pink-600"
              style={{ fontSize: "0.95rem", fontWeight: 500 }}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 border-t border-gray-100 space-y-2">
            <a href="#" className="block py-2 text-gray-600" style={{ fontWeight: 500 }}>
              Đăng nhập
            </a>
            <a
              href="#"
              className="block text-center py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full"
              style={{ fontWeight: 600 }}
            >
              Bắt đầu miễn phí
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
