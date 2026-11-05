import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getActiveProducts } from "@/db/queries/products";
import {
  COLLECTIONS,
  getCollection,
  pickShowcase,
  productsInCollection,
} from "@/lib/collections";
import { SANISA_PROMO, featuredFirst } from "@/lib/listing";
import ShopGrid from "@/components/shop/ShopGrid";
import ListingHeader from "@/components/shop/ListingHeader";

export const dynamic = "force-dynamic";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollection(slug);
  return collection
    ? { title: collection.title, description: collection.description }
    : { title: "Collection not found" };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  if (slug === "all") redirect("/shop");

  const collection = getCollection(slug);
  if (!collection) notFound();

  const products = featuredFirst(productsInCollection(await getActiveProducts(), collection));

  return (
    <>
      <ListingHeader
        eyebrow="Collection"
        title={collection.title}
        description={collection.description}
        backdrop={collection.image}
        products={pickShowcase(products, collection.showcase)}
        count={products.length}
        links={COLLECTIONS.map((item) => ({
          label: item.title,
          href: `/collections/${item.slug}`,
          active: item.slug === slug,
        }))}
      />
      <div className="glow-botanical">
        <div className="container-site py-14 sm:py-20">
          <ShopGrid products={products} showFilters={false} promo={SANISA_PROMO} />
        </div>
      </div>
    </>
  );
}
