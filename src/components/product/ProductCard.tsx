import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/db/queries/products";
import { formatPrice } from "@/lib/format";
import { QuickAdd } from "@/components/cart/AddToBag";
import ImagePlaceholder from "./ImagePlaceholder";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

const SIZES = "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw";

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const [primary, secondary] = product.images;
  const variant = product.variants[0];
  const href = `/products/${product.slug}`;

  return (
    <article className="group">
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-mist-card">
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

        <QuickAdd
          product={product}
          className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 focus:translate-y-0 focus:opacity-100 max-lg:hidden"
        />
      </div>

      <Link href={href} className="block pt-5 text-center">
        <p className="text-[10px] uppercase tracking-[0.24em] text-gold-deep">
          {product.subCategory ?? product.categories[0]?.name}
        </p>
        <h3 className="mt-2 font-display text-[21px] leading-tight text-emerald transition-colors group-hover:text-gold-deep">
          {product.name}
        </h3>
        {product.headline && (
          <p className="mx-auto mt-1.5 line-clamp-1 max-w-[260px] text-[13px] text-stone">
            {product.headline}
          </p>
        )}
        {variant && (
          <p className="mt-3 text-[14px] text-ink">
            {formatPrice(variant.price)}
            {product.sizeLabel && (
              <span className="ml-2 text-[12px] text-stone">· {product.sizeLabel}</span>
            )}
          </p>
        )}
      </Link>
    </article>
  );
}
