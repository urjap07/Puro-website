/** Shown when a product has no photography yet (e.g. Buzz Knight). */
export default function ImagePlaceholder({ name }: { name: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald p-8 text-center">
      <div className="absolute inset-4 border border-gold/40" />
      <p className="text-[9px] uppercase tracking-[0.4em] text-gold-soft">Puro Body &amp; Soul</p>
      <p className="mt-5 max-w-[220px] font-display text-[28px] font-light leading-tight text-ivory">
        {name}
      </p>
      <p className="ornament mt-6 text-[8px]">◆</p>
    </div>
  );
}
