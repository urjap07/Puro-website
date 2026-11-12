import type { Metadata } from "next";
import { getActiveProducts } from "@/db/queries/products";
import AccountPage from "@/components/account/AccountPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your account",
  description: "Your PURO bag, wishlist, details and delivery addresses.",
  robots: { index: false, follow: false },
};

export default async function Account() {
  // Account details live on the device for now; the catalogue powers "recently viewed".
  const products = await getActiveProducts();
  return <AccountPage products={products} />;
}
