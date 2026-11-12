import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getActiveProducts, getConcerns } from "@/db/queries/products";
import { COLLECTIONS, getCollection } from "@/lib/collections";
import { parseFilters, type RawParams } from "@/lib/results-params";
import ResultsHero from "@/components/commerce/ResultsHero";
import { collectionTint } from "@/components/commerce/tints";
import ShopResults from "@/components/commerce/ShopResults";

export const dynamic = "force-dynamic";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<RawParams>;
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollection(slug);
  return collection ? { title: collection.title, description: collection.description } : { title: "Collection not found" };
}

export default async function CollectionPage({ params, searchParams }: CollectionPageProps) {
  const { slug } = await params;
  if (slug === "all") redirect("/shop");
  const collection = getCollection(slug);
  if (!collection) notFound();

  const [query, products, concerns] = await Promise.all([searchParams, getActiveProducts(), getConcerns()]);
  const count = products.filter((product) =>
    product.categories.some((category) => collection.categorySlugs.includes(category.slug)),
  ).length;

  return (
    <>
      <ResultsHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Shop", href: "/shop" }, { label: collection.title }]}
        eyebrow={`${count} ${count === 1 ? "ritual" : "rituals"}`}
        title={collection.title}
        description={collection.description}
        image={collection.image}
        links={COLLECTIONS.map((item) => ({ label: item.title, href: `/collections/${item.slug}`, active: item.slug === slug, tint: collectionTint(item.slug) }))}
        tint={collectionTint(slug)}
      />
      <div className="bg-pearl">
        <div className="container-site py-10 sm:py-14">
          <ShopResults
            products={products}
            concerns={concerns}
            initial={parseFilters(query, { collection: slug })}
            lockCollection
          />
        </div>
      </div>
    </>
  );
}
