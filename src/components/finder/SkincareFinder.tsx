"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { ArrowLeft, ArrowRight, Check, Gift, Link2, RotateCcw, ShoppingBag, Sparkles } from "lucide-react";
import type { Concern, Product } from "@/db/queries/products";
import { useCart } from "@/lib/cart-store";
import { ritualStep } from "@/lib/catalogue";
import {
  AREAS,
  type FinderAnswers,
  type FinderArea,
  type FinderRoutine,
  ROUTINES,
  buildRitual,
  inArea,
  rankProducts,
} from "@/lib/finder-rules";
import { formatPrice } from "@/lib/format";
import { toCartItem } from "@/components/cart/AddToBag";
import ProductCard from "@/components/product/ProductCard";
import { TINT, concernTint } from "@/components/commerce/tints";

const EASE = [0.22, 1, 0.36, 1] as const;

type Question = "area" | "type" | "concerns" | "routine" | "results";

const AREA_ART: Record<FinderArea, { image: string; tint: string }> = {
  face: { image: "/media/products/aqua-riche-night-repair-gel-cream/04.jpg", tint: "tint-quartz" },
  body: { image: "/media/products/sheavibe-lotion/03.jpg", tint: "tint-saffron" },
  hair: { image: "/media/products/terra-tress-hair-scalp-oil/02.jpg", tint: "tint-lilac" },
  gift: { image: "/media/products/radiant-glow-luxurious-kit/02.jpg", tint: "tint-champagne" },
};

function readAnswers(params: URLSearchParams): FinderAnswers {
  const area = params.get("area") as FinderArea | null;
  const routine = params.get("routine") as FinderRoutine | null;
  return {
    area: AREAS.some((item) => item.key === area) ? area : null,
    type: params.get("type") || null,
    concerns: (params.get("concerns") ?? "").split(",").filter(Boolean),
    routine: ROUTINES.some((item) => item.key === routine) ? routine : null,
  };
}

/** Which questions this set of answers needs (gifts skip concerns and routine). */
function questionsFor(area: FinderArea | null): Question[] {
  return area === "gift" ? ["area", "type", "results"] : ["area", "type", "concerns", "routine", "results"];
}

function OptionCard({
  selected,
  onClick,
  title,
  note,
  image,
  tint,
  multi = false,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  note?: string;
  image?: string;
  tint?: string;
  multi?: boolean;
}) {
  return (
    <button
      type="button"
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
      onClick={onClick}
      className={clsx(
        "glass group flex h-full w-full items-center gap-4 rounded-[24px] p-3 text-left transition duration-300 hover:-translate-y-0.5",
        tint,
        selected && "ring-2 ring-[#5E4B8A] ring-offset-2 ring-offset-transparent",
      )}
    >
      {image && (
        <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[18px] sm:h-24 sm:w-24">
          <Image src={image} alt="" fill sizes="96px" className="object-cover transition duration-700 group-hover:scale-[1.06]" />
        </span>
      )}
      <span className={clsx("relative z-[2] min-w-0 flex-1", !image && "px-2 py-2")}>
        <span className="block font-display text-[22px] leading-tight text-midnight sm:text-[24px]">{title}</span>
        {note && <span className="mt-1 block text-[13px] text-stone">{note}</span>}
      </span>
      <span
        className={clsx(
          "relative z-[2] mr-2 flex h-6 w-6 shrink-0 items-center justify-center border transition",
          multi ? "rounded-[7px]" : "rounded-full",
          selected ? "border-[#5E4B8A] bg-[#5E4B8A] text-ivory" : "border-graphite/30 bg-white/60",
        )}
      >
        {selected && <Check size={14} strokeWidth={2.4} />}
      </span>
    </button>
  );
}

/**
 * The skincare finder (PRD 6.9): four questions, matched against tags from
 * the catalogue with the rules in lib/finder-rules.ts. It suggests formulas
 * to explore — it doesn't diagnose or treat anything.
 */
