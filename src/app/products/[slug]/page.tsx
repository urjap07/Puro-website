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
import Price from "@/components/commerce/Price";
import StarRating from "@/components/commerce/StarRating";
import ProductRow, { RecentlyViewedRow, RecordView } from "@/components/commerce/ProductRow";
import BuyBox from "@/components/pdp/BuyBox";
import MobileBuyBar from "@/components/pdp/MobileBuyBar";
import FrequentlyBought from "@/components/pdp/FrequentlyBought";
import ReviewsPanel from "@/components/pdp/ReviewsPanel";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.headline ?? product.description ?? undefined,
    openGraph: { images: product.images[0] ? [product.images[0].imageUrl] : undefined },
  };
}

const PROMISES = [
  { icon: Rabbit, label: "Cruelty-free" },
  { icon: ShieldCheck, label: "Dermatologically tested" },
  { icon: Leaf, label: "Non-toxic" },
];

const byReviews = (list: Product[]) => [...list].sort((a, b) => (b.rating?.count ?? 0) - (a.rating?.count ?? 0));

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [product, products] = await Promise.all([getProductBySlug(slug), getActiveProducts()]);
  if (!product) notFound();
  const reviews = await getProductReviews(product.id);

  const variant = product.variants[0];
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
    product.description && { title: "The story", content: <p>{product.description}</p> },
    product.howToUse && { title: "How to use", content: <p>{product.howToUse}</p> },
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
            <li key={claim} className="rounded-full border border-emerald/20 px-3.5 py-1.5 text-[13px] text-emerald">
              {claim}
            </li>
          ))}
        </ul>
      ),
    },
  ].filter(Boolean) as AccordionItem[];

  return (
    <div className="bg-pearl pb-28 lg:pb-12">
      <RecordView slug={product.slug} />

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
              className="text-[12px] font-semibold uppercase tracking-[0.18em] text-gold-deep hover:underline"
            >
              {product.subCategory ?? product.categories[0]?.name}
            </Link>
            <h1 className="mt-2 font-display text-[38px] leading-[1.04] text-ink sm:text-[48px]">{product.name}</h1>
            {product.headline && <p className="mt-2 font-display text-[21px] italic text-emerald">{product.headline}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {product.rating && (
                <a href="#reviews">
                  <StarRating value={product.rating.value} count={product.rating.count} size={15} />
                </a>
              )}
              {product.isFeatured && (
                <span className="rounded-full bg-noir px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-soft">Bestseller</span>
              )}
            </div>

            <div className="mt-5 border-t border-ink/10 pt-5">
              {variant && (
                <div className="flex flex-wrap items-end gap-3">
                  <Price value={variant.price} size="lg" />
                  {product.sizeLabel && <span className="mb-1.5 text-[14px] uppercase tracking-[0.12em] text-stone">{product.sizeLabel}</span>}
                </div>
              )}
              <p className="mt-1 text-[13px] text-stone">Inclusive of all taxes · Free delivery in India over ₹500</p>
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
                          className="rounded-full border border-emerald/20 px-3 py-1 text-[13px] text-emerald hover:bg-emerald hover:text-ivory"
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
              <div className="mt-7 border-t border-ink/10 pt-6">
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
              {PROMISES.map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2 rounded-[16px] bg-ivory p-3 text-center ring-1 ring-ink/[0.06]">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-mist text-emerald">
                    <Icon size={18} strokeWidth={1.3} />
                  </span>
                  <span className="text-[12px] font-medium text-ink">{label}</span>
                </div>
              ))}
            </div>

            {product.tagline && <p className="mt-7 font-display text-[22px] italic text-emerald">&ldquo;{product.tagline}&rdquo;</p>}

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
    </div>
  );
}
