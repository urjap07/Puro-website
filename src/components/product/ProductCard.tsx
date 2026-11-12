import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import type { Product } from "@/db/queries/products";
import { formatPrice } from "@/lib/format";
import { QuickAdd } from "@/components/cart/AddToBag";
import WishButton from "@/components/cart/WishButton";
import { TINT, productTint } from "@/components/commerce/tints";

export type CardProduct = Pick<
  Product,
  "id" | "slug" | "name" | "headline" | "summary" | "subCategory" | "categories" | "images" | "variants" | "rating"
>;

/**
 * Editorial product card: packshot that gives way to a styled photograph on
 * hover, category label, name, a one-line description and price, with
 * wishlist and quick add. The whole card links to the product page.
 */
export default function ProductCard({
  product,
  priority = false,
  className,
}: {
  product: CardProduct;
  priority?: boolean;
  className?: string;
}) {
  const variant = product.variants[0];
  const primary = product.images[0];
  const secondary = product.images[2] ?? product.images[1];
  const category = product.subCategory ?? product.categories[0]?.name;
  const description = product.headline ?? product.summary;
  const href = `/products/${product.slug}`;
  const soldOut = variant ? variant.stockQuantity <= 0 : true;

  return (
    <article className={clsx("glass glass-hover group flex flex-col rounded-[28px] p-3", TINT[productTint(product)].glass, className)}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] bg-white/40 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7)]">
        <Link href={href} aria-label={product.name} className="absolute inset-0">
          {primary && (
            <Image
              src={primary.imageUrl}
              alt={primary.altText ?? product.name}
              fill
              priority={priority}
              sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 46vw"
              className={clsx(
                "object-cover transition duration-[1.1s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]",
                secondary && "group-hover:opacity-0",
              )}
            />
          )}
          {secondary && (
            <Image
              src={secondary.imageUrl}
              alt=""
              fill
              sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 46vw"
              className="scale-[1.06] object-cover opacity-0 transition duration-[1.1s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-100 group-hover:opacity-100"
            />
          )}
        </Link>

        {soldOut && (
          <span className="glass absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-graphite">
            Sold out
          </span>
        )}

        <WishButton product={product} className="absolute right-3 top-3 z-10" />

        {/* Quick add: rises on hover with a pointer, always reachable by keyboard */}
        {!soldOut && (
          <div className="absolute inset-x-3 bottom-3 z-10 hidden translate-y-3 opacity-0 transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] focus-within:translate-y-0 focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 [@media(hover:hover)]:block">
            <QuickAdd product={product} className="w-full bg-midnight/95 backdrop-blur" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col px-1.5 pb-1.5 pt-4">
        {category && <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-stone">{category}</p>}
        <h3 className="mt-1.5 font-display text-[22px] font-medium leading-[1.1] text-midnight sm:text-[24px]">
          <Link href={href} className="transition-colors hover:text-champagne-deep">
            {product.name}
          </Link>
        </h3>
        {description && <p className="mt-1.5 line-clamp-2 text-[13px] leading-[1.6] text-stone sm:text-[14px]">{description}</p>}
        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          {variant && (
            <p className="flex items-baseline gap-2 text-[15px] font-medium text-graphite">
              {formatPrice(variant.price)}
              {variant.compareAtPrice && variant.compareAtPrice > variant.price && (
                <s className="text-[13px] font-normal text-stone/80">{formatPrice(variant.compareAtPrice)}</s>
              )}
              {variant.name && <span className="text-[12px] font-normal text-stone">· {variant.name}</span>}
            </p>
          )}
        </div>
        {/* Touch screens: quick add sits under the card */}
        {!soldOut && (
          <div className="mt-3 [@media(hover:hover)]:hidden">
            <QuickAdd product={product} className="w-full" />
          </div>
        )}
      </div>
    </article>
  );
}