export default function SkincareFinder({ products, concerns }: { products: Product[]; concerns: Concern[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const add = useCart((state) => state.add);
  const open = useCart((state) => state.open);
  const [answers, setAnswers] = useState<FinderAnswers>(() => readAnswers(new URLSearchParams(params.toString())));
  const [question, setQuestion] = useState<Question>(() => {
    // A shared link to results opens straight on them.
    return params.get("step") === "results" && readAnswers(new URLSearchParams(params.toString())).area ? "results" : "area";
  });
  const [copied, setCopied] = useState(false);

  // Keep the answers in the URL, so results can be shared and survive a refresh.
  useEffect(() => {
    const next = new URLSearchParams();
    if (answers.area) next.set("area", answers.area);
    if (answers.type) next.set("type", answers.type);
    if (answers.concerns.length) next.set("concerns", answers.concerns.join(","));
    if (answers.routine) next.set("routine", answers.routine);
    if (question === "results") next.set("step", "results");
    const query = next.toString();
    router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
  }, [answers, question, pathname, router]);

  const flow = questionsFor(answers.area);
  const position = flow.indexOf(question);
  const area = AREAS.find((item) => item.key === answers.area);

  const types = useMemo(() => {
    const names = products.filter((product) => inArea(product, answers.area) && product.subCategory).map((product) => product.subCategory!);
    return [...new Set(names)];
  }, [products, answers.area]);
  const areaConcerns = concerns.filter((concern) => concern.type === area?.concernType);
  const concernNames = Object.fromEntries(concerns.map((concern) => [concern.slug, concern.name]));

  const ranked = useMemo(() => rankProducts(products, answers, concernNames), [products, answers]); // eslint-disable-line react-hooks/exhaustive-deps
  const ritual = answers.area && answers.routine === "ritual" ? buildRitual(ranked, answers.area) : [];
  const picks = answers.routine === "ritual" ? ritual.map((entry) => entry.match) : ranked.slice(0, 4);

  const canContinue =
    question === "area" ? Boolean(answers.area) : question === "routine" ? Boolean(answers.routine) : true;
  const go = (delta: 1 | -1) => setQuestion(flow[Math.max(0, Math.min(flow.length - 1, position + delta))]);
  const restart = () => {
    setAnswers({ area: null, type: null, concerns: [], routine: null });
    setQuestion("area");
  };
  const addAll = () => {
    for (const match of picks) add(toCartItem(match.product));
    useCart.getState().dismissNotice();
    open();
  };
  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      // Clipboard blocked; nothing to do.
    }
  };

  const titles: Record<Question, React.ReactNode> = {
    area: (
      <>
        What are you <em className="text-iris pr-1">looking for?</em>
      </>
    ),
    type: (
      <>
        Which kind of <em className="text-iris pr-1">formula?</em>
      </>
    ),
    concerns: (
      <>
        What would you like <em className="text-iris pr-1">to focus on?</em>
      </>
    ),
    routine: (
      <>
        What kind of <em className="text-iris pr-1">routine</em> suits you?
      </>
    ),
    results:
      answers.routine === "ritual" ? (
        <>
          Your <em className="text-iris pr-1">ritual</em>
        </>
      ) : (
        <>
          Your <em className="text-iris pr-1">matches</em>
        </>
      ),
  };

  return (
    <div>
      {/* Progress */}
      <div className="mx-auto flex max-w-[520px] items-center gap-2" aria-label={`Step ${position + 1} of ${flow.length}`}>
        {flow.map((step, index) => (
          <span key={step} className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/60 ring-1 ring-inset ring-white/80">
            <motion.span
              className="block h-full rounded-full bg-[linear-gradient(90deg,#e9b55a,#e9a3ae,#b4a0e0)]"
              initial={false}
              animate={{ width: index <= position ? "100%" : "0%" }}
              transition={{ duration: 0.5, ease: EASE }}
            />
          </span>
        ))}
      </div>
      <p className="mt-3 text-center text-[12px] font-semibold uppercase tracking-[0.22em] text-stone">
        {question === "results" ? "Your suggestions" : `Question ${position + 1} of ${flow.length - 1}`}
      </p>

      <h2 className="mx-auto mt-4 max-w-[760px] text-center font-display text-[38px] font-light leading-[1.05] text-midnight sm:text-[54px]">
        {titles[question]}
      </h2>

      <AnimatePresence mode="wait">
        <motion.div
          key={question}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="mt-8"
        >
          {question === "area" && (
            <div role="radiogroup" aria-label="What are you looking for?" className="mx-auto grid max-w-[880px] gap-3 sm:grid-cols-2">
              {AREAS.map((item) => (
                <OptionCard
                  key={item.key}
                  selected={answers.area === item.key}
                  onClick={() => setAnswers({ area: item.key, type: null, concerns: [], routine: null })}
                  title={item.label}
                  note={item.note}
                  image={AREA_ART[item.key].image}
                  tint={AREA_ART[item.key].tint}
                />
              ))}
            </div>
          )}

          {question === "type" && (
            <div role="radiogroup" aria-label="Which kind of formula?" className="mx-auto grid max-w-[880px] gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <OptionCard selected={answers.type === null} onClick={() => setAnswers({ ...answers, type: null })} title="Show me everything" note="Any kind of formula" />
              {types.map((type) => (
                <OptionCard key={type} selected={answers.type === type} onClick={() => setAnswers({ ...answers, type })} title={type} />
              ))}
            </div>
          )}

          {question === "concerns" && (
            <div className="mx-auto max-w-[880px]">
              <div role="group" aria-label="Concerns" className="flex flex-wrap justify-center gap-2">
                {areaConcerns.map((concern) => {
                  const on = answers.concerns.includes(concern.slug);
                  const tint = TINT[concernTint(concern)];
                  return (
                    <button
                      key={concern.slug}
                      type="button"
                      role="checkbox"
                      aria-checked={on}
                      onClick={() =>
                        setAnswers({
                          ...answers,
                          concerns: on ? answers.concerns.filter((slug) => slug !== concern.slug) : [...answers.concerns, concern.slug],
                        })
                      }
                      className={clsx(
                        "glass flex items-center gap-2 rounded-full px-5 py-3 text-[15px] font-medium transition hover:-translate-y-0.5",
                        tint.glass,
                        on ? "text-midnight-deep ring-2 ring-[#5E4B8A]" : tint.text,
                      )}
                    >
                      <span className="relative z-[2]">{concern.name}</span>
                      {on && <Check size={15} strokeWidth={2.2} className="relative z-[2]" />}
                    </button>
                  );
                })}
              </div>
              <p className="mt-5 text-center text-[13px] text-stone">Choose as many as you like — or none, and we&rsquo;ll suggest our favourites.</p>
            </div>
          )}

          {question === "routine" && (
            <div role="radiogroup" aria-label="Routine" className="mx-auto grid max-w-[880px] gap-3 sm:grid-cols-3">
              {ROUTINES.map((routine) => (
                <OptionCard key={routine.key} selected={answers.routine === routine.key} onClick={() => setAnswers({ ...answers, routine: routine.key })} title={routine.label} note={routine.note} />
              ))}
            </div>
          )}

          {question === "results" && (
            <div>
              {picks.length === 0 ? (
                <div className="glass-strong mx-auto max-w-[620px] rounded-[32px] px-6 py-14 text-center">
                  <p className="relative z-[2] font-display text-[30px] text-midnight">Nothing quite matches yet</p>
                  <p className="relative z-[2] mt-2 text-[15px] text-stone">Try choosing &ldquo;Show me everything&rdquo; or fewer concerns.</p>
                </div>
              ) : answers.routine === "ritual" ? (
                <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {ritual.map(({ step, match }, index) => (
                    <li key={step} className="glass rounded-[28px] p-4">
                      <p className="relative z-[2] flex items-center gap-3 px-1 pb-4">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f6e3c8,#efc3c8_50%,#d6c8ee)] font-display text-[17px] text-midnight-deep">
                          {index + 1}
                        </span>
                        <span className="font-display text-[24px] text-midnight">{ritualStep(match.product).label}</span>
                      </p>
                      <ProductCard product={match.product} />
                      {match.reasons.length > 0 && (
                        <ul className="relative z-[2] mt-3 flex flex-wrap gap-1.5">
                          {match.reasons.map((reason) => (
                            <li key={reason} className="rounded-full bg-white/70 px-3 py-1 text-[12px] text-midnight">
                              {reason}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.9fr)]">
                  {/* Best match */}
                  <div className="glass tint-quartz rounded-[30px] p-4">
                    <p className="relative z-[2] flex items-center gap-2 px-1 pb-4 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8E4F5B]">
                      <Sparkles size={14} strokeWidth={1.8} /> Your best match
                    </p>
                    <ProductCard product={picks[0].product} priority />
                    {picks[0].reasons.length > 0 && (
                      <ul className="relative z-[2] mt-3 flex flex-wrap gap-1.5">
                        {picks[0].reasons.map((reason) => (
                          <li key={reason} className="rounded-full bg-white/75 px-3 py-1 text-[12px] text-midnight">
                            {reason}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {/* Also worth exploring */}
                  {picks.length > 1 && (
                    <div>
                      <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-stone">Also worth exploring</p>
                      <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                        {picks.slice(1).map((match) => (
                          <li key={match.product.id}>
                            <ProductCard product={match.product} />
                            {match.reasons[0] && <p className="mt-2 text-[12px] text-stone">{match.reasons[0]}</p>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {picks.length > 0 && (
                <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                  <button type="button" onClick={addAll} className="btn-champagne !px-8 !py-3.5">
                    <ShoppingBag size={15} strokeWidth={1.6} />
                    {answers.routine === "ritual" ? "Add the full ritual" : `Add all ${picks.length}`} ·{" "}
                    {formatPrice(picks.reduce((sum, match) => sum + (match.product.variants[0]?.price ?? 0), 0))}
                  </button>
                  <button type="button" onClick={share} className="btn-glass !px-7 !py-3.5">
                    {copied ? <Check size={15} strokeWidth={1.8} /> : <Link2 size={15} strokeWidth={1.6} />} {copied ? "Link copied" : "Share these results"}
                  </button>
                  <button type="button" onClick={restart} className="btn-glass !px-7 !py-3.5">
                    <RotateCcw size={15} strokeWidth={1.6} /> Start again
                  </button>
                  {area && (
                    <Link href={`/collections/${area.collections[0]}`} className="px-3 text-[13px] font-semibold text-[#5E4B8A] underline-offset-4 hover:underline">
                      See all {area.key === "gift" ? "gift sets" : `${area.key} care`}
                    </Link>
                  )}
                </div>
              )}
              <p className="mx-auto mt-8 max-w-[620px] text-center text-[12px] leading-[1.7] text-stone">
                Suggestions are based on what each formula was designed for. The finder is a guide to discovery — it
                doesn&rsquo;t diagnose or treat any medical condition. For skin or scalp concerns, please speak to a
                dermatologist.
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      {question !== "results" && (
        <div className="mx-auto mt-10 flex max-w-[880px] items-center justify-between">
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={position === 0}
            className="btn-glass !px-6 !py-3 !text-[11px] disabled:pointer-events-none disabled:opacity-0"
          >
            <ArrowLeft size={14} strokeWidth={1.6} /> Back
          </button>
          <button type="button" onClick={() => go(1)} disabled={!canContinue} className="btn-primary !px-8 !py-3.5 disabled:cursor-not-allowed disabled:opacity-50">
            {flow[position + 1] === "results" ? (
              <>
                {answers.area === "gift" ? <Gift size={15} strokeWidth={1.6} /> : <Sparkles size={15} strokeWidth={1.6} />} Show my ritual
              </>
            ) : (
              <>
                Next <ArrowRight size={14} strokeWidth={1.6} />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
