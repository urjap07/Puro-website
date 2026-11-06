import clsx from "clsx";
import type { ReactNode } from "react";

interface GildedArchProps {
  children: ReactNode;
  /** Size and aspect of the frame, e.g. "w-full aspect-[4/5]". */
  className?: string;
  /** Classes for the inner field behind the image (e.g. a parchment fill). */
  innerClassName?: string;
  frame?: "thin" | "regular";
}

/**
 * Plain image frame (the gilded arch has been retired). Kept under its old
 * name so pages not yet redesigned keep working.
 */
export default function GildedArch({ children, className, innerClassName }: GildedArchProps) {
  return (
    <div className={clsx(!/\b(absolute|fixed)\b/.test(className ?? "") && "relative", "overflow-hidden", className)}>
      <div className={clsx("absolute inset-0 overflow-hidden", innerClassName)}>{children}</div>
    </div>
  );
}
