"use client";

import { useId, useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import { destinationLabel, lookupPincode, pincodeProblem, useDestination, type Destination } from "@/lib/delivery";

/**
 * "Delivering to Kolkata 700020 · Change" — shows the remembered delivery
 * pincode and lets the shopper set, change or clear it in place.
 */
export default function DeliverTo({ destination }: { destination: Destination | null }) {
  const id = useId();
  const setDestination = useDestination((state) => state.setDestination);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const pincode = value.replace(/\s+/g, "");
    const problem = pincodeProblem(pincode);
    if (problem) {
      setError(problem);
      return;
    }
    setChecking(true);
    const result = await lookupPincode(pincode);
    setChecking(false);
    if (result.status === "not_found" || result.status === "invalid") {
      setError("We couldn't find that pincode. Please check it and try again.");
      return;
    }
    setDestination(
      result.status === "ok"
        ? { country: "IN", pincode: result.pincode, district: result.district, state: result.state }
        : // India Post unreachable: keep the pincode; dates fall back to a pincode estimate.
          { country: "IN", pincode, district: null, state: null },
    );
    setEditing(false);
    setValue("");
    setError(null);
  };

  if (editing) {
    return (
      <form onSubmit={save} noValidate className="flex flex-col gap-1.5">
        <label htmlFor={`${id}-pin`} className="flex items-center gap-2.5 text-[13px] text-stone">
          <MapPin size={16} strokeWidth={1.4} className="shrink-0 text-midnight-soft" />
          Your delivery pincode
        </label>
        <div className="flex items-center gap-2 pl-[26px]">
          <input
            id={`${id}-pin`}
            autoFocus
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={6}
            value={value}
            onChange={(event) => {
              setValue(event.target.value.replace(/\D/g, "").slice(0, 6));
              setError(null);
            }}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-err` : undefined}
            placeholder="e.g. 400001"
            className="h-10 w-[130px] rounded-full bg-white/75 px-4 text-[15px] tracking-[0.08em] text-midnight outline-none ring-1 ring-inset ring-white/80 focus:ring-2 focus:ring-[#5E4B8A]/50"
          />
          <button type="submit" disabled={checking} className="flex h-10 items-center gap-1.5 rounded-full bg-midnight px-4 text-[12px] font-semibold uppercase tracking-[0.14em] text-ivory disabled:opacity-70">
            {checking && <Loader2 size={13} className="animate-spin" />} Check
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setError(null);
              setValue("");
            }}
            className="px-2 text-[12px] text-stone underline-offset-4 hover:text-midnight hover:underline"
          >
            Cancel
          </button>
        </div>
        <p id={`${id}-err`} aria-live="polite" className="min-h-[1rem] pl-[26px] text-[12px] text-rose-700">
          {error ?? ""}
        </p>
      </form>
    );
  }

  const link = "font-semibold text-[#5E4B8A] underline-offset-4 hover:underline";
  return (
    <p className="flex items-start gap-2.5 text-[13px] text-stone">
      <MapPin size={16} strokeWidth={1.4} className="mt-px shrink-0 text-midnight-soft" />
      <span>
        {destination ? (
          <>
            Delivering to <strong className="font-semibold text-ink">{destinationLabel(destination)}</strong>
            <span className="ml-2 inline-flex gap-2.5 whitespace-nowrap">
              <button type="button" onClick={() => setEditing(true)} className={link}>
                Change
              </button>
              <button type="button" onClick={() => setDestination(null)} className="text-stone underline-offset-4 hover:text-midnight hover:underline">
                Remove
              </button>
            </span>
          </>
        ) : (
          <>
            Add your pincode for exact delivery dates.{" "}
            <button type="button" onClick={() => setEditing(true)} className={`${link} whitespace-nowrap`}>
              Add pincode
            </button>
          </>
        )}
      </span>
    </p>
  );
}
