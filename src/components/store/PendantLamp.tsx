import clsx from "clsx";

/** A brass-and-glass pendant lamp with a soft pool of light beneath it. */
export default function PendantLamp({ className, cord = 90, glow = true }: { className?: string; cord?: number; glow?: boolean }) {
  return (
    <div aria-hidden="true" className={clsx("pointer-events-none absolute flex flex-col items-center", className)}>
      <span className="w-px bg-gradient-to-b from-black/60 to-black/80" style={{ height: cord }} />
      <svg viewBox="0 0 120 70" className="relative z-10 w-[92px] drop-shadow-[0_10px_14px_rgba(0,0,0,0.45)] sm:w-[120px]">
        <defs>
          <linearGradient id="lamp-shade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#6e1f1c" />
            <stop offset="0.45" stopColor="#a8352c" />
            <stop offset="0.7" stopColor="#8b2a24" />
            <stop offset="1" stopColor="#5a1816" />
          </linearGradient>
          <radialGradient id="lamp-bulb" cx="0.5" cy="0.2" r="0.7">
            <stop offset="0" stopColor="#fff8e6" />
            <stop offset="1" stopColor="#f3c979" />
          </radialGradient>
        </defs>
        <rect x="55" y="0" width="10" height="12" rx="2" fill="#b08d57" />
        <path d="M60 10 C 30 12, 12 34, 8 56 L 112 56 C 108 34, 90 12, 60 10 Z" fill="url(#lamp-shade)" />
        <path d="M20 30 C 30 20, 45 15, 58 14" stroke="#fff" strokeOpacity="0.35" strokeWidth="2" fill="none" strokeLinecap="round" />
        <ellipse cx="60" cy="56" rx="52" ry="6" fill="#4a1412" />
        <ellipse cx="60" cy="57" rx="22" ry="7" fill="url(#lamp-bulb)" />
      </svg>
      {glow && (
        <span className="absolute top-full -mt-2 h-[340px] w-[420px] bg-[radial-gradient(50%_60%_at_50%_0%,rgba(255,226,170,0.32),transparent_70%)] mix-blend-screen" style={{ top: cord + 40 }} />
      )}
    </div>
  );
}
