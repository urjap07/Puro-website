import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getActiveProducts } from "@/db/queries/products";
import { getCollection, productsInCollection } from "@/lib/collections";
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

  const products = productsInCollection(await getActiveProducts(), collection);

  return (
    <>
      <ListingHeader
        eyebrow="Collection"
        title={collection.title}
        description={collection.description}
        image={collection.image}
      />
      <div className="container-site py-14 sm:py-20">
        <ShopGrid products={products} showFilters={false} />
      </div>
    </>
  );
}
