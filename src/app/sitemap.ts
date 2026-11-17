import type { MetadataRoute } from "next";
import { getActiveProducts, getConcerns, getIngredients } from "@/db/queries/products";
import { productsInEdit } from "@/lib/edits";
import { COLLECTIONS } from "@/lib/collections";
import { SITE } from "@/lib/site";

/** Rebuilt at most hourly, so new products appear without a deploy. */
export const revalidate = 3600;

/** sitemap.xml: every page worth indexing, straight from the catalogue. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, concerns, ingredients] = await Promise.all([getActiveProducts(), getConcerns(), getIngredients()]);
  const url = (path: string) => `${SITE.url}${path}`;

  return [
    { url: url("/"), changeFrequency: "weekly", priority: 1 },
    { url: url("/shop"), changeFrequency: "weekly", priority: 0.9 },
    { url: url("/our-story"), changeFrequency: "monthly", priority: 0.6 },
    { url: url("/contact"), changeFrequency: "yearly", priority: 0.5 },
    { url: url("/faq"), changeFrequency: "monthly", priority: 0.5 },
    { url: url("/ingredients"), changeFrequency: "monthly", priority: 0.7 },
    { url: url("/bestsellers"), changeFrequency: "weekly", priority: 0.8 },
    { url: url("/classics"), changeFrequency: "monthly", priority: 0.7 },
    ...(productsInEdit(products, "new-arrivals").length ? [{ url: url("/new-arrivals"), changeFrequency: "weekly" as const, priority: 0.8 }] : []),
    { url: url("/concerns"), changeFrequency: "monthly", priority: 0.7 },
    { url: url("/finder"), changeFrequency: "monthly", priority: 0.6 },
    ...ingredients.map((ingredient) => ({ url: url(`/ingredients/${ingredient.slug}`), changeFrequency: "monthly" as const, priority: 0.6 })),
    ...COLLECTIONS.map((collection) => ({ url: url(`/collections/${collection.slug}`), changeFrequency: "weekly" as const, priority: 0.8 })),
    ...products.map((product) => ({
      url: url(`/products/${product.slug}`),
      lastModified: product.createdAt ? new Date(product.createdAt) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      images: product.images.slice(0, 3).map((image) => url(image.imageUrl)),
    })),
    ...concerns.map((concern) => ({ url: url(`/concerns/${concern.slug}`), changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
