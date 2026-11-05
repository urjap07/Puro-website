import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import type { Product } from "@/db/queries/products";
import { formatPrice } from "@/lib/format";
import { QuickAdd } from "@/components/cart/AddToBag";
import ImagePlaceholder from "./ImagePlaceholder";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

const SIZES = "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw";

/** Soft arch echoing the palace-arch motif, gentle enough not to clip wide packshots. */
const ARCH = "rounded-b-2xl rounded-t-[80px] sm:rounded-t-[120px]";

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const [primary, secondary] = product.images;
  const variant = product.variants[0];
  const href = `/products/${product.slug}`;
  const soldOut = variant ? variant.stockQuantity <= 0 : false;
  const badge = soldOut
    ? "Sold out"
    : product.isFeatured
      ? "Bestseller"
      : product.isClassic
        ? "Puro Classic"
        : null;

  return (
    <article className="group relative flex h-full flex-col rounded-[28px] bg-mist-card/70 p-2.5 ring-1 ring-emerald/[0.06] transition duration-500 hover:-translate-y-1 hover:bg-mist-card hover:shadow-[0_30px_60px_-35px_rgba(18,59,48,0.55)] hover:ring-gold/40 sm:p-3">
      <div className={`relative aspect-[4/5] overflow-hidden bg-gradient-to-b from-white to-mist-deep/50 ${ARCH}`}>
        <Link href={href} className="absolute inset-0" aria-label={product.name}>
          {primary ? (
            <>
              <Image
                src={primary.imageUrl}
                alt={primary.altText ?? product.name}
                fill
                priority={priority}
                sizes={SIZES}
                className="object-cover mix-blend-multiply transition duration-[1400ms] ease-out group-hover:scale-[1.04]"
              />
              {secondary && (
                <Image
                  src={secondary.imageUrl}
                  alt=""
                  fill
                  sizes={SIZES}
                  className="object-cover opacity-0 transition duration-700 group-hover:opacity-100"
                />
              )}
            </>
          ) : (
            <ImagePlaceholder name={product.name} />
          )}
        </Link>

        {badge && (
          <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-emerald-deep/90 px-3 py-1.5 text-[9px] uppercase tracking-[0.22em] text-gold-soft backdrop-blur sm:text-[10px]">
            {badge}
          </span>
        )}
        {product.rating && (
          <span className="pointer-events-none absolute bottom-3 right-3 hidden items-center gap-1 sm:flex rounded-full bg-mist-card/90 px-2.5 py-1.5 text-[11px] text-emerald backdrop-blur">
            <Star size={11} strokeWidth={1} className="fill-gold text-gold" />
            {product.rating.value.toFixed(1)}
            <span className="text-stone">({product.rating.count})</span>
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-2 pt-5 text-center sm:px-3">
        <Link href={href} className="flex-1">
          <p className="text-[10px] uppercase tracking-[0.24em] text-gold-deep">
            {product.subCategory ?? product.categories[0]?.name}
          </p>
          <h3 className="mt-2 font-display text-[19px] leading-tight text-emerald transition-colors group-hover:text-gold-deep sm:text-[21px]">
            {product.name}
          </h3>
          {product.headline && (
            <p className="mx-auto mt-1.5 line-clamp-1 max-w-[260px] text-[13px] text-stone">
              {product.headline}
            </p>
          )}
          {product.rating && (
            <p className="mt-2 flex items-center justify-center gap-1 text-[11px] text-emerald sm:hidden">
              <Star size={11} strokeWidth={1} className="fill-gold text-gold" />
              {product.rating.value.toFixed(1)}
              <span className="text-stone">({product.rating.count})</span>
            </p>
          )}
        </Link>

        {variant && (
          <div className="mt-4 flex flex-col gap-3 border-t border-line/80 pb-1 pt-3.5 text-left xl:flex-row xl:items-center xl:justify-between">
            <p className="flex items-baseline justify-center gap-2 leading-none xl:block">
              <span className="font-display text-[22px] text-ink">{formatPrice(variant.price)}</span>
              {product.sizeLabel && (
                <span className="text-[11px] uppercase tracking-[0.16em] text-stone xl:mt-1 xl:block">
                  {product.sizeLabel}
                </span>
              )}
            </p>
            <QuickAdd product={product} className="w-full xl:w-auto" />
          </div>
        )}
      </div>
    </article>
  );
}
