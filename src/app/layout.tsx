import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import CartDrawer from "@/components/cart/CartDrawer";
import AddedToast from "@/components/cart/AddedToast";
import { getConcerns, type Concern } from "@/db/queries/products";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

const sans = Jost({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
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
    <html lang="en">
      <body className={`${display.variable} ${sans.variable}`}>
        <SiteHeader concerns={concerns} />
        <main>{children}</main>
        <SiteFooter />
        <CartDrawer />
        <AddedToast />
      </body>
    </html>
  );
}
