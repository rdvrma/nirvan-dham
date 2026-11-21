import type { Metadata } from "next";
import "@/components/magazine/magazine.css";
import "@/components/magazine/editorial-scenes.css";
import "@/components/magazine/issue-motion.css";
import "@/components/magazine/listening.css";

export const metadata: Metadata = {
  title: "निर्वाण सूत्र पत्रिका — अंक ०१",
  description: "निर्वाण सूत्र पत्रिका: ज्ञान, गीत, हँसी, कथा और मौन की एक संवादात्मक पठन यात्रा।",
  alternates: { canonical: '/patrika' },
};

export default function PatrikaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Fonts loaded via global <link> in layout.tsx – no next/font/google here */}
      <div className="ns-root">{children}</div>
    </>
  );
}
