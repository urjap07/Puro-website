
import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.purobodysoul.com"),
  title: {
    default: "Puro Body Soul | Conscious Beauty & Wellness",
    template: "%s | Puro Body Soul",
  },
  description:
    "Discover conscious beauty, skincare and wellness with Puro Body Soul. Thoughtfully curated products for your body, mind and soul.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${cormorant.variable} ${dmSans.variable} min-h-screen flex flex-col`}
      >
        {children}
      </body>
    </html>
  );
}
