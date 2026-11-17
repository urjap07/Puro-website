"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/** The order number, large, with a one-tap copy button. */
export default function CopyOrderNumber({ number }: { number: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard blocked: the number is still on screen to copy by hand.
    }
  };
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <span className="select-all rounded-full bg-white/80 px-5 py-2.5 font-mono text-[22px] font-semibold tracking-[0.08em] text-midnight shadow-[inset_0_1px_0_rgba(255,255,255,1),0_10px_24px_-16px_rgba(14,39,42,0.5)] sm:text-[26px]">
        {number}
      </span>
      <button type="button" onClick={copy} className="btn-glass !px-5 !py-2.5 !text-[11px]" aria-live="polite">
        {copied ? <Check size={14} strokeWidth={1.8} /> : <Copy size={14} strokeWidth={1.6} />} {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
