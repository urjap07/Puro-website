"use client";

import { useEffect } from "react";

/**
 * The light behind the glass. A fixed field of soft, slowly drifting pools of
 * rose quartz, saffron, lilac, aqua and sage sits behind every page,
 * so each glass surface has colour to blur and refract.
 *
 * Also defines the SVG filter used for real edge refraction (.glass-liquid)
 * and switches it on only in Chromium browsers, which can apply SVG filters
 * to the backdrop. Everywhere else the glass stays a clean frosted blur.
 */
export default function LiquidBackdrop() {
  useEffect(() => {
    const brands = (navigator as Navigator & { userAgentData?: { brands?: { brand: string }[] } }).userAgentData?.brands;
    const chromium = brands?.some((b) => /Chromium|Google Chrome|Microsoft Edge/.test(b.brand));
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (chromium && !calm) document.documentElement.dataset.liquid = "";
  }, []);

  const pool = "absolute rounded-full blur-[90px] will-change-transform motion-reduce:!animate-none";

  return (
    <>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-50 overflow-hidden bg-[#faf8f5]">
        {/* Rose quartz, top left */}
        <span
          className={`${pool} -left-[14%] -top-[20%] h-[60vmax] w-[60vmax] bg-[radial-gradient(circle,rgba(233,180,186,0.62),transparent_64%)] animate-[liquid-drift-a_38s_ease-in-out_infinite_alternate]`}
        />
        {/* Saffron and apricot light, top right */}
        <span
          className={`${pool} -right-[16%] -top-[6%] h-[54vmax] w-[54vmax] bg-[radial-gradient(circle,rgba(240,190,110,0.55),rgba(243,201,166,0.3)_40%,transparent_66%)] animate-[liquid-drift-b_44s_ease-in-out_infinite_alternate]`}
        />
        {/* Lilac, lower left */}
        <span
          className={`${pool} -bottom-[24%] left-[6%] h-[58vmax] w-[58vmax] bg-[radial-gradient(circle,rgba(196,176,232,0.62),transparent_64%)] animate-[liquid-drift-b_52s_ease-in-out_infinite_alternate]`}
        />
        {/* Aqua, lower right */}
        <span
          className={`${pool} -bottom-[10%] -right-[8%] h-[46vmax] w-[46vmax] bg-[radial-gradient(circle,rgba(160,214,216,0.6),transparent_64%)] animate-[liquid-drift-a_46s_ease-in-out_infinite_alternate]`}
        />
        {/* Sage, centre */}
        <span
          className={`${pool} left-[34%] top-[30%] h-[34vmax] w-[34vmax] bg-[radial-gradient(circle,rgba(185,205,176,0.45),transparent_64%)] animate-[liquid-drift-a_58s_ease-in-out_infinite_alternate]`}
        />
        {/* A ribbon of pearl light across the middle */}
        <span className="absolute inset-x-0 top-[40%] h-[26vh] bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.55),transparent)] blur-2xl" />
      </div>

      {/* Edge refraction for .glass-liquid (Chromium) */}
      <svg aria-hidden="true" width="0" height="0" className="absolute">
        <filter id="liquid-glass" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.006 0.009" numOctaves="2" seed="5" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="2.5" result="soft" />
          <feDisplacementMap in="SourceGraphic" in2="soft" scale="42" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
    </>
  );
}
