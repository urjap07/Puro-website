import type { Metadata } from "next";
import { getActiveProducts, getConcerns } from "@/db/queries/products";
import { getCollection } from "@/lib/collections";
import ShopGrid from "@/components/shop/ShopGrid";
import ListingHeader from "@/components/shop/ListingHeader";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop All",
  description: "Explore the complete Puro Body & Soul collection of botanical skin, body and hair care.",
};

interface ShopPageProps {
  searchParams: Promise<{ collection?: string; concern?: string }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { collection, concern } = await searchParams;
  const [products, concerns] = await Promise.all([getActiveProducts(), getConcerns()]);

  return (
    <>
      <ListingHeader
        eyebrow="The Collection"
        title="Shop All"
        description="Botanical rituals for face, body, hair and the moments in between."
      />
      <div className="container-site py-14 sm:py-20">
        <ShopGrid
          products={products}
          concerns={concerns}
          initialCollection={collection && getCollection(collection) ? collection : null}
          initialConcern={concerns.some((c) => c.slug === concern) ? concern : null}
        />
      </div>
    </>
  );
}
