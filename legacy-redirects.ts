/**
 * Permanent redirects from the old Wix site (purobodysoul.com), so links from
 * Google, Instagram posts and bookmarks land on the matching new page.
 * Taken from the live site's sitemap.
 */

/** Old Wix product slug → new product slug. */
const PRODUCTS: Record<string, string> = {
  "sheavibe-body-lotion": "sheavibe-lotion",
  "aloevibe-shower-gel": "aloe-vibe-shower-gel",
  "terra-tress-hair-scalp-oil": "terra-tress-hair-scalp-oil",
  "coco-silk": "coco-silk-cold-pressed-virgin-coconut-oil",
  "foaming-face-wash": "hydroclock-foaming-facewash",
  "good-cleanse-facewash": "good-cleanse-face-wash",
  "night-gel-lotion": "aqua-riche-night-repair-gel-cream",
  "revitalizing-rose-vanilla-scrub": "scrubulush-exfoliator",
  "glow-up-pithi-pack": "glow-up-pithi-pack",
  "clarifying-citrus-ubtan-pack": "vita-clay-ubtan-pack",
  "hydro-soothing-gel": "aquench-soothing-hydrogel",
  "healing-body-balm": "supple-goals-body-balm",
  "whitening-saffron-sandalwood-handmade-soap": "good-cleanse-bathing-bar",
  "wild-rose-soap": "wild-rose-bathing-bar",
  "hair-regrowth-oil": "hair-regrowth-oil",
  "gift-hamper-foot-spa-essential-kit": "sole-rejuvenation-kit-foot-spa-kit",
  "luxurious-complete-care-package": "travel-basics-kit",
  "the-gift-of-self-love-luxurious-care-package": "pamper-yourself-kit-facial-kit",
  "luxurious-complete-care-package-travel-size": "luxurious-care-package-travel-size",
};

/** Old Wix page → new page. */
const PAGES: Record<string, string> = {
  "/home": "/",
  "/shop-all-products": "/shop",
  "/product-1": "/shop",
  "/gifting": "/collections/gifting",
  // Face
  "/all-face-products": "/collections/face",
  "/cleanser": "/collections/face",
  "/moisturizer": "/collections/face",
  "/facial-pack": "/collections/face",
  "/facial-scrub": "/collections/face",
  // Body
  "/all-body-products": "/collections/body",
  "/copy-of-body-soaps": "/collections/body",
  "/copy-of-all-body-products": "/collections/body",
  "/copy-of-all-body-products-1": "/collections/body",
  "/copy-of-body-healers": "/collections/body",
  // Hair
  "/all-hair-products": "/collections/hair",
  "/all-hair-products-old": "/collections/hair",
  "/copy-of-hair-masque": "/collections/hair",
  "/copy-of-hair-oils": "/collections/hair",
  "/copy-of-all-hair-products": "/collections/hair",
  "/puro-classic": "/classics",
  // Concerns
  "/tan-removal": "/concerns/tan-removal",
  "/skin-brightening": "/concerns/skin-brightening",
  "/pore-tightening": "/concerns/pore-tightening",
  "/oil-control": "/concerns/oil-control",
  "/dry-skin": "/concerns/dry-skin",
  "/combination-skin": "/concerns/combination-skin",
  "/anti-aging": "/concerns/anti-ageing",
  "/nighttime-routine": "/concerns/night-time-routine",
  // About and help
  "/our-brand": "/our-story",
  "/frequently-asked-questions": "/faq",
  "/copy-of-terms-and-conditions": "/policies/terms",
  "/copy-of-terms-and-conditions-1": "/policies/returns",
  "/copy-of-testimonials": "/",
  "/members": "/account",
  // Wix booking placeholders
  "/book-online": "/spa",
};

export function legacyRedirects() {
  const products = Object.entries(PRODUCTS).flatMap(([old, slug]) => [
    { source: `/product-page/${old}`, destination: `/products/${slug}`, permanent: true },
    { source: `/products-1/${old}`, destination: `/products/${slug}`, permanent: true },
    // The old site also used /products/<slug>; skip the ones whose slug didn't change.
    ...(old === slug ? [] : [{ source: `/products/${old}`, destination: `/products/${slug}`, permanent: true }]),
  ]);
  const pages = Object.entries(PAGES).map(([source, destination]) => ({ source, destination, permanent: true }));
  // Anything else under the old product and booking addresses goes to the shop.
  const fallbacks = [
    { source: "/product-page/:slug*", destination: "/shop", permanent: true },
    { source: "/products-1/:slug*", destination: "/shop", permanent: true },
    { source: "/service-page/:slug*", destination: "/spa", permanent: true },
  ];
  return [...products, ...pages, ...fallbacks];
}
