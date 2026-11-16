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
import { getActiveProducts, getConcerns, type Concern } from "@/db/queries/products";
import { productsInEdit } from "@/lib/edits";
import { SITE } from "@/lib/site";
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

/** Who PURO is, for search engines (shown sitewide). */
const ORGANIZATION_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "PURO Body & Soul",
  url: SITE.url,
  parentOrganization: { "@type": "Organization", name: SITE.organisation },
  email: SITE.email,
  telephone: SITE.phone,
  sameAs: [SITE.social.instagram, SITE.social.facebook],
  address: {
    "@type": "PostalAddress",
    streetAddress: "99/2 Jambhulpada, Sudhagad Taluka",
    addressRegion: "Maharashtra",
    postalCode: "410205",
    addressCountry: "IN",
  },
}).replace(/</g, "\\u003c");

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "PURO Body & Soul — The Art of Conscious Skin",
    template: "%s | Puro Body & Soul",
  },
  description:
    "Thoughtfully formulated face, body and hair care from PURO Body & Soul — botanical ingredients, honest formulation and a ritual for every day. Cruelty-free and dermatologically tested.",
};

async function loadNavigation(): Promise<{ concerns: Concern[]; hasNewArrivals: boolean }> {
  try {
    const [concerns, products] = await Promise.all([getConcerns(), getActiveProducts()]);
    return { concerns, hasNewArrivals: productsInEdit(products, "new-arrivals").length > 0 };
  } catch (error) {
    console.error("Unable to load navigation:", error);
    return { concerns: [], hasNewArrivals: false };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { concerns, hasNewArrivals } = await loadNavigation();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${display.variable} ${sans.variable}`}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ORGANIZATION_LD }} />
        <LiquidBackdrop />
        <SmoothScroll />
        <SiteHeader concerns={concerns} hasNewArrivals={hasNewArrivals} />
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
