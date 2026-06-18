import type { Metadata } from "next";
import { Cormorant_Garamond, Hind, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ScrollReset from "@/components/ScrollReset";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const hind = Hind({
  subsets: ["latin", "devanagari"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-hind",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nirvandham.in"),
  title: "निर्वाण धाम | Nirvan Dham - Who are you?",
  description:
    "Nirvan Sutra guides seekers into awareness, self-inquiry, non-duality, and the direct seeing of truth. A premium Digital Ashram by Aadisatv.",
  keywords: [
    "Nirvan Dham",
    "Nirvan Sutra",
    "Aadisatv",
    "Advaita Vedanta",
    "self-inquiry",
    "meditation",
    "nirvana",
    "non-duality",
    "awareness",
    "enlightenment",
    "निर्वाण",
    "अद्वैत",
  ],
  openGraph: {
    title: "निर्वाण धाम | Nirvan Dham",
    description:
      "A premium digital ashram for seekers of truth. Guided by Aadisatv.",
    url: "https://nirvandham.in",
    siteName: "Nirvan Dham",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/brand/nirvan-dham-logo.png",
        width: 1254,
        height: 1254,
        alt: "Nirvan Dham",
      },
    ],
  },
  icons: {
    icon: [
      { url: "/favicon.svg?v=2", type: "image/svg+xml" },
      { url: "/favicon.ico?v=2", sizes: "any" },
      { url: "/favicon-32x32.png?v=2", sizes: "32x32", type: "image/png" },
      { url: "/favicon-192x192.png?v=2", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/favicon.ico?v=2",
    apple: "/apple-touch-icon.png?v=2",
  },
  manifest: "/site.webmanifest",
};

import StyledJsxRegistry from "./registry";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="hi"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${cormorant.variable} ${hind.variable}`}
    >
      <head>
        <link rel="icon" href="/favicon.svg?v=2" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico?v=2" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2" />
      </head>
      <body>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-JYM8LF1BPN"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-JYM8LF1BPN');
          `}
        </Script>
        <StyledJsxRegistry>
          <ScrollReset />
          {children}
        </StyledJsxRegistry>
      </body>
    </html>
  );
}
