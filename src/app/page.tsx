import Image from "next/image";
import Link from "next/link";
import { ArrowRight, HeartHandshake, Leaf, Rabbit } from "lucide-react";
import {
  getActiveProducts,
  getConcerns,
  getFeaturedReviews,
  getIngredients,
  type Product,
} from "@/db/queries/products";
import { COLLECTIONS } from "@/lib/collections";
import { formatPrice } from "@/lib/format";
import HeroCarousel, { type HeroSlide } from "@/components/commerce/HeroCarousel";
import CategoryCards, { type CategoryCard } from "@/components/commerce/CategoryCards";
import ProductRow, { RecentlyViewedRow } from "@/components/commerce/ProductRow";
import ApothecaryCounter from "@/components/commerce/ApothecaryCounter";
import ShelfRow from "@/components/store/ShelfRow";
import PendantLamp from "@/components/store/PendantLamp";
import { cutoutFor } from "@/lib/cutouts";
import Module from "@/components/commerce/Module";
import PromiseStrip from "@/components/commerce/PromiseStrip";
import Testimonials from "@/components/home/Testimonials";
import RitualScene, { type RitualSceneStep } from "@/components/home/RitualScene";
import ScrollWords from "@/components/motion/ScrollWords";
import ImageReveal from "@/components/motion/ImageReveal";
import Parallax from "@/components/motion/Parallax";
import Counter from "@/components/motion/Counter";
import RotatingSeal from "@/components/ui/RotatingSeal";
import ConcernFinder, { type FinderProduct } from "@/components/home/ConcernFinder";
import IngredientCards from "@/components/home/IngredientCards";
import CollectionShowcase, { type ShowcaseCollection } from "@/components/home/CollectionShowcase";
import SignatureStage from "@/components/home/SignatureStage";
import WeekendStack, { type WeekendRitual } from "@/components/home/WeekendStack";
import GiftFan, { type GiftSet } from "@/components/home/GiftFan";
import KnowledgeTabs, { type KnowledgeItem } from "@/components/home/KnowledgeTabs";
import ExpandingFilm from "@/components/home/ExpandingFilm";

export const dynamic = "force-dynamic";

const PHILOSOPHY =
  "Botanical care made the slow way — the turmeric, saffron and clay our grandmothers trusted, refined for modern skin and made to give back.";

const SLIDES: HeroSlide[] = [
  {
    eyebrow: "Puro Body & Soul · Ethical inside out",
    title: "Rituals rooted in nature, made for the modern you.",
    accent: "nature,",
    text: "Botanical skin, body and hair care with turmeric, saffron and aloe — delivered in 4–7 days, free over ₹500.",
    cta: { label: "Shop all rituals", href: "/shop" },
    image: "/media/video/hero-wide-poster.jpg",
    video: "/media/video/hero-wide.mp4",
  },
  {
    eyebrow: "Bestseller · Glow Up Pithi Pack",
    title: "The bridal glow, in a tube.",
    accent: "bridal glow,",
    text: "Turmeric, saffron and rice bran oil — the age-old Pithi ritual, ready in twenty unhurried minutes.",
    cta: { label: "Shop the Pithi Pack", href: "/products/glow-up-pithi-pack" },
    image: "/media/products/glow-up-pithi-pack/04.jpg",
    position: "50% 40%",
  },
  {
    eyebrow: "The Gift Edit",
    title: "Gifts they will treasure.",
    accent: "treasure.",
    text: "Keepsake boxes inspired by palace gardens and the grace of the peacock — for weddings, festivals and every celebration.",
    cta: { label: "Explore gift sets", href: "/collections/gifting" },
    image: "/media/products/radiant-glow-luxurious-kit/02.jpg",
  },
  {
    eyebrow: "The heart of Puro",
    title: "Every purchase empowers a woman.",
    accent: "empowers",
    text: "Puro is a division of Shramik Naari Sangh. Your ritual helps a rural woman live a life of dignity.",
    cta: { label: "Read our story", href: "/our-story" },
    image: "/media/products/good-cleanse-face-wash/04.jpg",
    position: "50% 60%",
  },
];

