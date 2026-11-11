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

/** A compact product tile for horizontal rows. */
function RowTile({ product, rank }: { product: Product; rank?: number }) {
  const href = `/products/${product.slug}`;
  const cutout = cutoutFor(product.slug);
  const image = cutout ?? product.images[0]?.imageUrl;
  const variant = product.variants[0];

  return (
    <article className="group flex w-[180px] shrink-0 snap-start flex-col sm:w-[214px]">
      <div
        data-fly-source
        className="relative aspect-square overflow-hidden rounded-[20px] bg-[radial-gradient(ellipse_75%_62%_at_50%_44%,#ffffff_0%,#f5efe5_60%,#e7ddcc_100%)] ring-1 ring-ink/[0.05]"
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
          <span className="pointer-events-none absolute left-0 top-0 rounded-br-[16px] bg-gradient-to-br from-[#f1e2bd] to-[#c59a55] px-3 py-1.5 text-[12px] font-bold text-ink">
            #{rank}
          </span>
        )}
        <WishButton product={product} className="absolute right-2.5 top-2.5 opacity-0 transition group-hover:opacity-100 [&[aria-pressed=true]]:opacity-100 max-lg:opacity-100" />
      </div>
      <Link href={href} className="mt-3 line-clamp-2 font-display text-[18px] leading-[1.15] text-ink hover:text-emerald">
        {product.name}
      </Link>
      {product.rating && <StarRating value={product.rating.value} count={product.rating.count} size={12} className="mt-1.5" />}
      {variant && <Price value={variant.price} size="sm" className="mt-2" />}
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

  const arrow = "absolute top-[30%] z-10 hidden h-12 w-12 items-center justify-center rounded-full bg-ivory text-ink shadow-[0_14px_30px_-12px_rgba(0,0,0,0.45)] ring-1 ring-ink/10 transition hover:bg-emerald hover:text-ivory disabled:pointer-events-none disabled:opacity-0 sm:flex";

  return (
    <section className="rounded-[28px] bg-ivory p-5 shadow-[0_30px_60px_-46px_rgba(6,48,58,0.6)] ring-1 ring-ink/[0.06] sm:p-7">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-[28px] leading-tight text-ink sm:text-[34px]">{title}</h2>
          {note && <p className="mt-1 text-[14px] text-stone">{note}</p>}
        </div>
        {href && (
          <Link href={href} className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-emerald underline-offset-4 hover:underline">
            See all <ArrowRight size={14} strokeWidth={1.6} />
          </Link>
        )}
      </div>
      <div className="relative">
        <button type="button" aria-label={`Scroll ${title} back`} disabled={edges.start} onClick={() => track.current?.scrollBy({ left: -track.current.clientWidth * 0.8, behavior: "smooth" })} className={`${arrow} -left-3`}>
          <ChevronLeft size={20} strokeWidth={1.4} />
        </button>
        <div ref={track} onScroll={update} data-lenis-prevent-wheel className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1 sm:gap-5">
          {products.map((product, index) => (
            <RowTile key={product.id} product={product} rank={ranked ? index + 1 : undefined} />
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
