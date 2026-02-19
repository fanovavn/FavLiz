import type { Metadata } from "next";
import { Suspense } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import { NavigationProgress } from "@/components/navigation-progress";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "FavLiz – Save Your Favorites",
  description:
    "FavLiz giúp bạn lưu trữ và quản lý danh sách các items yêu thích một cách gọn gàng và đẹp mắt.",
  keywords: ["favorites", "bookmarks", "lists", "organizer", "favliz"],
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
      <body className={`${jakarta.variable} antialiased`}>
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