const WEEKEND_EDIT = [
  {
    slug: "vita-clay-ubtan-pack",
    verb: "Detoxify",
    day: "Friday evening",
    minutes: "15 min",
    steps: ["Smooth a thick layer over clean skin.", "Rest while the clays draw out the week.", "Rinse with warm water and pat dry."],
    image: "/media/products/vita-clay-ubtan-pack/04.jpg",
    ground: "radial-gradient(80% 90% at 100% 0%, #8a4a33 0%, transparent 60%), linear-gradient(150deg, #5e2f22 0%, #3b1d16 100%)",
  },
  {
    slug: "scrubulush-exfoliator",
    verb: "Polish",
    day: "Saturday morning",
    minutes: "10 min",
    steps: ["Massage over damp skin in slow circles.", "Let rice and walnut lift dull, tired cells.", "Rinse to reveal soft, polished skin."],
    image: "/media/products/scrubulush-exfoliator/04.jpg",
    ground: "radial-gradient(80% 90% at 100% 0%, #8e2f5b 0%, transparent 60%), linear-gradient(150deg, #5b1d3b 0%, #33101f 100%)",
  },
  {
    slug: "aquench-soothing-hydrogel",
    verb: "Soothe",
    day: "Sunday night",
    minutes: "5 min",
    steps: ["Warm a little gel between your palms.", "Press gently over face and neck.", "Let aloe cool and calm overnight."],
    image: "/media/products/aquench-soothing-hydrogel/03.jpg",
    ground: "radial-gradient(80% 90% at 100% 0%, #2f7a70 0%, transparent 60%), linear-gradient(150deg, #1d4d47 0%, #0f2b27 100%)",
  },
];

const RITUAL = [
  {
    step: "Cleanse",
    slug: "good-cleanse-face-wash",
    mood: "/media/products/good-cleanse-face-wash/04.jpg",
    note: "Two pumps, a gentle lather, sixty seconds of slow circular massage — then rinse with cool water.",
    when: "Morning & night",
    duration: "1 minute",
  },
  {
    step: "Exfoliate",
    slug: "scrubulush-exfoliator",
    mood: "/media/products/scrubulush-exfoliator/04.jpg",
    note: "On damp skin, let rice and walnut lift away dull, tired cells in gentle upward strokes.",
    when: "Twice a week",
    duration: "2 minutes",
  },
  {
    step: "Mask",
    slug: "glow-up-pithi-pack",
    mood: "/media/products/glow-up-pithi-pack/04.jpg",
    note: "A thick layer of turmeric and saffron, twenty unhurried minutes, then rinse to reveal the glow.",
    when: "Once a week",
    duration: "20 minutes",
  },
  {
    step: "Hydrate",
    slug: "aquench-soothing-hydrogel",
    mood: "/media/products/aquench-soothing-hydrogel/03.jpg",
    note: "Press a cool veil of aloe over face and neck until absorbed, to calm and replenish.",
    when: "Every day",
    duration: "1 minute",
  },
];

/** Education rows, in the spirit of "What is tallow? / Why choose ours?" */
const WHY_PURO: KnowledgeItem[] = [
  {
    title: "What are Pithi and Ubtan?",
    lead: "Two age-old Indian beauty rituals, reborn in a tube.",
    content:
      "Pithi is the golden turmeric ritual performed before an Indian wedding; Ubtan is the clay-and-botanical paste our grandmothers swore by. Our Glow Up Pithi Pack and Vita Clay Ubtan Pack bring both into a modern, ready-to-use tube — turmeric, saffron, rice bran oil, volcanic clays and citrus oils, blended for everyday radiance.",
    image: "/media/products/glow-up-pithi-pack/04.jpg",
    icon: "sprout",
    facts: ["Turmeric & saffron", "Volcanic clays", "Rice bran oil"],
    link: { label: "Meet the Glow Up Pithi Pack", href: "/products/glow-up-pithi-pack" },
  },
  {
    title: "Ethical, inside out",
    lead: "Clean beauty, without compromise.",
    content:
      "Puro was founded to raise awareness about clean beauty. Our products are natural, cruelty-free and non-toxic, free from harmful chemicals and toxins. We draw on the potent properties of botanical extracts and essential oils, and pair historical beauty knowledge with contemporary research.",
    image: "/media/brand/03.jpg",
    icon: "leaf",
    facts: ["Natural botanicals", "Cruelty-free", "Non-toxic"],
    link: { label: "Read our story", href: "/our-story" },
  },
  {
    title: "Every purchase supports a woman",
    lead: "Beauty that gives back.",
    content:
      "Puro Body & Soul is a division of Shramik Naari Sangh (Sa-Ni-Sa), a charitable organisation. For every product you buy, you help a rural woman to stand on her own feet and live a life of dignity.",
    image: "/media/products/travel-basics-kit/03.jpg",
    icon: "heart",
    facts: ["Shramik Naari Sangh", "Rural women", "A life of dignity"],
    link: { label: "Discover Sa-Ni-Sa", href: "/our-story" },
  },
  {
    title: "Kind to you, kind to the earth",
    lead: "Light on the planet, honest in every step.",
    content:
      "We strive to minimise our environmental footprint with recyclable packaging and sustainable practices — and we prioritise integrity and honesty, from how we source our ingredients to how our products are made.",
    image: "/media/products/aloe-vibe-shower-gel/02.jpg",
    icon: "recycle",
    facts: ["Recyclable packaging", "Sustainable practices", "Honest sourcing"],
    link: { label: "Shop the collection", href: "/shop" },
  },
  {
    title: "Certified, tested, trusted",
    lead: "Trust you can see on every pack.",
    content:
      "Every Puro product is certified Animal Cruelty-Free by PETA, dermatologically tested, non-toxic and crafted in a GMP-certified facility, so you can trust what goes on your skin.",
    image: "/media/brand/02.jpg",
    icon: "badge",
    facts: ["PETA cruelty-free", "Dermatologically tested", "GMP certified"],
    link: { label: "Shop with confidence", href: "/shop" },
  },
];

