import type { Product } from "@/db/queries/products";
import { COLLECTIONS } from "@/lib/collections";
import { type Cadence, type RitualStepKey, cadence, ritualStep } from "@/lib/catalogue";

/**
 * The skincare finder's matching rules, in one place so the team can tune
 * them without touching the page. Products are matched on tags that come
 * from the database: collection, product type, concerns and how often a
 * product is used. The finder suggests products to explore; it doesn't
 * diagnose or treat anything.
 */

export type FinderArea = "face" | "body" | "hair" | "gift";
export type FinderRoutine = "everyday" | "weekly" | "ritual";

export interface FinderAnswers {
  area: FinderArea | null;
  /** A product type (sub-category) or null for "any". */
  type: string | null;
  concerns: string[];
  routine: FinderRoutine | null;
}

/** Question 1: each answer maps to one or more collections. */
export const AREAS: { key: FinderArea; label: string; note: string; collections: string[]; concernType: "skin" | "hair" | null }[] = [
  { key: "face", label: "Care for my face", note: "Cleansers, packs and gels", collections: ["face"], concernType: "skin" },
  { key: "body", label: "Care for my body", note: "Scrubs, butters and washes", collections: ["body"], concernType: "skin" },
  { key: "hair", label: "Care for my hair & scalp", note: "Botanical oils", collections: ["hair"], concernType: "hair" },
  { key: "gift", label: "A gift for someone", note: "Keepsake sets", collections: ["gifting"], concernType: null },
];

/** Question 4. */
export const ROUTINES: { key: FinderRoutine; label: string; note: string; cadence: Cadence | null }[] = [
  { key: "everyday", label: "Quick, everyday essentials", note: "A few minutes, morning or night", cadence: "daily" },
  { key: "weekly", label: "A weekly treat", note: "Masks and polishes, once or twice a week", cadence: "weekly" },
  { key: "ritual", label: "A complete ritual", note: "One formula for each step", cadence: null },
];

/** How much each matching tag counts. */
export const WEIGHTS = {
  concern: 3,
  type: 2,
  cadence: 1.5,
  /** Small nudge towards well-reviewed formulas (per rating point above 4). */
  rating: 0.5,
};

/** Order of steps when building a complete ritual, per area. */
export const RITUAL_STEPS: Record<FinderArea, RitualStepKey[]> = {
  face: ["cleanse", "treat", "moisturise"],
  body: ["cleanse", "exfoliate", "moisturise"],
  hair: ["nourish"],
  gift: ["gift"],
};

export interface Match {
  product: Product;
  score: number;
  /** Plain reasons shown to the shopper: "Made for Dry Skin", "A face wash", "Used daily". */
  reasons: string[];
}

export function inArea(product: Product, area: FinderArea | null) {
  if (!area) return true;
  const slugs = AREAS.find((item) => item.key === area)!.collections.flatMap(
    (key) => COLLECTIONS.find((collection) => collection.slug === key)?.categorySlugs ?? [],
  );
  return product.categories.some((category) => slugs.includes(category.slug));
}

/** Score every in-area, in-stock product against the answers, best first. */
export function rankProducts(products: Product[], answers: FinderAnswers, concernNames: Record<string, string>): Match[] {
  const routine = ROUTINES.find((item) => item.key === answers.routine);
  return products
    .filter((product) => inArea(product, answers.area) && (product.variants[0]?.stockQuantity ?? 0) > 0)
    .map((product) => {
      const reasons: string[] = [];
      let score = 0;
      const shared = product.concerns.filter((concern) => answers.concerns.includes(concern.slug));
      if (shared.length) {
        score += WEIGHTS.concern * shared.length;
        reasons.push(`Made for ${shared.map((concern) => concernNames[concern.slug] ?? concern.name).join(" & ")}`);
      }
      if (answers.type && product.subCategory === answers.type) {
        score += WEIGHTS.type;
        reasons.push(`A ${product.subCategory.toLowerCase()}`);
      }
      const productCadence = cadence(product);
      if (routine?.cadence && productCadence === routine.cadence) {
        score += WEIGHTS.cadence;
        reasons.push(productCadence === "daily" ? "Made for everyday use" : "A weekly treat");
      }
      if (product.rating) score += WEIGHTS.rating * Math.max(0, product.rating.value - 4);
      return { product, score, reasons };
    })
    .sort((a, b) => b.score - a.score || (b.product.rating?.count ?? 0) - (a.product.rating?.count ?? 0));
}

/** A complete ritual: the best-matching product for each step, in order. */
export function buildRitual(ranked: Match[], area: FinderArea) {
  return RITUAL_STEPS[area]
    .map((step) => ({ step, match: ranked.find((match) => ritualStep(match.product).key === step) }))
    .filter((entry): entry is { step: RitualStepKey; match: Match } => Boolean(entry.match));
}
