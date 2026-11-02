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

const BASE_PATH = "/learnuiux";

export const metadata: Metadata = {
  title: "else — ללמוד UI/UX בדרך חדשה",
  description: "AI can make anything. We make something else.",
  icons: {
    icon: [
      {
        url: `${BASE_PATH}/icons/icon-light.svg`,
        type: "image/svg+xml",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: `${BASE_PATH}/icons/icon-dark.svg`,
        type: "image/svg+xml",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: `${BASE_PATH}/icons/icon.svg`,
        type: "image/svg+xml",
      },
      {
        url: `${BASE_PATH}/icons/favicon.ico`,
        sizes: "32x32",
      },
    ],
    apple: {
      url: `${BASE_PATH}/icons/apple-touch-icon.png`,
      sizes: "180x180",
      type: "image/png",
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={notoHebrew.variable}>
      <body>{children}</body>
    </html>
  );
}