function bySlug(products: Product[], slug: string) {
  return products.find((product) => product.slug === slug);
}

export default async function Home() {
  const [products, concerns, ingredients, reviews] = await Promise.all([
    getActiveProducts(),
    getConcerns(),
    getIngredients(),
    getFeaturedReviews(8),
  ]);

  const signatures = products.filter((product) => product.isFeatured);
  const rated = products.filter((product) => product.rating);
  const totalReviews = rated.reduce(
    (sum, product) => sum + product.rating!.count,
    0,
  );
  const averageRating = totalReviews
    ? rated.reduce(
        (sum, product) => sum + product.rating!.value * product.rating!.count,
        0,
      ) / totalReviews
    : 5;

  // A lifestyle photograph (not the white packshot) for each reviewed product.
  const reviewImages = Object.fromEntries(
    products.map((product) => [
      product.slug,
      (product.images[2] ?? product.images[1] ?? product.images[0])?.imageUrl ??
        "/media/brand/02.jpg",
    ]),
  );

  const giftingSlugs = COLLECTIONS.find((collection) => collection.slug === "gifting")?.categorySlugs ?? [];

  const weekend: WeekendRitual[] = WEEKEND_EDIT.flatMap((item) => {
    const product = bySlug(products, item.slug);
    if (!product) return [];
    return [
      {
        ...item,
        name: product.name,
        headline: product.headline,
        price: product.variants[0] ? formatPrice(product.variants[0].price) : null,
      },
    ];
  });

  const giftFan: GiftSet[] = products
    .filter((product) => product.categories.some((category) => giftingSlugs.includes(category.slug)))
    .map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      headline: product.headline ?? product.summary,
      price: product.variants[0] ? formatPrice(product.variants[0].price) : null,
      image: product.images[0]?.imageUrl ?? null,
      contents: product.kitContents,
    }));

  const showcase: ShowcaseCollection[] = COLLECTIONS.filter((collection) => collection.slug !== "wellness").map(
    (collection) => {
      const inCollection = products.filter((product) =>
        product.categories.some((category) => collection.categorySlugs.includes(category.slug)),
      );
      const ranked = [...inCollection].sort(
        (a, b) => Number(b.isFeatured) - Number(a.isFeatured) || (b.rating?.count ?? 0) - (a.rating?.count ?? 0),
      );
      return {
        slug: collection.slug,
        name: collection.name,
        title: collection.title,
        description: collection.description,
        image: collection.image,
        count: inCollection.length,
        products: ranked.slice(0, 3).map((product) => ({
          id: product.id,
          slug: product.slug,
          name: product.name,
          image: product.images[0]?.imageUrl ?? null,
          price: product.variants[0] ? formatPrice(product.variants[0].price) : null,
        })),
      };
    },
  );

  const finderProducts: FinderProduct[] = products.map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    headline: product.headline,
    images: product.images.slice(0, 1),
    variants: product.variants.slice(0, 1),
    concernSlugs: product.concerns.map((concern) => concern.slug),
  }));

  const ritualSteps: RitualSceneStep[] = RITUAL.flatMap((item) => {
    const product = bySlug(products, item.slug);
    if (!product) return [];
    return [
      {
        step: item.step,
        note: item.note,
        when: item.when,
        duration: item.duration,
        mood: item.mood,
        product: {
          id: product.id,
          slug: product.slug,
          name: product.name,
          headline: product.headline,
          images: product.images.slice(0, 1),
          variants: product.variants.slice(0, 1),
        },
      },
    ];
  });

  // ---- Marketplace data ----
  const inCollection = (slug: string) => {
    const collection = COLLECTIONS.find((item) => item.slug === slug);
    return collection
      ? products.filter((product) => product.categories.some((category) => collection.categorySlugs.includes(category.slug)))
      : [];
  };
  const byReviews = (list: Product[]) => [...list].sort((a, b) => (b.rating?.count ?? 0) - (a.rating?.count ?? 0));
  const tile = (product: Product) => ({
    label: product.name,
    href: `/products/${product.slug}`,
    image: cutoutFor(product.slug) ?? product.images[0]?.imageUrl ?? "/media/brand/02.jpg",
    cutout: Boolean(cutoutFor(product.slug)),
  });
  const underFiveHundred = products.filter((product) => (product.variants[0]?.price ?? 0) < 500);
  const topRated = [...products]
    .filter((product) => product.rating)
    .sort((a, b) => b.rating!.value - a.rating!.value || b.rating!.count - a.rating!.count);
  const cards: CategoryCard[] = [
    { title: "Glow-up face rituals", href: "/collections/face", cta: "Shop face care", tiles: byReviews(inCollection("face")).slice(0, 4).map(tile) },
    { title: "Body, polished & nourished", href: "/collections/body", cta: "Shop body care", tiles: byReviews(inCollection("body")).slice(0, 4).map(tile) },
    { title: "Hair & scalp, rooted in oils", href: "/collections/hair", cta: "Shop hair care", tiles: byReviews(inCollection("hair")).slice(0, 4).map(tile) },
    {
      title: "Gifts they'll treasure",
      note: "Keepsake boxes, ready to give",
      href: "/collections/gifting",
      cta: "Explore gift sets",
      image: "/media/products/hydro-glow-essentials/02.jpg",
      dark: true,
    },
  ];
  const counterProducts = byReviews(products.filter((product) => cutoutFor(product.slug))).slice(0, 12);

  return (
    <>
      {/* ---- Marketplace front ---- */}
      <HeroCarousel slides={SLIDES} />
      <div className="bg-pearl">
        <div className="container-site relative z-10 -mt-[110px] space-y-6 pb-16 sm:-mt-[130px] sm:space-y-8 sm:pb-20">
          <CategoryCards cards={cards} />
          <ProductRow title="Bestsellers" note="Most-loved rituals, ranked by reviews" href="/search?sort=bestsellers" products={byReviews(products).slice(0, 12)} ranked />
          <RecentlyViewedRow products={products} />
          <ApothecaryCounter products={counterProducts} prints={["/media/products/terra-tress-hair-scalp-oil/05.jpg", "/media/products/vita-clay-ubtan-pack/06.jpg"]} />
          <ProductRow title="Top rated by customers" note="Five-star rituals our customers swear by" href="/search?sort=rating" products={topRated.slice(0, 12)} />
          {underFiveHundred.length > 0 && (
            <ProductRow title="Little luxuries under ₹500" note="Easy treats and thoughtful add-ons" href="/search?price=0-500" products={underFiveHundred} />
          )}
        </div>
      </div>

      {/* ---- Walk the aisles ---- */}
      <section className="relative isolate overflow-hidden bg-[radial-gradient(80%_70%_at_50%_0%,#13707a_0%,#0b4654_45%,#07303b_100%)] py-20 text-ivory sm:py-28">
        <div className="grain absolute inset-0 -z-10" />
        <PendantLamp className="left-[12%] top-0 hidden sm:flex" cord={50} />
        <PendantLamp className="right-[14%] top-0 hidden lg:flex" cord={80} />
        <div className="container-site">
          <div className="mx-auto max-w-[640px] text-center">
            <p className="eyebrow text-gold-soft">Walk the aisles</p>
            <h2 className="mt-4 font-display text-[44px] leading-[1] sm:text-[64px]">
              Take something <em className="text-gold-soft">off the shelf.</em>
            </h2>
            <p className="mt-4 text-[16px] text-ivory/75">Browse our rituals the way you would in store — tap + to drop one in your bag.</p>
          </div>
          <div className="mt-14 space-y-10 sm:space-y-14">
            <ShelfRow title="Face care" note={`${inCollection("face").length} rituals`} products={inCollection("face")} />
            <ShelfRow title="Body care" note={`${inCollection("body").length} rituals`} products={inCollection("body")} />
            <ShelfRow title="Hair & scalp" note={`${inCollection("hair").length} rituals`} products={inCollection("hair")} />
          </div>
        </div>
      </section>

      <div className="bg-pearl">
        <div className="container-site py-16 sm:py-20">
          <ProductRow title="Gift sets for every celebration" note="Keepsake boxes, beautifully packed" href="/collections/gifting" products={inCollection("gifting")} />
        </div>
      </div>

      {/* ---- The Puro story, in marketplace modules ---- */}
      <div className="bg-pearl space-y-6 pb-6 sm:space-y-8 sm:pb-8">
        <PromiseStrip />

        {/* Our philosophy */}
        <Module
          title={
            <>
              Botanical care, <em className="text-emerald">made the slow way</em>
            </>
          }
          note="Our philosophy"
          link={{ label: "Read our story", href: "/our-story" }}
        >
          <div className="grid items-center gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
            <div className="relative">
              <ImageReveal className="aspect-[4/3] rounded-[22px] lg:aspect-[4/5]">
                <Image
                  src="/media/products/glow-up-pithi-pack/04.jpg"
                  alt="Glow Up Pithi Pack with turmeric and rose clay"
                  fill
                  sizes="(min-width: 1024px) 34vw, 100vw"
                  className="object-cover"
                />
              </ImageReveal>
              <RotatingSeal
                text="Ethical inside out · Rooted in age-old wisdom · "
                className="absolute -bottom-6 -right-3 w-[120px] text-[40px] sm:w-[140px] sm:text-[48px]"
              />
            </div>
            <div>
              <ScrollWords text={PHILOSOPHY} className="font-display text-[28px] leading-[1.15] text-emerald sm:text-[38px] xl:text-[44px]" />
              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { icon: Leaf, title: "Botanical", text: "Turmeric, saffron, aloe and clays." },
                  { icon: Rabbit, title: "Cruelty-free", text: "PETA certified and non-toxic." },
                  { icon: HeartHandshake, title: "Gives back", text: "Every purchase supports a woman." },
                ].map(({ icon: Icon, title, text }) => (
                  <div key={title} className="flex items-start gap-3 rounded-[18px] bg-mist p-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ivory text-emerald ring-1 ring-emerald/15">
                      <Icon size={18} strokeWidth={1.3} />
                    </span>
                    <span>
                      <span className="block font-display text-[20px] leading-tight text-ink">{title}</span>
                      <span className="mt-0.5 block text-[13px] leading-relaxed text-stone">{text}</span>
                    </span>
                  </div>
                ))}
              </div>
              <Link href="/our-story" className="btn-primary mt-8 rounded-full px-9">
                Read our story <ArrowRight size={15} strokeWidth={1.25} />
              </Link>
            </div>
          </div>
        </Module>

        {/* The Signatures */}
        {signatures.length > 0 && (
          <Module
            tone="dark"
            title={
              <>
                Our most <em className="text-gold-soft">loved</em> rituals
              </>
            }
            note="The Signatures — tap any product to bring it to the stage."
            link={{ label: "Shop all", href: "/shop" }}
          >
            <SignatureStage products={signatures} />
          </Module>
        )}

        {/* The Weekend Edit */}
        <Module
          title={
            <>
              The Weekend Edit: detoxify, polish, soothe. <em className="text-emerald">Glow.</em>
            </>
          }
          note="Three weekend rituals — one for each evening — that turn twenty minutes into a moment that is entirely yours."
        >
          <div className="-mt-[100px] sm:-mt-[110px]">
            <WeekendStack items={weekend} />
          </div>
        </Module>

        {/* The Gift Edit */}
        {giftFan.length > 0 && (
          <Module
            tone="dark"
            title={
              <>
                Give the gift of <em className="text-gold-soft">a ritual</em>
              </>
            }
            note="Keepsake boxes inspired by palace gardens and the grace of the peacock — ready for weddings, festivals and the people who matter most."
            link={{ label: "All gift sets", href: "/collections/gifting" }}
          >
            <GiftFan gifts={giftFan} />
          </Module>
        )}

        {/* Ingredients */}
        {ingredients.length > 0 && (
          <Module
            id="ingredients"
            title={
              <>
                Ingredients with <em className="text-emerald">a story</em>
              </>
            }
            note="Familiar botanicals, thoughtfully sourced. Hover or tap a card to turn it over."
          >
            <div className="lg:pb-16">
              <IngredientCards ingredients={ingredients} />
            </div>
          </Module>
        )}
      </div>

      {/* The Ritual — a pinned, scroll-driven scene */}
      {ritualSteps.length > 0 && <RitualScene steps={ritualSteps} />}

      <div className="bg-pearl space-y-6 py-6 sm:space-y-8 sm:py-8">
        {/* Collections */}
        <Module
          title={
            <>
              Shop by <em className="text-emerald">collection</em>
            </>
          }
          note="Four rituals for every part of you — choose one to see what's inside."
          link={{ label: "Shop all", href: "/shop" }}
        >
          <CollectionShowcase collections={showcase} />
        </Module>

        {/* Sa-Ni-Sa */}
        <section id="story" className="container-site scroll-mt-28">
          <div className="relative isolate overflow-hidden rounded-[28px] text-ivory shadow-[0_40px_80px_-50px_rgba(5,38,47,0.9)]">
            <Parallax strength={12}>
              <Image
                src="/media/products/good-cleanse-face-wash/04.jpg"
                alt="Good Cleanse Face Wash beside a lit diya"
                fill
                sizes="100vw"
                className="object-cover object-[50%_60%]"
              />
            </Parallax>
            <div className="absolute inset-0 bg-gradient-to-r from-[#062a34]/95 via-[#062a34]/75 to-[#062a34]/40" />
            <div className="relative grid gap-10 p-6 sm:p-10 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:p-14">
              <div>
                <p className="eyebrow text-gold-soft">The heart of Puro</p>
                <h2 className="mt-3 font-display text-[36px] leading-[1.02] sm:text-[52px]">
                  Every purchase <em className="text-gold-soft">empowers a woman.</em>
                </h2>
                <p className="mt-5 max-w-[520px] text-[16px] leading-[1.8] text-ivory/80">
                  Puro Body &amp; Soul is a division of Shramik Naari Sangh — Sa-Ni-Sa — a charitable organisation. For
                  every product you buy, you help a rural woman stand on her own feet and live a life of dignity.
                </p>
                <Link href="/our-story" className="btn-light mt-8 rounded-full px-9">
                  Meet Sa-Ni-Sa <ArrowRight size={15} strokeWidth={1.25} />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {[
                  { value: <Counter to={products.length} />, label: "Botanical formulas" },
                  { value: <Counter to={totalReviews} />, label: "Customer reviews" },
                  { value: <Counter to={averageRating} decimals={1} />, label: "Average rating" },
                  { value: <Counter to={100} suffix="%" />, label: "Cruelty-free" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-[22px] border border-ivory/15 bg-ivory/[0.08] px-4 py-7 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md sm:py-9"
                  >
                    <p className="font-display text-[48px] leading-none sm:text-[64px]">{stat.value}</p>
                    <p className="mt-3 text-[12px] font-medium uppercase tracking-[0.2em] text-ivory/70">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Find your match */}
        {concerns.length > 0 && (
          <Module
            title={
              <>
                Find your match: what does your skin <em className="text-emerald">need?</em>
              </>
            }
            note="Choose skin or hair, pick a concern, and we'll build your ritual."
          >
            <ConcernFinder concerns={concerns} products={finderProducts} />
          </Module>
        )}

        {/* Reviews */}
        <section className="container-site">
          <div className="overflow-hidden rounded-[28px] shadow-[0_40px_80px_-50px_rgba(5,38,47,0.9)] ring-1 ring-gold/20">
            <Testimonials reviews={reviews} totalReviews={totalReviews} averageRating={averageRating} images={reviewImages} />
          </div>
        </section>

        {/* Good to know */}
        <Module
          id="why-puro"
          title={
            <>
              Good to <em className="text-emerald">know</em>
            </>
          }
          note="What goes into every Puro ritual — and what we stand for."
        >
          <KnowledgeTabs items={WHY_PURO} />
        </Module>
      </div>

      {/* Closing — film opens to fill the screen */}
      <ExpandingFilm />
    </>
  );
}
