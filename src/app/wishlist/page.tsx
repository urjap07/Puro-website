import { Suspense } from "react";
import type { Metadata } from "next";
import { getActiveProducts } from "@/db/queries/products";
import WishlistPage from "@/components/wishlist/WishlistPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your wishlist",
  description: "The PURO rituals you've saved — move them to your bag or share the list.",
  robots: { index: false, follow: true },
};

export default async function Wishlist() {
  // The list itself lives in the browser; the catalogue gives today's prices and stock.
  const products = await getActiveProducts();
  return (
    <Suspense>
      <WishlistPage products={products} />
    </Suspense>
  );
}
