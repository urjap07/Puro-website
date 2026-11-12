import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import CartDrawer from "@/components/cart/CartDrawer";
import AddedToast from "@/components/cart/AddedToast";
import FlightLayer from "@/components/cart/FlightLayer";
import QuickLook from "@/components/commerce/QuickLook";
import SmoothScroll from "@/components/layout/SmoothScroll";
import LiquidBackdrop from "@/components/layout/LiquidBackdrop";
import CursorLabel from "@/components/motion/CursorLabel";
import ScrollProgress from "@/components/motion/ScrollProgress";
import { getConcerns, type Concern } from "@/db/queries/products";
import "./globals.css";

/** Editorial display serif for headlines, italics and product names (PRD §7.3). */
const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

/** Readable sans for product information, navigation and labels. */
const sans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PURO Body & Soul — The Art of Conscious Skin",
    template: "%s | Puro Body & Soul",
  },
  description:
    "Thoughtfully formulated face, body and hair care from PURO Body & Soul — botanical ingredients, honest formulation and a ritual for every day. Cruelty-free and dermatologically tested.",
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${display.variable} ${sans.variable}`}>
        <LiquidBackdrop />
        <SmoothScroll />
        <SiteHeader concerns={concerns} />
        <main>{children}</main>
        <SiteFooter />
        <CartDrawer />
        <AddedToast />
        <QuickLook />
        <FlightLayer />
        <CursorLabel />
        <ScrollProgress />
      </body>
    </html>
  );
}
