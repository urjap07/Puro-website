import type { Product } from "@/db/queries/products";

function haystack(product: Product) {
  return [
    product.name,
    product.headline,
    product.tagline,
    product.summary,
    product.description,
    product.subCategory,
    product.keyIngredients,
    product.ingredients,
    ...product.benefits,
    ...product.categories.map((category) => category.name),
    ...product.concerns.map((concern) => concern.name),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

/**
 * Products matching every word of the query, anywhere in their name,
 * description, ingredients, benefits, categories or concerns. Products whose
 * name matches come first.
 */
export function searchProducts(products: Product[], query: string) {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return products;
  const nameScore = (product: Product) => words.filter((word) => product.name.toLowerCase().includes(word)).length;
  return products
    .filter((product) => {
      const text = haystack(product);
      return words.every((word) => text.includes(word));
    })
    .sort((a, b) => nameScore(b) - nameScore(a));
}
