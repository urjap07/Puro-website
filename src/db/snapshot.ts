import data from "@/data/catalogue-snapshot.json";
import type { Concern, Ingredient, Product, Review } from "@/db/queries/products";

/**
 * The bundled, read-only catalogue (see scripts/export-snapshot.mjs). Used
 * only when no database is configured.
 */
export interface CatalogueSnapshot {
  generatedAt: string;
  products: Product[];
  concerns: Concern[];
  ingredients: Ingredient[];
  reviews: Review[];
}

export const SNAPSHOT = data as unknown as CatalogueSnapshot;
