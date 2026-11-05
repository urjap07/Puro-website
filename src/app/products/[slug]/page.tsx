import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Leaf, Rabbit, ShieldCheck } from "lucide-react";
import { getActiveProducts, getProductBySlug } from "@/db/queries/products";
import { getProductCollection, productsInCollection } from "@/lib/collections";
import { displayCertifications, formatPrice } from "@/lib/format";
import ProductGallery from "@/components/product/ProductGallery";
import ProductCard from "@/components/product/ProductCard";
import { AddToBagPanel } from "@/components/cart/AddToBag";
import Accordion, { type AccordionItem } from "@/components/ui/Accordion";
import SectionHeading from "@/components/ui/SectionHeading";

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
    openGraph: {
      images: product.images[0] ? [product.images[0].imageUrl] : undefined,
    },
  };
}

const PROMISES = [
  { icon: Rabbit, label: "Cruelty-free" },
  { icon: ShieldCheck, label: "Dermatologically tested" },
  { icon: Leaf, label: "Non-toxic" },
];

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [product, products] = await Promise.all([getProductBySlug(slug), getActiveProducts()]);

  if (!product) notFound();

  const variant = product.variants[0];
  const collection = getProductCollection(product);
  const related = (collection ? productsInCollection(products, collection) : products)
    .filter((item) => item.id !== product.id)
    .slice(0, 4);

  const certifications = displayCertifications(product.certifications);

  const details: AccordionItem[] = [
    product.description && { title: "The Story", content: <p>{product.description}</p> },
    product.howToUse && { title: "How to Use", content: <p>{product.howToUse}</p> },
    product.keyIngredients && {
      title: "Key Ingredients",
      content: <p>{product.keyIngredients}</p>,
    },
    (product.shelfLife || product.storage) && {
      title: "Shelf Life & Storage",
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
            <li key={claim} className="border border-line px-3 py-1.5 text-[12px]">
              {claim}
            </li>
          ))}
        </ul>
      ),
    },
  ].filter(Boolean) as AccordionItem[];

  return (
    <>
      <div className="container-site pb-24 pt-8 sm:pt-10">
        <nav aria-label="Breadcrumb" className="mb-8 text-[10px] uppercase tracking-[0.22em] text-stone">
          <Link href="/" className="hover:text-emerald">Home</Link>
          <span className="mx-3 text-gold">/</span>
          {collection ? (
            <Link href={`/collections/${collection.slug}`} className="hover:text-emerald">
              {collection.title}
            </Link>
          ) : (
            <Link href="/shop" className="hover:text-emerald">Shop</Link>
          )}
          <span className="mx-3 text-gold">/</span>
          <span className="text-emerald">{product.name}</span>
        </nav>

        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <div className="min-w-0 lg:sticky lg:top-28 lg:self-start">
            <ProductGallery product={product} />
          </div>

          <div className="min-w-0 lg:py-4">
            <p className="eyebrow">{product.subCategory ?? product.categories[0]?.name}</p>
            <h1 className="mt-5 font-display text-[40px] font-light leading-[1.05] text-emerald sm:text-[52px]">
              {product.name}
            </h1>
            {product.headline && (
              <p className="mt-4 font-display text-[22px] italic text-gold-deep">
                {product.headline}
              </p>
            )}

            {variant && (
              <div className="mt-8 flex items-baseline gap-4 border-b border-line pb-8">
                <span className="text-[24px] text-ink">{formatPrice(variant.price)}</span>
                {product.sizeLabel && (
                  <span className="text-[13px] text-stone">{product.sizeLabel}</span>
                )}
                <span className="text-[11px] text-stone">Incl. of all taxes</span>
              </div>
            )}

            {product.skinType && (
              <p className="mt-8 text-[14px] text-stone">
                <span className="mr-3 text-[10px] uppercase tracking-[0.22em] text-emerald">
                  Suitable for
                </span>
                {product.skinType}
              </p>
            )}

            {product.benefits.length > 0 && (
              <ul className="mt-8 space-y-3.5">
                {product.benefits.map((benefit) => (
                  <li key={benefit} className="flex gap-4 text-[15px] leading-7 text-ink">
                    <Check size={16} strokeWidth={1.25} className="mt-1.5 shrink-0 text-gold" />
                    {benefit}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-10">
              <AddToBagPanel product={product} />
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3 border-y border-line py-6">
              {PROMISES.map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2 text-center">
                  <Icon size={20} strokeWidth={1} className="text-gold-deep" />
                  <span className="text-[10px] uppercase tracking-[0.16em] text-stone">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {product.tagline && (
              <p className="mt-8 text-center font-display text-[20px] italic text-emerald">
                &ldquo;{product.tagline}&rdquo;
              </p>
            )}

            <div className="mt-10">
              <Accordion items={details} />
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="border-t border-line bg-parchment/60 py-24">
          <div className="container-site">
            <SectionHeading
              eyebrow={collection?.title ?? "Discover"}
              title={
                <>
                  Complete the <em>ritual</em>
                </>
              }
            />
            <div className="mt-14 grid grid-cols-2 gap-x-4 gap-y-14 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
