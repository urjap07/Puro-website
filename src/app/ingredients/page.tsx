import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getActiveProducts, getIngredients } from "@/db/queries/products";
import { formulasWith, otherKeyIngredients } from "@/lib/catalogue";
import { ingredientTint } from "@/components/commerce/tints";
import IngredientLibrary, { type AlsoEntry, type LibraryEntry } from "@/components/ingredients/IngredientLibrary";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Ingredient Library",
  description:
    "The botanicals in PURO formulas — turmeric, aloe vera, volcanic clay, shea and cocoa butter, lavender and rosemary — the role each plays and the formulas you'll find it in.",
  alternates: { canonical: "/ingredients" },
};

export default async function IngredientsPage() {
  const [ingredients, products] = await Promise.all([getIngredients(), getActiveProducts()]);
  const pick = (list: typeof products) => list.map((product) => ({ slug: product.slug, name: product.name }));

  const entries: LibraryEntry[] = ingredients.map((ingredient) => ({
    slug: ingredient.slug,
    name: ingredient.name,
    role: ingredient.benefits,
    image: ingredient.imageUrl,
    tint: ingredientTint(ingredient.slug),
    formulas: pick(formulasWith(products, ingredient)),
  }));
  const also: AlsoEntry[] = otherKeyIngredients(products, ingredients).map((entry) => ({ name: entry.name, formulas: pick(entry.products) }));

  return (
    <div className="pb-24">
      <section className="container-site pt-8 sm:pt-12">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-stone">
          <Link href="/" className="underline-offset-4 hover:text-midnight hover:underline">
            Home
          </Link>
          <ChevronRight size={13} strokeWidth={1.4} />
          <span className="text-ink">Ingredients</span>
        </nav>
        <header className="mx-auto mt-8 max-w-[760px] text-center">
          <p className="label justify-center text-[#45633D]">The Ingredient Library</p>
          <h1 className="mt-5 font-display text-[48px] font-light leading-[1] text-midnight sm:text-[72px]">
            Know what you <em className="text-iris pr-1">put on your skin.</em>
          </h1>
          <p className="mx-auto mt-5 max-w-[560px] text-[16px] leading-[1.8] text-stone">
            Every PURO formula is built around a handful of familiar botanicals. Here is the role each one plays, and
            where you&rsquo;ll find it.
          </p>
        </header>
      </section>

      <section className="container-site mt-10" aria-label="Ingredients">
        <IngredientLibrary entries={entries} also={also} />
        <p className="mx-auto mt-10 max-w-[640px] text-center text-[12px] leading-[1.7] text-stone">
          Ingredient descriptions explain the role each ingredient plays in our formulas. They aren&rsquo;t medical advice;
          for skin conditions please speak to a dermatologist.
        </p>
      </section>
    </div>
  );
}
