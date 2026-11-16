import type { Metadata } from "next";
import Link from "next/link";
import { getActiveProducts, getConcerns } from "@/db/queries/products";
import { EDITS, type EditKey, menuEdits, productsInEdit } from "@/lib/edits";
import { parseFilters, type RawParams } from "@/lib/results-params";
import ResultsHero from "@/components/commerce/ResultsHero";
import ShopResults from "@/components/commerce/ShopResults";

/** Page metadata for an edit; an empty edit is kept out of search engines. */
export async function editMetadata(key: EditKey): Promise<Metadata> {
  const edit = EDITS[key];
  const empty = productsInEdit(await getActiveProducts(), key).length === 0;
  return {
    title: edit.title,
    description: edit.description,
    alternates: { canonical: edit.href },
    robots: empty ? { index: false } : undefined,
  };
}

/** Bestsellers, New Arrivals and PURO Classics: a curated edit with the shop's filters. */
export default async function EditPage({ edit: key, searchParams }: { edit: EditKey; searchParams: Promise<RawParams> }) {
  const edit = EDITS[key];
  const [query, all, concerns] = await Promise.all([searchParams, getActiveProducts(), getConcerns()]);
  const products = productsInEdit(all, key);
  const hasNew = productsInEdit(all, "new-arrivals").length > 0;
  const [before, after] = edit.title.split(edit.emphasis);

  // The edits shown as links: the current one, plus the others customers can browse.
  const siblings = [...new Map([...menuEdits(hasNew), EDITS.classics, edit].map((item) => [item.key, item])).values()];
  const links = [
    ...siblings.map((item) => ({ label: item.label, href: item.href, active: item.key === key, tint: item.tint })),
    { label: "Shop all", href: "/shop", tint: "champagne" as const },
  ];

  const backdrop = products[0]?.images[1]?.imageUrl ?? products[0]?.images[0]?.imageUrl ?? "/media/products/glow-up-pithi-pack/04.jpg";

  return (
    <>
      <ResultsHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Shop", href: "/shop" }, { label: edit.title }]}
        eyebrow={products.length ? `${products.length} ${products.length === 1 ? "ritual" : "rituals"}` : edit.eyebrow}
        title={
          <>
            {before}
            <em>{edit.emphasis}</em>
            {after}
          </>
        }
        description={edit.description}
        image={backdrop}
        links={links}
        tint={edit.tint}
      />
      <div className="bg-pearl">
        <div className="container-site py-10 sm:py-14">
          {products.length > 0 ? (
            <ShopResults
              products={products}
              concerns={concerns}
              initial={parseFilters(query, query.sort ? {} : { sort: edit.sort })}
            />
          ) : (
            <div className="glass-strong mx-auto max-w-[640px] rounded-[32px] px-6 py-14 text-center">
              <p className="relative z-[2] font-display text-[32px] leading-tight text-midnight">Nothing new just yet</p>
              <p className="relative z-[2] mx-auto mt-3 max-w-[440px] text-[15px] leading-[1.7] text-stone">
                Our next launches are on their way. Meanwhile, explore the rituals our customers love most.
              </p>
              <div className="relative z-[2] mt-8 flex flex-wrap justify-center gap-3">
                <Link href={EDITS.bestsellers.href} className="btn-primary !px-8 !py-3.5">
                  Shop bestsellers
                </Link>
                <Link href={EDITS.classics.href} className="btn-glass !px-8 !py-3.5">
                  PURO Classics
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
