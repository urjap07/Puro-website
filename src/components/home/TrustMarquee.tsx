const CLAIMS = [
  "Cruelty-free, PETA certified",
  "Dermatologically tested",
  "Made in a GMP-certified facility",
  "Non-toxic botanicals",
  "Every purchase supports a woman",
  "Rooted in age-old wisdom",
];

/** Slow ribbon of promises in large italic serif. */
export default function TrustMarquee() {
  const row = [...CLAIMS, ...CLAIMS]; // duplicated so the -50% keyframe loops seamlessly

  return (
    <div className="bg-pearl-warm border-y border-line py-7" aria-label="Our promises">
      <div className="flex w-max animate-marquee-slow motion-reduce:animate-none">
        {row.map((claim, index) => (
          <span
            key={index}
            aria-hidden={index >= CLAIMS.length}
            className="flex items-center whitespace-nowrap px-10 font-display text-[28px] italic text-emerald sm:text-[34px]"
          >
            {claim}
            <span className="ml-20 h-1.5 w-1.5 rounded-full bg-gold" />
          </span>
        ))}
      </div>
    </div>
  );
}
