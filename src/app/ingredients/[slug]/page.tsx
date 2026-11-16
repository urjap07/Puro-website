import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import clsx from "clsx";
import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import { getActiveProducts, getIngredients, type Concern } from "@/db/queries/products";
import { cadence, formulasWith, ritualStep } from "@/lib/catalogue";
import { TINT, concernTint, ingredientTint } from "@/components/commerce/tints";
import ProductCard from "@/components/product/ProductCard";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

interface IngredientPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: IngredientPageProps): Promise<Metadata> {
  const { slug } = await params;
  const ingredient = (await getIngredients()).find((item) => item.slug === slug);
  if (!ingredient) return { title: "Ingredient not found" };
  return {
    title: `${ingredient.name} — Ingredient Library`,
    description: ingredient.benefits ?? `${ingredient.name} in PURO formulas.`,
    alternates: { canonical: `/ingredients/${ingredient.slug}` },
    openGraph: { images: ingredient.imageUrl ? [ingredient.imageUrl] : undefined },
  };
}

export default async function IngredientPage({ params }: IngredientPageProps) {
  const { slug } = await params;
  const [ingredients, products] = await Promise.all([getIngredients(), getActiveProducts()]);
  const index = ingredients.findIndex((item) => item.slug === slug);
  if (index === -1) notFound();
  const ingredient = ingredients[index];
  const previous = ingredients[(index - 1 + ingredients.length) % ingredients.length];
  const next = ingredients[(index + 1) % ingredients.length];
  const tint = TINT[ingredientTint(ingredient.slug)];

  const formulas = formulasWith(products, ingredient).sort((a, b) => (b.rating?.count ?? 0) - (a.rating?.count ?? 0));
  const concerns = [...new Map(formulas.flatMap((product) => product.concerns).map((concern) => [concern.slug, concern])).values()] as Concern[];

  const breadcrumbs = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE.url}/` },
      { "@type": "ListItem", position: 2, name: "Ingredients", item: `${SITE.url}/ingredients` },
      { "@type": "ListItem", position: 3, name: ingredient.name, item: `${SITE.url}/ingredients/${ingredient.slug}` },
    ],
  }).replace(/</g, "\\u003c");

  return (
    <div className="pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbs }} />
      <div className="container-site pt-8 sm:pt-10">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[13px] text-stone">
          <Link href="/" className="underline-offset-4 hover:text-midnight hover:underline">
            Home
          </Link>
          <ChevronRight size={13} strokeWidth={1.4} />
          <Link href="/ingredients" className="underline-offset-4 hover:text-midnight hover:underline">
            Ingredients
          </Link>
          <ChevronRight size={13} strokeWidth={1.4} />
          <span className="text-ink">{ingredient.name}</span>
        </nav>

        {/* Hero */}
        <section className={clsx("glass mt-6 rounded-[32px] p-3 sm:rounded-[40px] sm:p-4", tint.glass)}>
          <div className="grid items-stretch gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[26px] md:aspect-auto md:min-h-[440px] md:rounded-[32px]">
              {ingredient.imageUrl && (
                <Image src={ingredient.imageUrl} alt={`${ingredient.name}, a PURO ingredient`} fill priority sizes="(min-width: 768px) 48vw, 100vw" className="object-cover" />
              )}
            </div>
            <div className="relative z-[2] flex flex-col justify-center px-4 py-6 sm:px-8 lg:px-12">
              <p className={clsx("text-[11px] font-semibold uppercase tracking-[0.26em]", tint.text)}>
                Ingredient {String(index + 1).padStart(2, "0")} of {String(ingredients.length).padStart(2, "0")}
              </p>
              <h1 className="mt-4 font-display text-[52px] font-light leading-[0.95] text-midnight sm:text-[76px]">{ingredient.name}</h1>
              {ingredient.benefits && (
                <>
                  <p className="mt-7 text-[11px] font-semibold uppercase tracking-[0.22em] text-midnight">Its role in our formulas</p>
                  <p className="mt-2 max-w-[520px] font-display text-[22px] italic leading-[1.4] text-graphite sm:text-[26px]">{ingredient.benefits}</p>
                </>
              )}
              <div className="mt-7 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/70 px-4 py-2 text-[13px] font-medium text-midnight">
                  In {formulas.length} {formulas.length === 1 ? "formula" : "formulas"}
                </span>
                {concerns.length > 0 && (
                  <span className="rounded-full bg-white/70 px-4 py-2 text-[13px] font-medium text-midnight">
                    For {concerns.length} {concerns.length === 1 ? "concern" : "concerns"}
                  </span>
                )}
              </div>
              {formulas.length > 0 && (
                <Link href={`/shop?ingredient=${ingredient.slug}`} className="btn-primary mt-8 self-start !px-9 !py-3.5">
                  Shop formulas with {ingredient.name.toLowerCase()}
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Formulas */}
        {formulas.length > 0 && (
          <section aria-labelledby="formulas-title" className="mt-14">
            <h2 id="formulas-title" className="font-display text-[36px] leading-tight text-midnight sm:text-[46px]">
              Found <em className="text-iris pr-1">in</em>
            </h2>
            <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
              {formulas.map((product) => (
                <li key={product.id}>
                  <ProductCard product={product} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-14 grid gap-5 lg:grid-cols-2">
          {/* How it's used */}
          {formulas.length > 0 && (
            <section aria-labelledby="used-title" className="glass-strong rounded-[32px] p-6 sm:p-8">
              <h2 id="used-title" className="relative z-[2] font-display text-[30px] leading-tight text-midnight">
                How it&rsquo;s used
              </h2>
              <p className="relative z-[2] mt-1 text-[14px] text-stone">Where {ingredient.name.toLowerCase()} sits in a ritual, formula by formula.</p>
              <ul className="relative z-[2] mt-5 divide-y divide-midnight/10">
                {formulas.map((product) => {
                  const rhythm = cadence(product);
                  return (
                    <li key={product.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                      <Link href={`/products/${product.slug}`} className="font-display text-[20px] text-midnight underline-offset-4 hover:underline">
                        {product.name}
                      </Link>
                      <span className="flex gap-2 text-[12px]">
                        <span className="rounded-full bg-white/70 px-3 py-1 font-medium text-midnight">{ritualStep(product).label}</span>
                        {rhythm && <span className="rounded-full bg-white/70 px-3 py-1 text-stone">{rhythm === "daily" ? "Everyday" : "Weekly"}</span>}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* Concerns */}
          {concerns.length > 0 && (
            <section aria-labelledby="concerns-title" className="glass rounded-[32px] p-6 sm:p-8">
              <h2 id="concerns-title" className="relative z-[2] font-display text-[30px] leading-tight text-midnight">
                Made for
              </h2>
              <p className="relative z-[2] mt-1 text-[14px] text-stone">The concerns our formulas with {ingredient.name.toLowerCase()} are made for.</p>
              <ul className="relative z-[2] mt-5 flex flex-wrap gap-2">
                {concerns.map((concern) => {
                  const colour = TINT[concernTint(concern)];
                  return (
                    <li key={concern.slug}>
                      <Link href={`/concerns/${concern.slug}`} className={clsx("glass glass-hover inline-flex rounded-full px-4 py-2 text-[14px] font-medium", colour.glass, colour.text)}>
                        <span className="relative z-[2]">{concern.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>

        {/* Browse the library */}
        <nav aria-label="More ingredients" className="mt-14 flex flex-wrap items-center justify-between gap-3">
          <Link href={`/ingredients/${previous.slug}`} className="btn-glass !px-6 !py-3 !text-[11px]">
            <ArrowLeft size={14} strokeWidth={1.6} /> {previous.name}
          </Link>
          <Link href="/ingredients" className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#5E4B8A] underline-offset-4 hover:underline">
            All ingredients
          </Link>
          <Link href={`/ingredients/${next.slug}`} className="btn-glass !px-6 !py-3 !text-[11px]">
            {next.name} <ArrowRight size={14} strokeWidth={1.6} />
          </Link>
        </nav>

        <p className="mx-auto mt-10 max-w-[640px] text-center text-[12px] leading-[1.7] text-stone">
          This page explains the role {ingredient.name.toLowerCase()} plays in our formulas. It isn&rsquo;t medical advice; for
          skin conditions please speak to a dermatologist.
        </p>
      </div>
    </div>
  );
}
