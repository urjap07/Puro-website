import type { Metadata } from "next";
import Link from "next/link";
import clsx from "clsx";
import { notFound } from "next/navigation";
import { getActiveProducts, getConcerns } from "@/db/queries/products";
import ShopGrid from "@/components/shop/ShopGrid";
import ListingHeader from "@/components/shop/ListingHeader";

export const dynamic = "force-dynamic";

interface ConcernPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ConcernPageProps): Promise<Metadata> {
  const { slug } = await params;
  const concern = (await getConcerns()).find((item) => item.slug === slug);
  return concern
    ? { title: concern.name, description: concern.description ?? undefined }
    : { title: "Concern not found" };
}

export default async function ConcernPage({ params }: ConcernPageProps) {
  const { slug } = await params;
  const [concerns, products] = await Promise.all([getConcerns(), getActiveProducts()]);
  const concern = concerns.find((item) => item.slug === slug);
  if (!concern) notFound();

  const matching = products.filter((product) =>
    product.concerns.some((item) => item.slug === slug)
  );

  return (
    <>
      <ListingHeader eyebrow="Shop by concern" title={concern.name} description={concern.description} />
      <div className="container-site py-14 sm:py-20">
        <nav className="no-scrollbar -mx-5 mb-12 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0">
          {concerns.map((item) => (
            <Link
              key={item.slug}
              href={`/concerns/${item.slug}`}
              className={clsx(
                "whitespace-nowrap border px-5 py-2.5 text-[10px] uppercase tracking-[0.22em] transition",
                item.slug === slug
                  ? "border-emerald bg-emerald text-ivory"
                  : "border-line text-emerald hover:border-emerald"
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <ShopGrid products={matching} showFilters={false} />
      </div>
    </>
  );
}
