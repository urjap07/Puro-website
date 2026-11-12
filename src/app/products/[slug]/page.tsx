import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ChevronRight, Leaf, Rabbit, ShieldCheck } from "lucide-react";
import { getActiveProducts, getProductBySlug, getProductReviews, type Product } from "@/db/queries/products";
import { getProductCollection, productsInCollection } from "@/lib/collections";
import { displayCertifications } from "@/lib/format";
import ProductGallery from "@/components/product/ProductGallery";
import Accordion, { type AccordionItem } from "@/components/ui/Accordion";
import Module from "@/components/commerce/Module";
import StarRating from "@/components/commerce/StarRating";
import ProductRow, { RecentlyViewedRow, RecordView } from "@/components/commerce/ProductRow";
import BuyBox from "@/components/pdp/BuyBox";
import MobileBuyBar from "@/components/pdp/MobileBuyBar";
import FrequentlyBought from "@/components/pdp/FrequentlyBought";
import ReviewsPanel from "@/components/pdp/ReviewsPanel";
import { TINT, concernTint } from "@/components/commerce/tints";
import ProductStory from "@/components/pdp/ProductStory";
import { VariantPicker, VariantPrice, VariantProvider } from "@/components/pdp/VariantContext";
import { SITE } from "@/lib/site";
import type { Review } from "@/db/queries/products";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  const description = [product.headline, product.summary !== product.headline ? product.summary : null]
    .filter(Boolean)
    .join(". ") || product.description || undefined;
  return {
    title: product.name,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: `${product.name} | PURO Body & Soul`,
      description,
      url: `/products/${product.slug}`,
      images: product.images[0] ? [product.images[0].imageUrl] : undefined,
    },
  };
}

/** Absolute URL on the public site. */
const absolute = (path: string) => (path.startsWith("http") ? path : `${SITE.url}${path}`);

/**
 * Product, Offer, AggregateRating and BreadcrumbList structured data. It only
 * describes what the page shows: the rating appears only when there are
 * customer reviews on the page.
 */
function structuredData(product: Product, reviews: Review[], collection: { slug: string; title: string } | undefined) {
  const url = absolute(`/products/${product.slug}`);
  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? product.headline ?? undefined,
    image: product.images.map((image) => absolute(image.imageUrl)),
    sku: product.variants[0]?.sku,
    category: product.subCategory ?? undefined,
    brand: { "@type": "Brand", name: "PURO Body & Soul" },
    url,
    offers: product.variants.map((variant) => ({
      "@type": "Offer",
      sku: variant.sku,
      name: variant.name,
      price: variant.price.toFixed(2),
      priceCurrency: "INR",
      availability: variant.stockQuantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      url: product.variants.length > 1 ? `${url}?variant=${variant.id}` : url,
      seller: { "@type": "Organization", name: SITE.organisation },
    })),
    ...(product.rating && reviews.length > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating.value,
            reviewCount: product.rating.count,
            bestRating: 5,
          },
          review: reviews.slice(0, 5).map((review) => ({
            "@type": "Review",
            author: { "@type": "Person", name: review.author },
            reviewRating: { "@type": "Rating", ratingValue: review.rating, bestRating: 5 },
            name: review.title ?? undefined,
            reviewBody: review.comment ?? undefined,
            datePublished: review.createdAt?.slice(0, 10),
          })),
        }
      : {}),
  };
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absolute("/") },
      collection
        ? { "@type": "ListItem", position: 2, name: collection.title, item: absolute(`/collections/${collection.slug}`) }
        : { "@type": "ListItem", position: 2, name: "Shop", item: absolute("/shop") },
      { "@type": "ListItem", position: 3, name: product.name, item: url },
    ],
  };
  // Escape "<" so the JSON can't close the script tag.
  return JSON.stringify([productLd, breadcrumbs]).replace(/</g, "\\u003c");
}

const PROMISES = [
  { icon: Rabbit, label: "Cruelty-free", tint: TINT.quartz },
  { icon: ShieldCheck, label: "Dermatologically tested", tint: TINT.aqua },
  { icon: Leaf, label: "Non-toxic", tint: TINT.sage },
];

