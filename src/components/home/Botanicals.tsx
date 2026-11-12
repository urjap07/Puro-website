/**
 * Botanical artwork drawn in SVG, echoing the leaves printed on PURO packs.
 * Used as soft shadows falling across the hero, and as fine champagne
 * line-art that drifts around the product.
 */

type Props = { className?: string; style?: React.CSSProperties; variant?: "shadow" | "line" };

function paint(variant: Props["variant"]) {
  return variant === "line"
    ? { fill: "none", stroke: "currentColor", strokeWidth: 1.1, vectorEffect: "non-scaling-stroke" as const }
    : { fill: "currentColor", stroke: "none" };
}

/** A palm frond: a curved stem with tapering leaflets. */
export function Frond({ className, style, variant = "shadow" }: Props) {
  const leaflets = Array.from({ length: 14 }, (_, i) => {
    const t = i / 13;
    // point along the stem (quadratic curve)
    const x = 20 + 260 * t;
    const y = 300 - 250 * t + 60 * t * t;
    const length = 120 * Math.sin(Math.PI * (0.15 + 0.8 * t)) + 20;
    const angle = -55 + 20 * t;
    return { x, y, length, angle, i };
  });
  const p = paint(variant);
  return (
    <svg viewBox="0 0 340 340" className={className} style={style} aria-hidden="true">
      <path d="M20 300 Q 150 120 280 110" {...p} fill="none" stroke="currentColor" strokeWidth={variant === "line" ? 1.1 : 3} />
      {leaflets.map(({ x, y, length, angle, i }) =>
        [1, -1].map((side) => (
          <g key={`${i}-${side}`} transform={`translate(${x} ${y}) rotate(${angle + side * 62})`}>
            <path d={`M0 0 C ${length * 0.35} -${length * 0.09}, ${length * 0.75} -${length * 0.07}, ${length} 0 C ${length * 0.75} ${length * 0.06}, ${length * 0.35} ${length * 0.08}, 0 0 Z`} {...p} />
          </g>
        )),
      )}
    </svg>
  );
}

/** A broad leaf with a midrib and veins. */
export function Leaf({ className, style, variant = "shadow" }: Props) {
  const p = paint(variant);
  const veins = Array.from({ length: 7 }, (_, i) => {
    const y = 40 + i * 32;
    const w = 70 * Math.sin(Math.PI * ((i + 1) / 8));
    return (
      <g key={i}>
        <path d={`M100 ${y + 18} Q ${100 - w * 0.6} ${y + 4} ${100 - w} ${y - 10}`} {...paint("line")} />
        <path d={`M100 ${y + 18} Q ${100 + w * 0.6} ${y + 4} ${100 + w} ${y - 10}`} {...paint("line")} />
      </g>
    );
  });
  return (
    <svg viewBox="0 0 200 300" className={className} style={style} aria-hidden="true">
      <path d="M100 8 C 175 60, 190 180, 100 292 C 10 180, 25 60, 100 8 Z" {...p} />
      {variant === "line" && (
        <>
          <path d="M100 20 L100 292" {...p} />
          {veins}
        </>
      )}
    </svg>
  );
}
