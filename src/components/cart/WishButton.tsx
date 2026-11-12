"use client";

import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { Heart } from "lucide-react";
import type { Product } from "@/db/queries/products";
import { useWishlist } from "@/lib/wishlist-store";

type WishProduct = Pick<Product, "id" | "slug" | "name" | "images" | "variants">;

/** Heart toggle that saves a product to this browser's wishlist. */
export default function WishButton({ product, className }: { product: WishProduct; className?: string }) {
  const saved = useWishlist((state) => state.items.some((item) => item.productId === product.id));
  const toggle = useWishlist((state) => state.toggle);
  const variant = product.variants[0];
  if (!variant) return null;

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${product.name} from saved` : `Save ${product.name}`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggle({
          productId: product.id,
          variantId: variant.id,
          slug: product.slug,
          name: product.name,
          variantName: variant.name,
          price: variant.price,
          image: product.images[0]?.imageUrl ?? null,
        });
      }}
      className={twMerge(clsx(
        "relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-white/80 to-white/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),inset_0_0_0_1px_rgba(255,255,255,0.6),0_8px_18px_-10px_rgba(14,39,42,0.5)] backdrop-blur-xl backdrop-saturate-[1.8] transition duration-300 hover:scale-110",
        saved ? "text-rose-600" : "text-graphite/75 hover:text-rose-600",
        className,
      ))}
    >
      <motion.span key={String(saved)} initial={{ scale: saved ? 0.4 : 1 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 14 }}>
        <Heart size={16} strokeWidth={1.5} className={saved ? "fill-current" : ""} />
      </motion.span>
      <AnimatePresence>
        {saved && (
          <motion.span
            key="burst"
            className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-rose-400"
            initial={{ scale: 0.6, opacity: 0.9 }}
            animate={{ scale: 1.8, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        )}
      </AnimatePresence>
    </button>
  );
}