const byReviews = (list: Product[]) => [...list].sort((a, b) => (b.rating?.count ?? 0) - (a.rating?.count ?? 0));

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [product, products] = await Promise.all([getProductBySlug(slug), getActiveProducts()]);
  if (!product) notFound();
  const reviews = await getProductReviews(product.id);

  const collection = getProductCollection(product);
  const others = products.filter((item) => item.id !== product.id);
  const sameCollection = byReviews(collection ? productsInCollection(others, collection) : others);
  const concernSlugs = product.concerns.map((concern) => concern.slug);
  const sharesConcern = (item: Product) => item.concerns.some((concern) => concernSlugs.includes(concern.slug));

  // Two companions from a different step of the ritual, ideally for the same concerns.
  const companions = byReviews(others.filter((item) => item.subCategory !== product.subCategory && item.variants[0]))
    .sort((a, b) => Number(sharesConcern(b)) - Number(sharesConcern(a)))
    .filter((item) => !item.categories.some((category) => category.slug === "gift-sets") || collection?.slug === "gifting")
    .slice(0, 2);
  const similar = byReviews(others.filter((item) => sharesConcern(item) && !companions.includes(item)));

  const certifications = displayCertifications(product.certifications);
  const details: AccordionItem[] = [
    product.howToUse && { title: "Directions for use", content: <p>{product.howToUse}</p> },
    product.warnings.length > 0 && {
      title: "Good to know",
      content: (
        <ul className="list-disc space-y-1.5 pl-5">
          {product.warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      ),
    },
    product.kitContents.length > 0 && {
      title: "What's inside",
      content: (
        <ul className="space-y-1.5">
          {product.kitContents.map((item) => (
            <li key={item.name}>
              {item.name}
              {item.size && <span className="text-stone"> · {item.size}</span>}
            </li>
          ))}
        </ul>
      ),
    },
    (product.ingredients || product.keyIngredients) && {
      title: "Ingredients",
      content: (
        <>
          {product.keyIngredients && (
            <p>
              <strong className="font-semibold text-ink">Key ingredients: </strong>
              {product.keyIngredients}
            </p>
          )}
          {product.ingredients && <p className="mt-3">{product.ingredients}</p>}
        </>
      ),
    },
    (product.shelfLife || product.storage) && {
      title: "Shelf life & storage",
      content: (
        <>
          {product.shelfLife && <p>{product.shelfLife}.</p>}
          {product.storage && <p className="mt-2">{product.storage}.</p>}
        </>
      ),
    },
    certifications.length > 0 && {
      title: "Certifications",
      content: (
        <ul className="flex flex-wrap gap-2">
          {certifications.map((claim) => (
            <li key={claim} className={`glass rounded-full px-3.5 py-1.5 text-[13px] ${TINT.sage.glass} ${TINT.sage.text}`}>
              {claim}
            </li>
          ))}
        </ul>
      ),
    },
  ].filter(Boolean) as AccordionItem[];

  return (
    <div className="bg-pearl pb-28 lg:pb-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData(product, reviews, collection) }} />
      <RecordView slug={product.slug} />
      <VariantProvider product={product}>

      <div className="container-site pt-6 sm:pt-8">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[13px] text-stone">
          <Link href="/" className="hover:text-emerald">Home</Link>
          <ChevronRight size={13} strokeWidth={1.4} />
          {collection ? (
            <Link href={`/collections/${collection.slug}`} className="hover:text-emerald">{collection.title}</Link>
          ) : (
            <Link href="/shop" className="hover:text-emerald">Shop</Link>
          )}
          <ChevronRight size={13} strokeWidth={1.4} />
          <span className="text-ink">{product.name}</span>
        </nav>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)_340px] xl:gap-10">
          {/* Gallery */}
          <div className="min-w-0 lg:sticky lg:top-[100px] lg:self-start">
            <ProductGallery product={product} />
          </div>

          {/* Details */}
          <div className="min-w-0">
            <Link
              href={collection ? `/collections/${collection.slug}` : "/shop"}
              className="text-[12px] font-semibold uppercase tracking-[0.18em] text-champagne-deep hover:underline"
            >
              {product.subCategory ?? product.categories[0]?.name}
            </Link>
            <h1 className="mt-2 font-display text-[38px] leading-[1.04] text-midnight sm:text-[48px]">{product.name}</h1>
            {product.headline && <p className="mt-2 font-display text-[21px] italic text-midnight-soft">{product.headline}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {product.rating && (
                <a href="#reviews">
                  <StarRating value={product.rating.value} count={product.rating.count} size={15} />
                </a>
              )}
              {product.isFeatured && (
                <span className={`glass rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${TINT.saffron.glass} ${TINT.saffron.text}`}>Bestseller</span>
              )}
            </div>

            <div className="mt-5 border-t border-white/70 pt-5 shadow-[0_-1px_0_rgba(52,59,59,0.08)]">
              <VariantPrice product={product} sizeLabel={product.sizeLabel} />
              <p className="mt-1 text-[13px] text-stone">Inclusive of all taxes · Free delivery in India over ₹500</p>
              <VariantPicker product={product} />
            </div>

            {(product.skinType || product.concerns.length > 0) && (
              <dl className="mt-6 space-y-3 text-[14px]">
                {product.skinType && (
                  <div className="flex gap-4">
                    <dt className="w-[110px] shrink-0 font-semibold text-ink">Suitable for</dt>
                    <dd className="text-stone">{product.skinType}</dd>
                  </div>
                )}
                {product.concerns.length > 0 && (
                  <div className="flex gap-4">
                    <dt className="w-[110px] shrink-0 font-semibold text-ink">Helps with</dt>
                    <dd className="flex flex-wrap gap-1.5">
                      {product.concerns.map((concern) => (
                        <Link
                          key={concern.slug}
                          href={`/concerns/${concern.slug}`}
                          className={`glass glass-hover rounded-full px-3 py-1 text-[13px] ${TINT[concernTint(concern)].glass} ${TINT[concernTint(concern)].text}`}
                        >
                          {concern.name}
                        </Link>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            )}

            {product.benefits.length > 0 && (
              <div className="mt-7 border-t border-white/70 pt-6 shadow-[0_-1px_0_rgba(52,59,59,0.08)]">
                <h2 className="font-display text-[24px] text-ink">About this item</h2>
                <ul className="mt-3 space-y-2.5">
                  {product.benefits.map((benefit) => (
                    <li key={benefit} className="flex gap-3 text-[15px] leading-[1.7] text-ink/85">
                      <Check size={16} strokeWidth={1.8} className="mt-1 shrink-0 text-emerald" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-7 grid grid-cols-3 gap-2">
              {PROMISES.map(({ icon: Icon, label, tint }) => (
                <div key={label} className={`glass flex flex-col items-center gap-2 rounded-[24px] p-3 text-center ${tint.glass}`}>
                  <span className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/60 ${tint.text} shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_0_0_0_1px_rgba(255,255,255,0.6),0_6px_14px_-8px_rgba(14,39,42,0.4)]`}>
                    <Icon size={18} strokeWidth={1.3} />
                  </span>
                  <span className="text-[12px] font-medium text-graphite">{label}</span>
                </div>
              ))}
            </div>


            {/* Buy box below details until there's room for a third column */}
            <div className="mt-8 xl:hidden">
              <BuyBox product={product} isGift={collection?.slug === "gifting"} />
            </div>
          </div>

          {/* Buy box */}
          <div className="hidden xl:sticky xl:top-[100px] xl:block xl:self-start">
            <BuyBox product={product} isGift={collection?.slug === "gifting"} />
          </div>
        </div>
      </div>

      <div className="mt-12 space-y-6 sm:space-y-8">
        <ProductStory product={product} />

        {companions.length > 0 && (
          <Module title="Frequently bought together" note="Complete the ritual — tick what you'd like and add them in one go.">
            <FrequentlyBought products={[product, ...companions]} />
          </Module>
        )}

        {details.length > 0 && (
          <Module title="Product details">
            <div className="max-w-[900px]">
              <Accordion items={details} titleClassName="font-display text-[22px] text-ink" />
            </div>
          </Module>
        )}

        <Module id="reviews" title="Customer reviews">
          <ReviewsPanel product={product} reviews={reviews} />
        </Module>

        <div className="container-site space-y-6 sm:space-y-8">
          {sameCollection.length > 0 && (
            <ProductRow
              title="Customers also viewed"
              note={collection ? `More from ${collection.title}` : undefined}
              href={collection ? `/collections/${collection.slug}` : "/shop"}
              products={sameCollection.slice(0, 12)}
            />
          )}
          {similar.length > 0 && (
            <ProductRow title="Customers with similar concerns also loved" products={similar.slice(0, 12)} />
          )}
          <RecentlyViewedRow products={others} />
        </div>
      </div>

      <MobileBuyBar product={product} />
      </VariantProvider>
    </div>
  );
}
