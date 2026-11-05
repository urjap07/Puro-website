import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getActiveProducts, getConcerns } from "@/db/queries/products";
import { GIFT_PROMO, featuredFirst } from "@/lib/listing";
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

  const matching = featuredFirst(
    products.filter((product) => product.concerns.some((item) => item.slug === slug))
  );
  // Rotate through the matching products so each concern shows a different pair.
  const offset = matching.length > 2 ? (concern.id * 2) % matching.length : 0;
  const showcase = [...matching.slice(offset), ...matching.slice(0, offset)];
  // A lifestyle shot (second image) of the lead product sets the mood.
  const backdrop = showcase[0]?.images[1]?.imageUrl ?? "/media/brand/02.jpg";

  return (
    <>
      <ListingHeader
        eyebrow={concern.type === "hair" ? "Shop by hair concern" : "Shop by skin concern"}
        title={concern.name}
        description={concern.description}
        backdrop={backdrop}
        products={showcase}
        count={matching.length}
        links={concerns
          .filter((item) => item.type === concern.type)
          .map((item) => ({
            label: item.name,
            href: `/concerns/${item.slug}`,
            active: item.slug === slug,
          }))}
      />
      <div className="glow-botanical">
        <div className="container-site py-14 sm:py-20">
          <ShopGrid products={matching} showFilters={false} promo={GIFT_PROMO} />
        </div>
      </div>
    </>
  );
}
