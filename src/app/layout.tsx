import type { Metadata } from "next";
import { Instrument_Serif, Manrope } from "next/font/google";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import CartDrawer from "@/components/cart/CartDrawer";
import AddedToast from "@/components/cart/AddedToast";
import FlightLayer from "@/components/cart/FlightLayer";
import IntroCurtain from "@/components/layout/IntroCurtain";
import SmoothScroll from "@/components/layout/SmoothScroll";
import CursorLabel from "@/components/motion/CursorLabel";
import ScrollProgress from "@/components/motion/ScrollProgress";
import { INTRO_BOOT_SCRIPT } from "@/lib/intro";
import { getConcerns, type Concern } from "@/db/queries/products";
import "./globals.css";

/** Editorial display serif for headlines and product names. */
const display = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const sans = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "Puro Body & Soul — Botanical rituals for skin, body & soul",
    template: "%s | Puro Body & Soul",
  },
  description:
    "Botanical skin, body and hair care crafted with turmeric, saffron, aloe and age-old wisdom. Cruelty-free and dermatologically tested.",
};

async function loadConcerns(): Promise<Concern[]> {
  try {
    return await getConcerns();
  } catch (error) {
    console.error("Unable to load concerns for navigation:", error);
    return [];
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const concerns = await loadConcerns();

  return (
    // The boot script sets data-intro on <html> before hydration.
    <html lang="en" suppressHydrationWarning>
      <body className={`${display.variable} ${sans.variable}`}>
        <script dangerouslySetInnerHTML={{ __html: INTRO_BOOT_SCRIPT }} />
        <SmoothScroll />
        <IntroCurtain />
        <SiteHeader concerns={concerns} />
        <main>{children}</main>
        <SiteFooter />
        <CartDrawer />
        <AddedToast />
        <FlightLayer />
        <CursorLabel />
        <ScrollProgress />
      </body>
    </html>
  );
}
