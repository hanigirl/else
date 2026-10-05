import type { Metadata } from "next";
import { Noto_Sans_Hebrew } from "next/font/google";
import "./globals.css";

const notoHebrew = Noto_Sans_Hebrew({
  subsets: ["hebrew", "latin"],
  weight: "variable",
  axes: ["wdth"],
  variable: "--font-noto-hebrew",
  display: "swap",
});

export const metadata: Metadata = {
  title: "else — ללמוד UI/UX בדרך חדשה",
  description: "AI can make anything. We make something else.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={notoHebrew.variable}>
      <body>{children}</body>
    </html>
  );
}
