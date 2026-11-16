import type { Product } from "@/db/queries/products";
import type { SortKey } from "@/components/commerce/ShopResults";
import type { Tint } from "@/components/commerce/tints";

/**
 * The shop's curated edits: Bestsellers, New Arrivals and PURO Classics.
 * Each is defined by flags in the database, never by guesswork:
 *  - Bestsellers: products marked featured (is_featured), most-reviewed first.
 *  - New Arrivals: products whose launch date (launched_at) falls in the last
 *    NEW_ARRIVAL_DAYS days. Set it with `npm run db:launch -- <slug> [date]`.
 *  - Classics: products marked as PURO classics (is_classic).
 */

/** How long a product counts as a new arrival after its launch date. */
export const NEW_ARRIVAL_DAYS = 90;

export type EditKey = "bestsellers" | "new-arrivals" | "classics";

export interface Edit {
  key: EditKey;
  /** Page path. */
  href: string;
  /** Menu label. */
  label: string;
  eyebrow: string;
  title: string;
  /** Word of the title set in italic gradient. */
  emphasis: string;
  description: string;
  tint: Tint;
  sort: SortKey;
}

export const EDITS: Record<EditKey, Edit> = {
  bestsellers: {
    key: "bestsellers",
    href: "/bestsellers",
    label: "Bestsellers",
    eyebrow: "The most-loved rituals",
    title: "Our bestsellers",
    emphasis: "bestsellers",
    description: "The formulas our customers return to again and again — and the ones with the most reviews to prove it.",
    tint: "saffron",
    sort: "bestsellers",
  },
  "new-arrivals": {
    key: "new-arrivals",
    href: "/new-arrivals",
    label: "New arrivals",
    eyebrow: "Just launched",
    title: "New arrivals",
    emphasis: "arrivals",
    description: "The newest PURO formulas, freshly out of the atelier.",
    tint: "aqua",
    sort: "newest",
  },
  classics: {
    key: "classics",
    href: "/classics",
    label: "PURO Classics",
    eyebrow: "Timeless favourites",
    title: "PURO Classics",
    emphasis: "Classics",
    description: "Time-honoured rituals that have stayed in our collection from the very beginning.",
    tint: "terracotta",
    sort: "featured",
  },
};

const DAY = 24 * 60 * 60 * 1000;

/** True when a product launched within the last NEW_ARRIVAL_DAYS days (and not in the future). */
export function isNewArrival(product: Pick<Product, "launchedAt">, now = Date.now()) {
  if (!product.launchedAt) return false;
  const launched = Date.parse(`${product.launchedAt}T00:00:00+05:30`);
  return Number.isFinite(launched) && launched <= now && now - launched < NEW_ARRIVAL_DAYS * DAY;
}

/** The products in an edit, in the edit's own order. */
export function productsInEdit(products: Product[], key: EditKey): Product[] {
  if (key === "bestsellers") {
    return products
      .filter((product) => product.isFeatured)
      .sort((a, b) => (b.rating?.count ?? 0) - (a.rating?.count ?? 0) || (b.rating?.value ?? 0) - (a.rating?.value ?? 0));
  }
  if (key === "new-arrivals") {
    return products.filter((product) => isNewArrival(product)).sort((a, b) => (b.launchedAt ?? "").localeCompare(a.launchedAt ?? ""));
  }
  return products.filter((product) => product.isClassic);
}

/**
 * The edits to show in menus: Bestsellers, then New Arrivals while anything
 * is new — otherwise PURO Classics takes its place.
 */
export function menuEdits(hasNewArrivals: boolean): Edit[] {
  return [EDITS.bestsellers, hasNewArrivals ? EDITS["new-arrivals"] : EDITS.classics];
}
