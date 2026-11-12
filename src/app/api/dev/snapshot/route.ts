import { NextResponse } from "next/server";
import { getActiveProducts, getAllReviews, getConcerns, getIngredients } from "@/db/queries/products";
import { hasDatabase } from "@/lib/data-source";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Development only: the catalogue exactly as the site sees it, for
 * `npm run db:snapshot` to save as src/data/catalogue-snapshot.json.
 * Answers 404 in production.
 */
export async function GET() {
  if (process.env.NODE_ENV === "production" || !hasDatabase()) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
  const [products, concerns, ingredients, reviews] = await Promise.all([
    getActiveProducts(),
    getConcerns(),
    getIngredients(),
    getAllReviews(),
  ]);
  return NextResponse.json({ generatedAt: new Date().toISOString(), products, concerns, ingredients, reviews });
}
