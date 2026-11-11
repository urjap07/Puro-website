import type { Metadata } from "next";
import { getActiveProducts, getConcerns } from "@/db/queries/products";
import { COLLECTIONS } from "@/lib/collections";
import { parseFilters, type RawParams } from "@/lib/results-params";
import ResultsHero from "@/components/commerce/ResultsHero";
import ShopResults from "@/components/commerce/ShopResults";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop All",
  description: "Explore the complete Puro Body & Soul collection of botanical skin, body and hair care.",
};

export default async function ShopPage({ searchParams }: { searchParams: Promise<RawParams> }) {
  const [params, products, concerns] = await Promise.all([searchParams, getActiveProducts(), getConcerns()]);

  return (
    <>
      <ResultsHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Shop all" }]}
        eyebrow={`${products.length} botanical rituals`}
        title={
          <>
            Shop <em>all rituals</em>
          </>
        }
        description="Botanical care for face, body and hair — rooted in age-old wisdom, delivered in 4–7 days, free over ₹500."
        image="/media/products/glow-up-pithi-pack/04.jpg"
        links={COLLECTIONS.map((collection) => ({ label: collection.title, href: `/collections/${collection.slug}` }))}
      />
      <div className="bg-pearl">
        <div className="container-site py-10 sm:py-14">
          <ShopResults products={products} concerns={concerns} initial={parseFilters(params)} />
        </div>
      </div>
    </>
  );
}
