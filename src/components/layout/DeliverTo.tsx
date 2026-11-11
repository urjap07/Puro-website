"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { Check, Globe2, Loader2, MapPin, Truck, X } from "lucide-react";
import {
  COUNTRIES,
  DELIVERY_ZONES,
  type Destination,
  deliveryWindow,
  destinationLabel,
  isIndia,
  lookupPincode,
  pincodeProblem,
  useDeliveryEstimate,
  useDestination,
  zoneFor,
} from "@/lib/delivery";

type Tab = "india" | "abroad";
type Status =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "error"; message: string }
  | { kind: "saved"; destination: Destination; note?: string };

const CLOSE_AFTER_MS = 1600;

/** "Deliver to" picker: an Indian pincode (checked with India Post) or a country abroad. */
export default function DeliverTo({ compact = false }: { compact?: boolean }) {
  const { destination } = useDeliveryEstimate();
  const setDestination = useDestination((state) => state.setDestination);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("india");
  const [pincode, setPincode] = useState("");
  const [country, setCountry] = useState(COUNTRIES[0].code);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const box = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fill the form from the saved destination each time the panel opens.
  useEffect(() => {
    if (!open) return;
    setStatus({ kind: "idle" });
    if (destination && isIndia(destination)) {
      setTab("india");
      setPincode(destination.pincode);
    } else if (destination) {
      setTab("abroad");
      setCountry(destination.country);
    }
    const onDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!box.current?.contains(target) && !panel.current?.contains(target)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
    // Only when opening; later destination changes come from this panel.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const save = (next: Destination, note?: string) => {
    setDestination(next);
    setStatus({ kind: "saved", destination: next, note });
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), note ? CLOSE_AFTER_MS * 2 : CLOSE_AFTER_MS);
  };

  const checkPincode = async () => {
    const value = pincode.trim();
    const problem = pincodeProblem(value);
    if (problem) return setStatus({ kind: "error", message: problem });
    setStatus({ kind: "checking" });
    const result = await lookupPincode(value);
    if (result.status === "ok") {
      save({ country: "IN", pincode: value, district: result.district, state: result.state });
    } else if (result.status === "unavailable") {
      // Don't block shoppers when India Post is down; the format is right.
      save(
        { country: "IN", pincode: value, district: null, state: null },
        "We couldn’t confirm this pincode with India Post just now, so dates are an estimate.",
      );
    } else {
      setStatus({ kind: "error", message: `We couldn’t find ${value}. Please check the number.` });
    }
  };

  // On phones the department strip sits beneath the sticky header, so the
  // panel is rendered at page level to float above both.
  const portal = (node: ReactNode) => (compact && typeof document !== "undefined" ? createPortal(node, document.body) : node);

  const label = destination ? destinationLabel(destination) : null;
  const typedProblem = pincode.length === 6 ? pincodeProblem(pincode) : null;
  const errorMessage = status.kind === "error" ? status.message : typedProblem;

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={clsx(
          "flex items-center gap-2 text-left text-ivory transition hover:text-gold-soft",
          compact ? "whitespace-nowrap py-2 pr-2 text-[13px]" : "rounded-full px-3 py-1.5 hover:bg-ivory/[0.06]",
        )}
      >
        <MapPin size={compact ? 15 : 19} strokeWidth={1.3} className="shrink-0 text-gold-soft" />
        {compact ? (
          <span>
            Deliver to <strong className="font-semibold">{label ?? "your pincode"}</strong>
          </span>
        ) : (
          <span className="leading-tight">
            <span className="block text-[11px] text-ivory/60">Deliver to</span>
            <span className="block max-w-[150px] truncate text-[14px] font-semibold">{label ?? "Add pincode"}</span>
          </span>
        )}
      </button>

      {portal(
      <AnimatePresence>
        {open && (
          <>
            {compact && (
              <motion.div
                className="fixed inset-0 z-[89] bg-ink/40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOpen(false)}
              />
            )}
            <motion.div
              ref={panel}
              role="dialog"
              aria-label="Choose where to deliver"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className={clsx(
                "z-[70] rounded-[22px] border border-ink/10 bg-ivory p-5 text-ink shadow-[0_30px_60px_-20px_rgba(0,0,0,0.45)]",
                // On phones the department strip scrolls sideways and would clip
                // a dropdown, so the panel floats over the page instead.
                compact ? "fixed z-[90] inset-x-4 top-20 mx-auto max-w-[380px]" : "absolute left-0 top-[calc(100%+10px)] w-[360px]",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-display text-[26px] leading-tight">Where should we deliver?</p>
                <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-stone hover:bg-mist hover:text-ink">
                  <X size={16} strokeWidth={1.4} />
                </button>
              </div>

              {/* India / abroad */}
              <div className="mt-4 grid grid-cols-2 rounded-full bg-mist p-1 text-[13px] font-semibold">
                {(
                  [
                    ["india", "Within India", MapPin],
                    ["abroad", "Outside India", Globe2],
                  ] as const
                ).map(([id, text, Icon]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setTab(id);
                      setStatus({ kind: "idle" });
                    }}
                    className={clsx(
                      "flex items-center justify-center gap-1.5 rounded-full py-2 transition",
                      tab === id ? "bg-emerald text-ivory shadow-sm" : "text-stone hover:text-ink",
                    )}
                  >
                    <Icon size={14} strokeWidth={1.6} /> {text}
                  </button>
                ))}
              </div>

              {tab === "india" ? (
                <form
                  className="mt-4"
                  noValidate
                  onSubmit={(event) => {
                    event.preventDefault();
                    void checkPincode();
                  }}
                >
                  <div className="flex gap-2">
                    <input
                      value={pincode}
                      onChange={(event) => {
                        setPincode(event.target.value.replace(/\D/g, "").slice(0, 6));
                        setStatus({ kind: "idle" });
                      }}
                      inputMode="numeric"
                      autoComplete="postal-code"
                      placeholder="6-digit pincode"
                      aria-label="Pincode"
                      aria-invalid={Boolean(errorMessage)}
                      autoFocus
                      className={clsx(
                        "h-11 min-w-0 flex-1 rounded-full border bg-mist px-4 text-[15px] tracking-[0.12em] outline-none focus:border-emerald",
                        errorMessage ? "border-rose-600" : "border-ink/15",
                      )}
                    />
                    <button
                      type="submit"
                      disabled={status.kind === "checking"}
                      className="flex min-w-[92px] items-center justify-center rounded-full bg-emerald px-5 text-[12px] font-medium uppercase tracking-[0.16em] text-ivory hover:bg-ink disabled:opacity-70"
                    >
                      {status.kind === "checking" ? <Loader2 size={16} className="animate-spin" aria-label="Checking" /> : "Apply"}
                    </button>
                  </div>
                  {errorMessage && <p className="mt-2 text-[13px] text-rose-700">{errorMessage}</p>}
                </form>
              ) : (
                <form
                  className="mt-4 flex gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    save({ country });
                  }}
                >
                  <select
                    value={country}
                    onChange={(event) => {
                      setCountry(event.target.value);
                      setStatus({ kind: "idle" });
                    }}
                    aria-label="Country"
                    className="h-11 min-w-0 flex-1 cursor-pointer rounded-full border border-ink/15 bg-mist px-4 text-[15px] outline-none focus:border-emerald"
                  >
                    {COUNTRIES.map((option) => (
                      <option key={option.code} value={option.code}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                  <button type="submit" className="rounded-full bg-emerald px-5 text-[12px] font-medium uppercase tracking-[0.16em] text-ivory hover:bg-ink">
                    Apply
                  </button>
                </form>
              )}

              {status.kind === "saved" && <SavedNote destination={status.destination} note={status.note} />}

              {/* How long each region takes */}
              <ul className="mt-4 space-y-1.5 rounded-[14px] bg-mist px-3.5 py-3 text-[13px] text-stone">
                {Object.values(DELIVERY_ZONES).map((zone) => (
                  <li key={zone.id} className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2">
                      <Truck size={14} strokeWidth={1.4} className="text-emerald" />
                      {zone.label}
                    </span>
                    <span className="font-medium text-ink">
                      {zone.min}–{zone.max} days
                    </span>
                  </li>
                ))}
                <li className="border-t border-ink/10 pt-1.5 text-[12px]">Free delivery in India on orders over ₹500.</li>
              </ul>

              {destination && status.kind !== "saved" && (
                <button
                  type="button"
                  onClick={() => {
                    setDestination(null);
                    setPincode("");
                    setStatus({ kind: "idle" });
                  }}
                  className="mt-3 text-[12px] text-stone underline underline-offset-4 hover:text-ink"
                >
                  Clear saved location
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>,
      )}
    </div>
  );
}

function SavedNote({ destination, note }: { destination: Destination; note?: string }) {
  const zone = zoneFor(destination);
  const place =
    !isIndia(destination)
      ? destinationLabel(destination)
      : destination.district
        ? `${destination.district}, ${destination.state} ${destination.pincode}`
        : destination.pincode;
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 rounded-[14px] border border-emerald/20 bg-emerald/[0.06] px-3.5 py-2.5 text-[13px]"
      role="status"
    >
      <p className="flex items-start gap-2 text-ink">
        <Check size={15} strokeWidth={2} className="mt-0.5 shrink-0 text-emerald" />
        <span>
          Delivering to <strong className="font-semibold">{place}</strong>
          <span className="block text-stone">
            Arrives <strong className="font-semibold text-ink">{deliveryWindow(zone)}</strong> ({zone.min}–{zone.max} days)
          </span>
        </span>
      </p>
      {note && <p className="mt-1.5 text-[12px] text-stone">{note}</p>}
    </motion.div>
  );
}
