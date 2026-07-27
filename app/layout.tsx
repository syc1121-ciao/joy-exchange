import "./globals.css";

import { Inter, Cormorant_Garamond } from "next/font/google";

import FlightProvider from "@/components/flights/FlightProvider";
import AuthSessionProvider from "@/components/AuthSessionProvider";
import type { Metadata } from "next";
import type { ReactNode } from "react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Joy's Exchange Adventure",
  description: "My exchange student journal in Europe",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cormorant.variable}`}
    >
      <body>
        <AuthSessionProvider>
          <FlightProvider>
            {children}
          </FlightProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}