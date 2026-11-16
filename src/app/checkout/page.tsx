import type { Metadata } from "next";
import CheckoutPage from "@/components/checkout/CheckoutPage";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Confirm your contact details, delivery address and delivery for your PURO order.",
  robots: { index: false, follow: false },
};

export default function Checkout() {
  return <CheckoutPage />;
}
