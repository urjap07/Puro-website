/**
 * Brand copy carried over from purobodysoul.com, so the new site says what
 * the live site says. Keyed by our page slugs.
 */

export interface PageCopy {
  /** Short line above the title, e.g. "Achieve smoother, tighter skin". */
  tagline: string;
  /** Introductory paragraph. */
  intro: string;
  /** How often to follow the routine, e.g. "2x / week". */
  frequency?: string;
}

/** Concern pages (/concerns/[slug]). */
export const CONCERN_COPY: Record<string, PageCopy> = {
  "skin-brightening": {
    tagline: "Brighten it, flaunt it, naturally",
    intro:
      "Puro Body & Soul offers a curated selection of products dedicated to skin brightening, designed to unveil your skin's natural luminosity. Our formulations harness potent ingredients to effectively reduce dark spots, even out skin tone, and promote a radiant complexion. With consistent use, our skin-brightening products help you achieve a glowing, youthful look you'll love.",
  },
  "tan-removal": {
    tagline: "Reveal your true radiance",
    intro:
      "Puro Body & Soul offers a range of specialised products for effective tan removal, designed to restore your natural skin tone and radiance. Our formulations include powerful ingredients that exfoliate, brighten and nourish the skin, effectively reducing sun-induced pigmentation. With regular use, you'll notice a more even and radiant complexion, letting your true skin shine through.",
    frequency: "2x / week",
  },
  "pore-tightening": {
    tagline: "Achieve smoother, tighter skin",
    intro:
      "Pore tightening encompasses skincare techniques and treatments designed to minimise the appearance of enlarged pores. Puro Body & Soul offers products specifically formulated to reduce pore visibility and enhance skin smoothness. Consistent use, along with proper sun protection, is essential for maintaining the appearance of tighter pores.",
    frequency: "Once a week",
  },
  "anti-ageing": {
    tagline: "Rejuvenate and revitalise your skin",
    intro:
      "Puro Body & Soul offers a comprehensive range of products tailored to combat signs of ageing, delivering targeted solutions for a youthful appearance. Our formulations are enriched with potent antioxidants and hydrating ingredients to soften the look of wrinkles and restore radiance. With regular use, our anti-ageing products help reveal smoother, more resilient skin.",
  },
  "oil-control": {
    tagline: "Stay shine-free",
    intro:
      "Puro Body & Soul presents a specialised line of products to effectively manage skin oiliness, promoting a balanced and matte complexion. Our formulations feature gentle yet potent ingredients like witch hazel to regulate sebum production and minimise the appearance of pores. With consistent use, our oil control products help you achieve a refreshed, shine-free look without stripping the skin of its natural moisture.",
  },
  "dry-skin": {
    tagline: "Deep hydration for dry skin",
    intro:
      "Puro Body & Soul offers a nurturing range of products crafted to address skin dryness, harnessing the power of natural ingredients for deep hydration and nourishment. Our formulations feature botanical extracts, essential oils and plant-based moisturisers to replenish the skin's moisture barrier and alleviate dryness. With regular use, our products help restore suppleness, leaving your skin feeling comfortably hydrated and rejuvenated.",
  },
  "combination-skin": {
    tagline: "Balance your skin",
    intro:
      "Puro Body & Soul caters to the needs of combination skin with a specialised line of products designed to balance and harmonise diverse skin types. Our formulations blend lightweight hydrators with gentle exfoliants and natural extracts to address both oily and dry areas effectively. With our tailored approach, you can achieve a harmonious complexion that feels nourished, refreshed and free from imbalance.",
  },
  "night-time-routine": {
    tagline: "Repair and renew while you sleep",
    intro:
      "A night-time skincare routine is crucial because it allows the skin to repair and regenerate while you sleep, combating daily environmental stressors and enhancing overall skin health. Puro Body & Soul has curated exclusive products designed to maximise this nightly renewal, so your skin looks refreshed and rejuvenated each morning. Consistent use can lead to visibly improved skin texture and tone.",
    frequency: "Nightly",
  },
};

/** Collection pages (/collections/[slug]) and the Classics edit. */
export const COLLECTION_COPY: Record<string, PageCopy> = {
  face: {
    tagline: "Unveil your natural beauty",
    intro:
      "Puro Body & Soul presents a comprehensive face care range, meticulously crafted to cater to diverse skin types and concerns. From gentle cleansers to luxurious moisturisers and targeted treatments, each product is formulated with premium ingredients to nourish, rejuvenate and protect the delicate facial skin — a revitalising routine for a radiant, healthy complexion.",
  },
  body: {
    tagline: "Nurture your body — luxurious care, lasting comfort",
    intro:
      "Puro Body & Soul offers a luxurious body care range, designed to pamper and rejuvenate your skin from head to toe. Our collection includes rich body lotions, exfoliating scrubs and nourishing body oils, all formulated with premium natural ingredients to provide deep hydration and promote a healthy glow.",
  },
  classics: {
    tagline: "Pure. Classic. Traditional.",
    intro:
      "Discover the classic products you've trusted and loved over the years, all available right here. Our timeless favourites continue to deliver the exceptional quality and results you've come to expect — the perfect blend of tradition and innovation.",
  },
};
