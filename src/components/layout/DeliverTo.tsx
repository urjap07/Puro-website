"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { MapPin, Truck } from "lucide-react";
import { deliveryWindow, isValidPincode, usePincode } from "@/lib/delivery";

/** "Deliver to" pincode picker; the pincode is remembered for delivery dates. */
export default function DeliverTo({ compact = false }: { compact?: boolean }) {
  const pincode = usePincode((state) => state.pincode);
  const setPincode = usePincode((state) => state.setPincode);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    usePincode.persist.rehydrate();
  }, []);
  useEffect(() => {
    if (!open) return;
    setValue(pincode ?? "");
    const onDown = (event: MouseEvent) => box.current && !box.current.contains(event.target as Node) && setOpen(false);
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, pincode]);

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={clsx(
          "flex items-center gap-2 text-left text-ivory transition hover:text-gold-soft",
          compact ? "whitespace-nowrap py-2 pr-2 text-[13px]" : "rounded-full px-3 py-1.5 hover:bg-ivory/[0.06]",
        )}
      >
        <MapPin size={compact ? 15 : 19} strokeWidth={1.3} className="shrink-0 text-gold-soft" />
        {compact ? (
          <span>
            Deliver to <strong className="font-semibold">{pincode ?? "your pincode"}</strong>
          </span>
        ) : (
          <span className="leading-tight">
            <span className="block text-[11px] text-ivory/60">Deliver to</span>
            <span className="block text-[14px] font-semibold">{pincode ?? "Add pincode"}</span>
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 top-[calc(100%+10px)] z-[70] w-[300px] rounded-[22px] border border-ink/10 bg-ivory p-5 text-ink shadow-[0_30px_60px_-20px_rgba(0,0,0,0.45)]"
          >
            <p className="font-display text-[24px] leading-tight">Where should we deliver?</p>
            <p className="mt-1 text-[13px] text-stone">Enter your pincode to see delivery dates.</p>
            <form
              className="mt-4 flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                if (!isValidPincode(value)) return setError(true);
                setPincode(value.trim());
                setError(false);
                setOpen(false);
              }}
            >
              <input
                value={value}
                onChange={(event) => {
                  setValue(event.target.value.replace(/\D/g, "").slice(0, 6));
                  setError(false);
                }}
                inputMode="numeric"
                placeholder="6-digit pincode"
                aria-label="Pincode"
                className={clsx(
                  "h-11 min-w-0 flex-1 rounded-full border bg-mist px-4 text-[15px] outline-none focus:border-emerald",
                  error ? "border-rose-600" : "border-ink/15",
                )}
              />
              <button type="submit" className="rounded-full bg-emerald px-5 text-[12px] font-medium uppercase tracking-[0.16em] text-ivory hover:bg-ink">
                Apply
              </button>
            </form>
            {error && <p className="mt-2 text-[12px] text-rose-700">Please enter a valid 6-digit pincode.</p>}
            <p className="mt-4 flex items-start gap-2 rounded-[14px] bg-mist px-3 py-2.5 text-[13px] text-stone">
              <Truck size={15} strokeWidth={1.3} className="mt-0.5 shrink-0 text-emerald" />
              <span>
                Delivered in 4–7 days — <strong className="font-semibold text-ink">{deliveryWindow()}</strong>. Free over ₹500.
              </span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
