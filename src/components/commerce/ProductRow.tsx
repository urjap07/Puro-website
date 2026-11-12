"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/db/queries/products";
import { cutoutFor } from "@/lib/cutouts";
import { useRecentlyViewed } from "@/lib/recent-store";
import WishButton from "@/components/cart/WishButton";
import Price from "./Price";
import StarRating from "./StarRating";
import { BagButton } from "./ResultCard";
import QuickLookButton from "./QuickLookButton";
import { TINT, productTint } from "./tints";

/** A compact product tile for horizontal rows. */
function RowTile({ product, rank, group }: { product: Product; rank?: number; group: Product[] }) {
  const href = `/products/${product.slug}`;
  const cutout = cutoutFor(product.slug);
  const image = cutout ?? product.images[0]?.imageUrl;
  const variant = product.variants[0];

  return (
    <article className={`glass glass-hover ${TINT[productTint(product)].glass} group flex w-[180px] shrink-0 snap-start flex-col rounded-[26px] p-2.5 sm:w-[214px]`}>
      <div
        data-fly-source
        data-quicklook={product.slug}
        className="relative aspect-square overflow-hidden rounded-[20px] bg-[radial-gradient(ellipse_75%_62%_at_50%_44%,rgba(255,255,255,0.95)_0%,rgba(247,242,233,0.78)_60%,rgba(231,221,204,0.62)_100%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7)]"
      >
        <Link href={href} aria-label={product.name} data-cursor="View" className="absolute inset-0">
          {image && (
            <Image
              src={image}
              alt={product.name}
              fill
              sizes="214px"
              className={clsx(
                "transition duration-700 group-hover:scale-[1.06]",
                cutout ? "object-contain p-[12%] drop-shadow-[0_14px_14px_rgba(0,0,0,0.16)]" : "object-cover",
              )}
            />
          )}
        </Link>
        {rank && (
          <span className="pointer-events-none absolute left-2.5 top-2.5 rounded-full bg-gradient-to-b from-[#f3eadb] via-[#dccbab] to-[#cbb68f] px-2.5 py-1 text-[12px] font-bold text-midnight-deep shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_6px_14px_-8px_rgba(122,101,68,0.8)]">
            #{rank}
          </span>
        )}
        <WishButton product={product} className="absolute right-2.5 top-2.5 opacity-0 transition group-hover:opacity-100 [&[aria-pressed=true]]:opacity-100 max-lg:opacity-100" />
        <QuickLookButton product={product} group={group} className="bottom-2.5 px-3 py-1.5 text-[10px]" />
      </div>
      <Link href={href} className="mt-3 line-clamp-2 px-1 font-display text-[18px] leading-[1.15] text-midnight hover:text-champagne-deep">
        {product.name}
      </Link>
      {product.rating && <StarRating value={product.rating.value} count={product.rating.count} size={12} className="mt-1.5 px-1" />}
      {variant && <Price value={variant.price} size="sm" className="mt-2 px-1" />}
      <div className="mt-auto pt-3">
        <BagButton product={product} className="h-10 w-full text-[11px]" />
      </div>
    </article>
  );
}

/** Horizontally scrolling row of products with a title and arrows. */
export default function ProductRow({
  title,
  note,
  href,
  products,
  ranked = false,
}: {
  title: string;
  note?: string;
  href?: string;
  products: Product[];
  ranked?: boolean;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const update = () => {
    const el = track.current;
    if (el) setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  };
  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [products.length]);
  if (products.length === 0) return null;

  const arrow = "glass-strong absolute top-[30%] z-10 hidden h-12 w-12 items-center justify-center rounded-full text-midnight transition hover:text-champagne-deep disabled:pointer-events-none disabled:opacity-0 sm:flex";

  return (
    <section className="glass-strong rounded-[28px] p-5 sm:rounded-[32px] sm:p-7">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-[28px] leading-tight text-midnight sm:text-[34px]">{title}</h2>
          {note && <p className="mt-1 text-[14px] text-stone">{note}</p>}
        </div>
        {href && (
          <Link href={href} className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-midnight underline-offset-4 hover:underline">
            See all <ArrowRight size={14} strokeWidth={1.6} />
          </Link>
        )}
      </div>
      <div className="relative">
        <button type="button" aria-label={`Scroll ${title} back`} disabled={edges.start} onClick={() => track.current?.scrollBy({ left: -track.current.clientWidth * 0.8, behavior: "smooth" })} className={`${arrow} -left-3`}>
          <ChevronLeft size={20} strokeWidth={1.4} />
        </button>
        <div ref={track} onScroll={update} data-lenis-prevent-wheel className="no-scrollbar -mx-2 -my-3 flex snap-x snap-mandatory scroll-px-2 gap-4 overflow-x-auto px-2 py-3 sm:gap-5">
          {products.map((product, index) => (
            <RowTile key={product.id} product={product} rank={ranked ? index + 1 : undefined} group={products} />
          ))}
        </div>
        <button type="button" aria-label={`Scroll ${title} forward`} disabled={edges.end} onClick={() => track.current?.scrollBy({ left: track.current.clientWidth * 0.8, behavior: "smooth" })} className={`${arrow} -right-3`}>
          <ChevronRight size={20} strokeWidth={1.4} />
        </button>
      </div>
    </section>
  );
}

/** "Recently viewed" — only appears once the visitor has looked at products. */
export function RecentlyViewedRow({ products }: { products: Product[] }) {
  const slugs = useRecentlyViewed((state) => state.slugs);
  useEffect(() => {
    useRecentlyViewed.persist.rehydrate();
  }, []);
  const viewed = slugs.map((slug) => products.find((product) => product.slug === slug)).filter((p): p is Product => Boolean(p));
  if (viewed.length === 0) return null;
  return <ProductRow title="Your recently viewed" note="Pick up where you left off" products={viewed} />;
}

/** Records a product view (rendered on the product page). */
export function RecordView({ slug }: { slug: string }) {
  const record = useRecentlyViewed((state) => state.record);
  useEffect(() => {
    Promise.resolve(useRecentlyViewed.persist.rehydrate()).then(() => record(slug));
  }, [slug, record]);
  return null;
}
