import type { Product } from "@/db/queries/products";
import type { GridPromo } from "@/components/shop/ShopGrid";

export const GIFT_PROMO: GridPromo = {
  eyebrow: "The Gift Edit",
  title: "Give the gift of a ritual",
  text: "Keepsake boxes inspired by palace gardens, ready for weddings, festivals and the people who matter most.",
  href: "/collections/gifting",
  cta: "Explore gift sets",
  image: "/media/products/radiant-glow-luxurious-kit/02.jpg",
};

export const SANISA_PROMO: GridPromo = {
  eyebrow: "The heart of Puro",
  title: "Every purchase empowers a woman",
  text: "Puro is a division of Shramik Naari Sangh. Every product you buy helps a rural woman live a life of dignity.",
  href: "/#story",
  cta: "Our story",
  image: "/media/products/good-cleanse-face-wash/04.jpg",
};

/** Featured products first, so headers showcase the signatures of a range. */
export function featuredFirst(products: Product[]) {
  return [...products].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
}
