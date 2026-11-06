import clsx from "clsx";
import type { ReactNode } from "react";

/** Retired cursor spotlight: now a plain wrapper. */
export default function Spotlight({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx("relative", className)}>{children}</div>;
}
