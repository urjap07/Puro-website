import clsx from "clsx";

/** Circular seal with text running around its rim, slowly turning. */
export default function RotatingSeal({ text, className }: { text: string; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={clsx(
        "flex aspect-square items-center justify-center rounded-full bg-emerald text-ivory shadow-[0_30px_60px_-25px_rgba(20,38,30,0.7)]",
        className,
      )}
    >
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full animate-[spin_26s_linear_infinite] motion-reduce:animate-none">
        <defs>
          <path id="seal-circle" d="M100,100 m-76,0 a76,76 0 1,1 152,0 a76,76 0 1,1 -152,0" />
        </defs>
        <text className="fill-current font-sans text-[13px] font-medium uppercase">
          <textPath href="#seal-circle" textLength="472" lengthAdjust="spacing">{text}</textPath>
        </text>
      </svg>
      <span className="font-display italic leading-none">P</span>
    </div>
  );
}
