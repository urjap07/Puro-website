import type { Metadata } from "next";
import { getActiveProducts } from "@/db/queries/products";
import CartPage from "@/components/cart/CartPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your bag",
  description: "Review the rituals in your bag, the ones you saved for later, and delivery to your pincode.",
};

export default async function BagPage() {
  // The bag itself lives in the browser; the catalogue gives stock and suggestions.
  const products = await getActiveProducts();
  return <CartPage products={products} />;
}
