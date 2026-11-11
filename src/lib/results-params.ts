import type { ResultFilters, SortKey } from "@/components/commerce/ShopResults";

const SORTS: SortKey[] = ["featured", "bestsellers", "rating", "price-asc", "price-desc", "newest"];

export type RawParams = Record<string, string | string[] | undefined>;

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";

/** Reads results filters from the URL query. */
export function parseFilters(params: RawParams, overrides: Partial<ResultFilters> = {}): ResultFilters {
  const sort = one(params.sort) as SortKey;
  const rating = Number(one(params.rating));
  return {
    q: one(params.q).slice(0, 80),
    collection: one(params.in) || null,
    concerns: one(params.concern).split(",").filter(Boolean),
    price: /^\d*-\d*$/.test(one(params.price)) ? one(params.price) : null,
    rating: rating >= 1 && rating <= 5 ? rating : null,
    inStock: one(params.stock) === "1",
    sort: SORTS.includes(sort) ? sort : "featured",
    ...overrides,
  };
}
