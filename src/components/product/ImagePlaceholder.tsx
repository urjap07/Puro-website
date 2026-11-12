/** Shown when a product has no photography yet (e.g. Buzz Knight). */
export default function ImagePlaceholder({ name }: { name: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[linear-gradient(135deg,#fbe8d9_0%,#f6e3e4_35%,#ece5f6_70%,#e1f2f2_100%)] p-8 text-center">
      <div className="absolute inset-4 rounded-[18px] border border-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_0_0_1px_rgba(125,104,168,0.12)]" />
      <p className="text-[9px] uppercase tracking-[0.4em] text-[#66532F]">Puro Body &amp; Soul</p>
      <p className="mt-5 max-w-[220px] font-display text-[28px] font-light leading-tight text-midnight">
        {name}
      </p>
      <p className="ornament mt-6 text-[8px]">◆</p>
    </div>
  );
}
