const CLAIMS = [
  "Cruelty-free (PETA)",
  "Dermatologically tested",
  "GMP certified",
  "Non-toxic",
  "Ethical inside out",
  "Rooted in age-old wisdom",
];

export default function TrustMarquee() {
  // Duplicated once so the -50% keyframe loops seamlessly.
  const row = [...CLAIMS, ...CLAIMS];

  return (
    <div className="overflow-hidden border-b border-line bg-mist-deep py-5" aria-label="Our promises">
      <div className="flex w-max animate-marquee motion-reduce:animate-none">
        {row.map((claim, index) => (
          <span
            key={index}
            aria-hidden={index >= CLAIMS.length}
            className="flex items-center whitespace-nowrap px-8 font-display text-[19px] italic text-emerald"
          >
            {claim}
            <span className="ml-16 text-[9px] not-italic text-gold">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
