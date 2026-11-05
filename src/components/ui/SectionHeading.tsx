import clsx from "clsx";
import type { ReactNode } from "react";
import Reveal from "./Reveal";

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "center" | "left";
  tone?: "dark" | "light";
  className?: string;
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  tone = "dark",
  className,
}: SectionHeadingProps) {
  const light = tone === "light";

  return (
    <Reveal
      className={clsx(
        align === "center" ? "mx-auto text-center" : "text-left",
        "max-w-[720px]",
        className
      )}
    >
      {eyebrow && (
        <p className={clsx("eyebrow", light && "text-gold-soft")}>{eyebrow}</p>
      )}
      <h2
        className={clsx(
          "heading-lg mt-5",
          light ? "text-ivory" : "text-emerald"
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={clsx(
            "mt-5 text-[15px] leading-[1.85]",
            align === "center" && "mx-auto max-w-[540px]",
            light ? "text-ivory/70" : "text-stone"
          )}
        >
          {description}
        </p>
      )}
    </Reveal>
  );
}
