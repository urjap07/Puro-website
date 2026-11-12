/**
 * Tinted glass "well" behind a product thumbnail, picked from the kind of
 * product the slug names (hair → lilac, hydration → aqua, clays → terracotta…).
 * Purely presentational.
 */
const WELLS = {
  quartz: "bg-[radial-gradient(ellipse_80%_65%_at_50%_42%,#ffffff_0%,#f6e3e4_62%,#e9c3c6_100%)]",
  lilac: "bg-[radial-gradient(ellipse_80%_65%_at_50%_42%,#ffffff_0%,#ece5f6_62%,#cdbde6_100%)]",
  aqua: "bg-[radial-gradient(ellipse_80%_65%_at_50%_42%,#ffffff_0%,#e1f2f2_62%,#b8dee0_100%)]",
  terracotta: "bg-[radial-gradient(ellipse_80%_65%_at_50%_42%,#ffffff_0%,#f4dccb_62%,#dda584_100%)]",
  saffron: "bg-[radial-gradient(ellipse_80%_65%_at_50%_42%,#ffffff_0%,#f8e3b8_62%,#e9b55a_100%)]",
  apricot: "bg-[radial-gradient(ellipse_80%_65%_at_50%_42%,#ffffff_0%,#fbe8d9_62%,#f3c9a6_100%)]",
  sage: "bg-[radial-gradient(ellipse_80%_65%_at_50%_42%,#ffffff_0%,#e3ecdd_62%,#b9cdb0_100%)]",
} as const;

const RULES: [RegExp, keyof typeof WELLS][] = [
  [/hair|tress|scalp/, "lilac"],
  [/aloe/, "sage"],
  [/aqua|hydro|cleanse|wash/, "aqua"],
  [/clay|ubtan/, "terracotta"],
  [/pithi|glow|radiant/, "saffron"],
  [/coco|shea|body|sole|scrub|polish|balm|lotion/, "apricot"],
];

export function wellTint(slug: string) {
  return WELLS[RULES.find(([pattern]) => pattern.test(slug))?.[1] ?? "quartz"];
}

/** Free-delivery progress fill: saffron → quartz → lilac. */
export const PROGRESS_FILL = "bg-[linear-gradient(90deg,#e9b55a_0%,#e9c3c6_55%,#cdbde6_100%)]";
/** Recessed glass track the progress fill sits in. */
export const PROGRESS_TRACK = "bg-white/50 shadow-[inset_0_1px_2px_rgba(14,39,42,0.16),0_1px_0_rgba(255,255,255,0.9)]";
/** Inner ring and lift shared by tinted thumbnail wells. */
export const WELL_SHADOW = "shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_0_0_1px_rgba(255,255,255,0.6),0_10px_20px_-14px_rgba(14,39,42,0.45)]";
