import { BadgeCheck, FlaskConical, HandHeart, Rabbit, Truck } from "lucide-react";

const PROMISES = [
  { icon: Truck, title: "Free delivery over ₹500", text: "Across India in 4–10 days" },
  { icon: Rabbit, title: "Cruelty-free", text: "PETA certified" },
  { icon: FlaskConical, title: "Dermatologically tested", text: "Gentle on every skin" },
  { icon: BadgeCheck, title: "GMP certified", text: "Made with care" },
  { icon: HandHeart, title: "Gives back", text: "Every purchase supports a woman" },
];

/** Why shop with Puro — a row of promises. */
export default function PromiseStrip() {
  return (
    <section className="container-site">
      <ul className="no-scrollbar flex snap-x gap-2 overflow-x-auto rounded-[28px] bg-ivory p-3 shadow-[0_30px_60px_-46px_rgba(6,48,58,0.6)] ring-1 ring-ink/[0.06] sm:grid sm:grid-cols-3 sm:gap-3 sm:overflow-visible sm:p-5 lg:grid-cols-5">
        {PROMISES.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex w-[230px] shrink-0 snap-start items-center gap-3 rounded-[18px] p-3 transition hover:bg-mist sm:w-auto">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#e6f3f2] to-[#cfe6e4] text-emerald">
              <Icon size={21} strokeWidth={1.3} />
            </span>
            <span>
              <span className="block text-[14px] font-semibold leading-tight text-ink">{title}</span>
              <span className="block text-[13px] text-stone">{text}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
