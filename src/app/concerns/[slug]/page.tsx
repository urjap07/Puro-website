import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getActiveProducts, getConcerns } from "@/db/queries/products";
import { parseFilters, type RawParams } from "@/lib/results-params";
import ResultsHero from "@/components/commerce/ResultsHero";
import { concernTint } from "@/components/commerce/tints";
import ShopResults from "@/components/commerce/ShopResults";

export const dynamic = "force-dynamic";

interface ConcernPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<RawParams>;
}

export async function generateMetadata({ params }: ConcernPageProps): Promise<Metadata> {
  const { slug } = await params;
  const concern = (await getConcerns()).find((item) => item.slug === slug);
  return concern ? { title: concern.name, description: concern.description ?? undefined } : { title: "Concern not found" };
}

export default async function ConcernPage({ params, searchParams }: ConcernPageProps) {
  const { slug } = await params;
  const [query, concerns, products] = await Promise.all([searchParams, getConcerns(), getActiveProducts()]);
  const concern = concerns.find((item) => item.slug === slug);
  if (!concern) notFound();

  const matching = products.filter((product) => product.concerns.some((item) => item.slug === slug));
  const backdrop = matching[0]?.images[1]?.imageUrl ?? "/media/brand/02.jpg";

  return (
    <>
      <ResultsHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Shop", href: "/shop" }, { label: concern.name }]}
        eyebrow={concern.type === "hair" ? "Shop by hair concern" : "Shop by skin concern"}
        title={concern.name}
        description={concern.description}
        image={backdrop}
        links={concerns
          .filter((item) => item.type === concern.type)
          .map((item) => ({ label: item.name, href: `/concerns/${item.slug}`, active: item.slug === slug, tint: concernTint(item) }))}
        tint={concernTint(concern)}
      />
      <div className="bg-pearl">
        <div className="container-site py-10 sm:py-14">
          <ShopResults products={products} concerns={concerns} initial={parseFilters(query, { concerns: [slug] })} syncUrl={false} />
        </div>
      </div>
    </>
  );
}
