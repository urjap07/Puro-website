import type { Ingredient, Product } from "@/db/queries/products";

/**
 * Small, data-driven views over the catalogue, shared by the ingredient
 * library, concern pages and the skincare finder. Everything here is derived
 * from what's in the database — no new claims.
 */

export type RitualStepKey = "cleanse" | "exfoliate" | "treat" | "moisturise" | "nourish" | "gift" | "unwind";

export interface RitualStep {
  key: RitualStepKey;
  label: string;
  /** Position in a routine (lower comes first). */
  order: number;
}

const STEPS: Record<RitualStepKey, RitualStep> = {
  cleanse: { key: "cleanse", label: "Cleanse", order: 1 },
  exfoliate: { key: "exfoliate", label: "Exfoliate", order: 2 },
  treat: { key: "treat", label: "Treat", order: 3 },
  moisturise: { key: "moisturise", label: "Moisturise", order: 4 },
  nourish: { key: "nourish", label: "Nourish", order: 5 },
  unwind: { key: "unwind", label: "Unwind", order: 6 },
  gift: { key: "gift", label: "Gift", order: 7 },
};

/** Which step of a ritual a product belongs to, from its product type. */
export function ritualStep(product: Pick<Product, "subCategory">): RitualStep {
  const type = (product.subCategory ?? "").toLowerCase();
  if (/cleanser|wash|soap/.test(type)) return STEPS.cleanse;
  if (/exfoliat|scrub/.test(type)) return STEPS.exfoliate;
  if (/mask|pack/.test(type)) return STEPS.treat;
  if (/moistur|cream|lotion|balm|gel/.test(type)) return STEPS.moisturise;
  if (/hair|oil|multi/.test(type)) return STEPS.nourish;
  if (/diffuser/.test(type)) return STEPS.unwind;
  if (/kit|gift|set/.test(type)) return STEPS.gift;
  return STEPS.treat;
}

export type Cadence = "daily" | "weekly";

/** How often a product is meant to be used, read from its "frequency" text. */
export function cadence(product: Pick<Product, "frequency">): Cadence | null {
  const text = (product.frequency ?? "").toLowerCase();
  if (!text) return null;
  if (/week/.test(text)) return "weekly";
  if (/day|daily/.test(text)) return "daily";
  return null;
}

/** Products that feature a library ingredient (via product_ingredients). */
export function formulasWith(products: Product[], ingredient: Pick<Ingredient, "slug">) {
  return products.filter((product) => product.ingredientLinks.some((link) => link.slug === ingredient.slug));
}

/**
 * Keywords that tie a key-ingredient name to a library ingredient. Keep in
 * step with scripts/lib/ingredient-links.mjs, which links products to the
 * library in the database. Matched as whole words ("rice extract" must not
 * match "licorice extract").
 */
const LIBRARY_KEYWORDS: Record<string, string[]> = {
  turmeric: ["turmeric"],
  "rice-walnut": ["walnut", "rice extract"],
  "aloe-vera": ["aloe"],
  "volcanic-clay": ["clay"],
  "shea-cocoa-butter": ["shea", "cocoa"],
  "lavender-rosemary": ["lavender", "rosemary"],
};

/** Names too general to list as an ingredient on their own. */
const TOO_GENERAL = new Set(["oils", "oil", "vitamins", "natural oils", "essential oils"]);

/**
 * Other key ingredients named on product sheets but not in the ingredient
 * library — e.g. saffron, licorice, rice bran oil — each with the formulas
 * that list them.
 */
export function otherKeyIngredients(products: Product[], library: Pick<Ingredient, "slug">[]) {
  const keywords = library.flatMap((ingredient) => LIBRARY_KEYWORDS[ingredient.slug] ?? []);
  const isLibrary = (name: string) => keywords.some((word) => new RegExp(`\\b${word}`, "i").test(name));
  const found = new Map<string, { name: string; products: Product[] }>();
  for (const product of products) {
    for (const raw of product.keyIngredients?.split(",") ?? []) {
      // " Home-grown Turmeric" → "Turmeric"; "Natural Citrus Oils rich in Vit C" → "Citrus Oils"
      const name = raw
        .trim()
        .replace(/\s+rich in .*$/i, "")
        .replace(/^(home-grown|natural|organic)\s+/i, "")
        .replace(/™/g, "")
        // "Licorice Extract" and "Geranium Essential Oil" are the same ingredients as "Licorice" and "Geranium".
        .replace(/\s+(extracts?|essential oil)$/i, "")
        .trim();
      const lower = name.toLowerCase();
      if (name.length < 3 || TOO_GENERAL.has(lower) || isLibrary(raw) || isLibrary(name)) continue;
      const key = lower.replace(/s$/, "");
      const entry = found.get(key) ?? { name: name.charAt(0).toUpperCase() + name.slice(1), products: [] };
      if (!entry.products.includes(product)) entry.products.push(product);
      found.set(key, entry);
    }
  }
  return [...found.values()].sort((a, b) => b.products.length - a.products.length || a.name.localeCompare(b.name));
}
