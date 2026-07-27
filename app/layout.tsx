import type { Metadata } from "next";

import Navbar from "@/components/Navbar";
import Providers from "@/app/providers";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Joy's Exchange Adventure",
    template: "%s | Joy's Exchange Adventure",
  },
  description:
    "A personal exchange journal collecting cities, photos and memories.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body className="min-h-screen bg-[#faf8f5] text-neutral-950 antialiased">
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}