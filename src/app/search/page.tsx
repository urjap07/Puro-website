import type { Metadata } from "next";
import { getActiveProducts, getConcerns } from "@/db/queries/products";
import { getCollection } from "@/lib/collections";
import { parseFilters, type RawParams } from "@/lib/results-params";
import ResultsHero from "@/components/commerce/ResultsHero";
import { collectionTint } from "@/components/commerce/tints";
import ShopResults from "@/components/commerce/ShopResults";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: { searchParams: Promise<RawParams> }): Promise<Metadata> {
  const { q } = parseFilters(await searchParams);
  return { title: q ? `Results for “${q}”` : "Search" };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<RawParams> }) {
  const [params, products, concerns] = await Promise.all([searchParams, getActiveProducts(), getConcerns()]);
  const filters = parseFilters(params);
  const department = filters.collection ? getCollection(filters.collection) : null;

  return (
    <>
      <ResultsHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Search" }]}
        eyebrow={department ? `Searching in ${department.title}` : "Search results"}
        title={
          filters.q ? (
            <>
              Results for <em>&ldquo;{filters.q}&rdquo;</em>
            </>
          ) : (
            <>
              Browse <em>every ritual</em>
            </>
          )
        }
        tint={department ? collectionTint(department.slug) : "lilac"}
      />
      <div className="bg-pearl">
        <div className="container-site py-10 sm:py-14">
          <ShopResults products={products} concerns={concerns} initial={filters} />
        </div>
      </div>
    </>
  );
}
