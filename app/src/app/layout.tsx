import type { Metadata } from "next";
import { Suspense } from "react";
import { Plus_Jakarta_Sans, Be_Vietnam_Pro } from "next/font/google";
import { NavigationProgress } from "@/components/navigation-progress";
import { FirebaseAnalytics } from "@/components/firebase-analytics";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const beVietnam = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "vietnamese"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "FavLiz – Save Your Favorites",
  description:
    "FavLiz giúp bạn lưu trữ và quản lý danh sách các items yêu thích một cách gọn gàng và đẹp mắt.",
  keywords: ["favorites", "bookmarks", "lists", "organizer", "favliz"],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: "/icon-192.png",
  },
  openGraph: {
    title: "FavLiz – Save Your Favorites",
    description:
      "Lưu trữ và quản lý danh sách yêu thích của bạn.",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${jakarta.variable} ${beVietnam.variable} antialiased`}>
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        {children}
        <FirebaseAnalytics />
      </body>
    </html>
  );
}
