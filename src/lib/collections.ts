import type { Product } from "@/db/queries/products";

export interface Collection {
  slug: string;
  name: string;
  title: string;
  description: string;
  image: string;
  /** Database category slugs that belong to this collection. */
  categorySlugs: string[];
}

export const COLLECTIONS: Collection[] = [
  {
    slug: "face",
    name: "Face",
    title: "Face Care",
    description:
      "Cleansers, age-old packs and nourishing gels — a complete ritual for clear, luminous skin.",
    image: "/media/products/vita-clay-ubtan-pack/03.jpg",
    categorySlugs: [
      "face-wash",
      "face-body-pack",
      "moisturiser-gel",
      "night-cream-gel-cream",
    ],
  },
  {
    slug: "body",
    name: "Body",
    title: "Body Care",
    description:
      "Polish, cleanse and nourish — indulgent textures that leave skin soft from head to toe.",
    image: "/media/products/sheavibe-lotion/03.jpg",
    categorySlugs: [
      "body-scrub-exfoliator",
      "body-balm",
      "body-lotion",
      "shower-gel-body-wash",
      "bathing-bar-soap",
    ],
  },
  {
    slug: "hair",
    name: "Hair",
    title: "Hair & Scalp",
    description:
      "Lightweight botanical oils that revitalise the scalp and restore natural shine.",
    image: "/media/products/terra-tress-hair-scalp-oil/02.jpg",
    categorySlugs: ["hair-scalp-oil"],
  },
  {
    slug: "gifting",
    name: "Gifting",
    title: "The Gift Edit",
    description:
      "Keepsake boxes inspired by palace gardens, filled with Puro rituals for every celebration.",
    image: "/media/products/hydro-glow-essentials/02.jpg",
    categorySlugs: ["gift-sets"],
  },
  {
    slug: "wellness",
    name: "Wellness",
    title: "Wellness",
    description:
      "Aromatherapy blends that bring calm and freshness into every space.",
    image: "/media/brand/02.jpg",
    categorySlugs: ["wellness"],
  },
];

export function getCollection(slug: string) {
  return COLLECTIONS.find((collection) => collection.slug === slug);
}

export function getProductCollection(product: Product) {
  const categorySlug = product.categories[0]?.slug;
  return COLLECTIONS.find((collection) =>
    collection.categorySlugs.includes(categorySlug)
  );
}

export function productsInCollection(products: Product[], collection: Collection) {
  return products.filter((product) =>
    product.categories.some((category) =>
      collection.categorySlugs.includes(category.slug)
    )
  );
}
