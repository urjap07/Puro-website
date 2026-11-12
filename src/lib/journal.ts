/**
 * Journal teasers for the homepage. Full articles (and a CMS table) arrive in
 * the Journal phase; until then these preview the first pieces and point to
 * the related product. Copy is drawn only from existing, brand-approved text.
 */
export interface JournalTeaser {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  readTime: string;
  image: string;
  imageAlt: string;
  product?: { slug: string; label: string };
}

export const JOURNAL: JournalTeaser[] = [
  {
    slug: "pithi-and-ubtan",
    category: "Rituals",
    title: "Pithi and Ubtan: two rituals, reborn",
    excerpt:
      "The golden turmeric ritual before an Indian wedding, and the clay-and-botanical paste our grandmothers trusted — and how we bring both into a modern tube.",
    readTime: "5 min read",
    image: "/media/products/glow-up-pithi-pack/04.jpg",
    imageAlt: "Glow Up Pithi Pack with turmeric, saffron and clay",
    product: { slug: "glow-up-pithi-pack", label: "Shop the Pithi Pack" },
  },
  {
    slug: "a-weekend-ritual",
    category: "Routines",
    title: "A weekend ritual in three unhurried steps",
    excerpt:
      "Detoxify on Friday, polish on Saturday, soothe on Sunday. Twenty minutes that turn an ordinary weekend into a moment that is entirely yours.",
    readTime: "4 min read",
    image: "/media/products/scrubulush-exfoliator/04.jpg",
    imageAlt: "Scrubulush Exfoliator with rice, walnut and turmeric",
    product: { slug: "scrubulush-exfoliator", label: "Shop Scrubulush" },
  },
  {
    slug: "oils-for-the-scalp",
    category: "Ingredients",
    title: "Lavender, rosemary and the art of the scalp oil",
    excerpt:
      "An aromatic pairing in a lightweight botanical oil — why we chose it, and how to make a slow scalp massage part of your week.",
    readTime: "6 min read",
    image: "/media/products/terra-tress-hair-scalp-oil/05.jpg",
    imageAlt: "Botanical oil dripping from a dropper beside lavender",
    product: { slug: "terra-tress-hair-scalp-oil", label: "Shop Terra Tress" },
  },
];
