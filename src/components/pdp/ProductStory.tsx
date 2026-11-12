import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import type { Product } from "@/db/queries/products";
import { TINT, ingredientTint } from "@/components/commerce/tints";

/** Splits directions into short steps (sentences), without breaking "e.g." style abbreviations. */
function steps(text: string | null, max = 4) {
  if (!text) return [];
  return (text.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [text])
    .map((step) => step.trim())
    .filter((step) => step.length > 3)
    .slice(0, max);
}

/**
 * The product story: real photography of the formula in its setting and a
 * close-up of the texture, beside its story, what it's made with and the
 * ritual, step by step.
 */
export default function ProductStory({ product }: { product: Product }) {
  const [, second, third, fourth, fifth, sixth] = product.images;
  const hero = fourth ?? second ?? third;
  const texture = sixth ?? fifth ?? third;
  const strip = [second, third, fifth].filter((image) => image && image !== hero && image !== texture).slice(0, 3);
  const ritual = steps(product.howToUse);
  const keyIngredients = product.keyIngredients?.split(",").map((item) => item.trim()).filter(Boolean) ?? [];
  // Words of the linked library ingredients ("volcanic", "clay"…), to avoid repeating them as plain chips.
  const linkedWords = product.ingredientLinks.flatMap((link) =>
    link.name
      .toLowerCase()
      .split(/[\s&]+/)
      .filter((word) => word.length > 3),
  );
  const alsoLinked = (item: string) => linkedWords.some((word) => item.toLowerCase().includes(word.replace(/s$/, "")));

  if (!hero && !product.description) return null;

  return (
    <section aria-labelledby="story-title" className="container-site">
      <div className="glass rounded-[32px] p-4 sm:rounded-[40px] sm:p-6 lg:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
          {/* Photography */}
          {hero && (
            <div className="relative">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[26px] shadow-[0_30px_60px_-34px_rgba(14,39,42,0.6)] sm:aspect-[5/6]">
                <Image
                  src={hero.imageUrl}
                  alt={hero.altText ?? `${product.name} with its ingredients`}
                  fill
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover"
                />
              </div>
              {texture && texture !== hero && (
                <figure className="absolute -bottom-6 right-4 w-[38%] max-w-[190px] sm:right-6">
                  <div className="relative aspect-square overflow-hidden rounded-full shadow-[0_24px_40px_-18px_rgba(14,39,42,0.65)] ring-[6px] ring-white/80">
                    <Image src={texture.imageUrl} alt={`The texture of ${product.name}`} fill sizes="190px" className="object-cover" />
                  </div>
                  <figcaption className="glass-strong mx-auto -mt-4 w-fit rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-midnight">
                    <span className="relative z-[2]">The texture</span>
                  </figcaption>
                </figure>
              )}
            </div>
          )}

          {/* Story */}
          <div className="flex flex-col justify-center pt-4 lg:pt-0">
            <p className="label text-[#8E4F5B]">The story</p>
            <h2 id="story-title" className="mt-4 font-display text-[36px] font-light leading-[1.05] text-midnight sm:text-[48px]">
              {product.tagline ? <em className="text-iris pr-1">{product.tagline}</em> : product.name}
            </h2>
            {product.description && <p className="mt-5 text-[16px] leading-[1.8] text-graphite/85">{product.description}</p>}

            {(product.ingredientLinks.length > 0 || keyIngredients.length > 0) && (
              <div className="mt-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-midnight">Made with</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {product.ingredientLinks.map((link) => {
                    const tint = TINT[ingredientTint(link.slug)];
                    return (
                      <li key={link.slug}>
                        <Link
                          href={`/shop?ingredient=${link.slug}`}
                          className={clsx("glass glass-hover flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-medium", tint.glass, tint.text)}
                        >
                          <span aria-hidden="true" className={clsx("relative z-[2] h-2 w-2 rounded-full", tint.dot)} />
                          <span className="relative z-[2]">{link.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                  {keyIngredients
                    .filter((item) => !alsoLinked(item))
                    .map((item) => (
                      <li key={item} className="glass rounded-full px-3.5 py-1.5 text-[13px] text-graphite">
                        <span className="relative z-[2]">{item}</span>
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {ritual.length > 0 && (
              <div className="mt-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-midnight">
                  The ritual{product.frequency && <span className="ml-2 font-normal normal-case tracking-normal text-stone">· {product.frequency}</span>}
                </p>
                <ol className="mt-4 space-y-3">
                  {ritual.map((step, index) => (
                    <li key={step} className="flex gap-4">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f6e3c8,#efc3c8_50%,#d6c8ee)] font-display text-[16px] text-midnight-deep shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                        {index + 1}
                      </span>
                      <span className="pt-1 text-[15px] leading-[1.65] text-graphite/90">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>

        {/* More photography */}
        {strip.length > 1 && (
          <div className="mt-12 grid grid-cols-3 gap-3 sm:gap-4">
            {strip.map((image) => (
              <div key={image!.id} className="relative aspect-square overflow-hidden rounded-[20px] shadow-[0_18px_30px_-20px_rgba(14,39,42,0.55)] sm:rounded-[24px]">
                <Image src={image!.imageUrl} alt={image!.altText ?? product.name} fill sizes="(min-width: 1024px) 28vw, 33vw" className="object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
