import { COLLECTIONS } from "@/lib/collections";

/**
 * Colour coding for glass surfaces. Full class names are spelled out so
 * Tailwind can see them. `text` is a deeper shade of each tint that keeps
 * small type at WCAG AA on tinted glass.
 *   Face = quartz · Body = saffron · Hair = lilac · Gifts = champagne · Wellness = sage
 *   hydration / aloe = aqua · clays & ubtan = terracotta
 */
export type Tint = "quartz" | "apricot" | "saffron" | "lilac" | "sage" | "aqua" | "terracotta" | "champagne";

export const TINT: Record<Tint, { glass: string; text: string; soft: string; dot: string }> = {
  quartz: { glass: "tint-quartz", text: "text-[#8E4F5B]", soft: "bg-quartz-soft", dot: "bg-quartz" },
  apricot: { glass: "tint-apricot", text: "text-[#93552B]", soft: "bg-apricot-soft", dot: "bg-apricot" },
  saffron: { glass: "tint-saffron", text: "text-[#7A500C]", soft: "bg-saffron-soft", dot: "bg-saffron" },
  lilac: { glass: "tint-lilac", text: "text-[#5E4B8A]", soft: "bg-lilac-soft", dot: "bg-lilac" },
  sage: { glass: "tint-sage", text: "text-[#45633D]", soft: "bg-sage-soft", dot: "bg-sage" },
  aqua: { glass: "tint-aqua", text: "text-[#2C6468]", soft: "bg-aqua-soft", dot: "bg-aqua" },
  terracotta: { glass: "tint-terracotta", text: "text-[#7C4024]", soft: "bg-terracotta-soft", dot: "bg-terracotta" },
  champagne: { glass: "tint-champagne", text: "text-[#66532F]", soft: "bg-champagne-soft", dot: "bg-champagne" },
};

const COLLECTION_TINT: Record<string, Tint> = {
  face: "quartz",
  body: "saffron",
  hair: "lilac",
  gifting: "champagne",
  wellness: "sage",
};

export function collectionTint(slug: string | null | undefined): Tint {
  return (slug && COLLECTION_TINT[slug]) || "apricot";
}

/** Tint for a product: by signature ingredient first, then by its collection. */
export function productTint(product: { slug: string; categories: { slug: string }[] }): Tint {
  if (/clay|ubtan|pithi/.test(product.slug)) return "terracotta";
  if (/aqua|hydro|aloe/.test(product.slug)) return "aqua";
  const collection = COLLECTIONS.find((item) => item.categorySlugs.includes(product.categories[0]?.slug ?? ""));
  return collectionTint(collection?.slug);
}

/** Tint for a concern: hydration and soothing read aqua, hair lilac, other skin concerns quartz. */
export function concernTint(concern: { slug: string; type: string }): Tint {
  if (concern.type === "hair") return "lilac";
  if (/dry|hydrat|sensitiv|sooth/.test(concern.slug)) return "aqua";
  if (/oil|pore|acne/.test(concern.slug)) return "sage";
  if (/tan|bright|glow|pigment/.test(concern.slug)) return "apricot";
  return "quartz";
}

/** Tint for a library ingredient, matching the homepage ingredient explorer. */
export function ingredientTint(slug: string): Tint {
  if (slug.includes("turmeric")) return "saffron";
  if (slug.includes("aloe")) return "sage";
  if (slug.includes("clay")) return "terracotta";
  if (slug.includes("shea") || slug.includes("cocoa")) return "apricot";
  if (slug.includes("lavender") || slug.includes("rosemary")) return "lilac";
  return "champagne";
}
