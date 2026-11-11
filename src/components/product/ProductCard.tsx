import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { Star } from "lucide-react";
import type { Product } from "@/db/queries/products";
import { formatPrice } from "@/lib/format";
import { QuickAdd } from "@/components/cart/AddToBag";
import ImagePlaceholder from "./ImagePlaceholder";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  /** Position in a curated list, shown as "No. 01". */
  index?: number;
  /** "dark" when the card sits on a forest-green section. */
  tone?: "light" | "dark";
}

const SIZES = "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw";

/**
 * The packshot stands on a softly lit plinth. On hover a lifestyle photograph
 * wipes up from below and the add-to-bag button rises.
 */
export default function ProductCard({ product, priority = false, index, tone = "light" }: ProductCardProps) {
  const [primary, secondary] = product.images;
  const variant = product.variants[0];
  const href = `/products/${product.slug}`;
  const soldOut = variant ? variant.stockQuantity <= 0 : false;
  const badge = soldOut ? "Sold out" : product.isFeatured ? "Bestseller" : product.isClassic ? "Puro Classic" : null;
  const dark = tone === "dark";

  return (
    <article className="group relative flex h-full flex-col">
      <div data-fly-source className="relative aspect-[4/5] overflow-hidden rounded-[22px] bg-[radial-gradient(ellipse_75%_60%_at_50%_42%,#ffffff_0%,#f6f1e8_55%,#e9e0d1_100%)] shadow-[0_30px_60px_-40px_rgba(6,48,58,0.55)]">
        <Link href={href} className="absolute inset-0" aria-label={product.name} data-cursor="View">
          {/* Plinth shadow */}
          <span className="absolute bottom-[9%] left-1/2 h-[7%] w-[56%] -translate-x-1/2 rounded-[50%] bg-ink/[0.12] blur-md transition duration-700 group-hover:w-[48%] group-hover:opacity-60" />
          {primary ? (
            <>
              <Image
                src={primary.imageUrl}
                alt={primary.altText ?? product.name}
                fill
                priority={priority}
                sizes={SIZES}
                className="object-contain p-[9%] mix-blend-multiply transition duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-2 group-hover:scale-[1.04]"
              />
              {secondary && (
                <span className="absolute inset-0 [clip-path:inset(100%_0_0_0)] transition-[clip-path] duration-[900ms] ease-[cubic-bezier(0.77,0,0.18,1)] group-hover:[clip-path:inset(0_0_0_0)]">
                  <Image
                    src={secondary.imageUrl}
                    alt=""
                    fill
                    sizes={SIZES}
                    className="scale-110 object-cover transition duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-100"
                  />
                </span>
              )}
            </>
          ) : (
            <ImagePlaceholder name={product.name} />
          )}
        </Link>

        <div className="pointer-events-none absolute inset-x-4 top-4 flex items-start justify-between">
          {index !== undefined ? (
            <span className="font-display text-[20px] italic leading-none text-ink/70 transition-colors duration-500 group-hover:text-ivory">
              No. {String(index + 1).padStart(2, "0")}
            </span>
          ) : (
            <span />
          )}
          {badge && (
            <span className="rounded-full bg-ivory/90 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-ink backdrop-blur">
              {badge}
            </span>
          )}
        </div>

        {variant && (
          <div className="absolute inset-x-3 bottom-3 hidden translate-y-[calc(100%+1rem)] transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-focus-within:translate-y-0 group-hover:translate-y-0 lg:block">
            <QuickAdd product={product} className="w-full" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col pt-5">
        <Link href={href} className="flex-1">
          <p className={clsx("text-[12px] font-medium uppercase tracking-[0.2em]", dark ? "text-ivory/50" : "text-stone")}>
            {product.subCategory ?? product.categories[0]?.name}
          </p>
          <div className="mt-2 flex items-start justify-between gap-4">
            <h3 className={clsx("font-display text-[25px] leading-[1.08] sm:text-[27px]", dark ? "text-ivory" : "text-ink")}>
              {product.name}
            </h3>
            {variant && (
              <span className={clsx("shrink-0 pt-1 font-display text-[22px] tabular-nums", dark ? "text-ivory" : "text-ink")}>
                {formatPrice(variant.price)}
              </span>
            )}
          </div>
          {product.headline && (
            <p className={clsx("mt-2 line-clamp-1 text-[15px]", dark ? "text-ivory/65" : "text-stone")}>{product.headline}</p>
          )}
          <p className={clsx("mt-3 flex items-center gap-3 text-[13px]", dark ? "text-ivory/55" : "text-stone")}>
            {product.sizeLabel && <span className="uppercase tracking-[0.14em]">{product.sizeLabel}</span>}
            {product.rating && (
              <span className="flex items-center gap-1">
                <Star size={12} strokeWidth={1} className={dark ? "fill-gold-soft text-gold-soft" : "fill-emerald text-emerald"} />
                {product.rating.value.toFixed(1)}
                <span className="opacity-70">({product.rating.count})</span>
              </span>
            )}
          </p>
        </Link>

        {variant && (
          <div className={clsx("mt-4 lg:hidden", dark && "[&>button]:bg-ivory [&>button]:text-ink")}>
            <QuickAdd product={product} className="w-full" />
          </div>
        )}
      </div>
    </article>
  );
}
