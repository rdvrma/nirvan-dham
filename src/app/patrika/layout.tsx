import type { Metadata } from "next";
import { Cormorant_Garamond, Noto_Sans_Devanagari, Noto_Serif_Devanagari } from "next/font/google";
import "@/components/magazine/magazine.css";
import "@/components/magazine/editorial-scenes.css";
import "@/components/magazine/issue-motion.css";
import "@/components/magazine/listening.css";

// Self-hosted by next/font at build time (no runtime requests to Google).
const serifDeva = Noto_Serif_Devanagari({
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-ns-serif",
});

const sansDeva = Noto_Sans_Devanagari({
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-ns-sans",
});

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-ns-display",
});

export const metadata: Metadata = {
  title: "निर्वाण सूत्र पत्रिका — अंक ०१",
  description: "निर्वाण सूत्र पत्रिका: ज्ञान, गीत, हँसी, कथा और मौन की एक संवादात्मक पठन यात्रा।",
  alternates: { canonical: '/patrika' },
};

export default function PatrikaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`ns-root ${serifDeva.variable} ${sansDeva.variable} ${display.variable}`}>{children}</div>
  );
}
