"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { Loader2, X } from "lucide-react";
import { type Address, type AddressInput, AddressSchema, INDIAN_STATES } from "@/lib/account-schema";
import { useAccount } from "@/lib/account-store";
import { lookupPincode, zoneFor } from "@/lib/delivery";

/* Shared form styling and helpers (also used by the account page). */
export const field =
  "mt-1.5 h-12 w-full rounded-[16px] bg-white/70 px-4 text-[15px] text-midnight shadow-[inset_0_1px_2px_rgba(14,39,42,0.08),inset_0_0_0_1px_rgba(255,255,255,0.75)] outline-none transition placeholder:text-stone/60 focus:bg-white/90 focus:ring-2 focus:ring-[#5E4B8A]/50";
export const labelText =
  "text-[12px] font-semibold uppercase tracking-[0.16em] text-midnight";

export type Errors = Partial<Record<string, string>>;

export function errorsFrom(
  issues: { path: PropertyKey[]; message: string }[],
): Errors {
  const out: Errors = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "");
    out[key] ??= issue.message;
  }
  return out;
}

export function FieldError({ message, id }: { message?: string; id: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1 text-[12px] font-medium text-[#8E4F5B]">
      {message}
    </p>
  );
}


const BLANK: AddressInput = {
  label: "Home",
  fullName: "",
  phone: "",
  line1: "",
  landmark: "",
  city: "",
  state: "Maharashtra",
  pincode: "",
};

/**
 * Add or edit a delivery address. Checks the pincode with India Post as it's
 * typed, fills in the city and state, and saves to the address book on this
 * device. Used on the account page and at checkout.
 */
export default function AddressForm({
  initial,
  onDone,
}: {
  initial?: Address;
  onDone: (saved?: Address) => void;
}) {
  const profile = useAccount((state) => state.profile);
  const saveAddress = useAccount((state) => state.saveAddress);
  const [draft, setDraft] = useState<AddressInput>(() =>
    initial
      ? { ...initial, landmark: initial.landmark ?? "" }
      : { ...BLANK, fullName: profile.name, phone: profile.phone },
  );
  const [errors, setErrors] = useState<Errors>({});
  const [pin, setPin] = useState<{
    state: "idle" | "checking" | "ok" | "not_found" | "unavailable";
    zone?: string;
  }>({ state: "idle" });

  // Check the pincode with India Post as soon as all six digits are in.
  useEffect(() => {
    if (!/^[1-8]\d{5}$/.test(draft.pincode)) {
      setPin({ state: "idle" });
      return;
    }
    let live = true;
    setPin({ state: "checking" });
    lookupPincode(draft.pincode).then((result) => {
      if (!live) return;
      if (result.status === "ok") {
        const zone = zoneFor({
          country: "IN",
          pincode: draft.pincode,
          district: result.district,
          state: result.state,
        });
        setPin({
          state: "ok",
          zone: `${zone.label} · delivered in ${zone.min}–${zone.max} days`,
        });
        const state = INDIAN_STATES.find(
          (name) => name.toLowerCase() === result.state.toLowerCase(),
        );
        setDraft((current) => ({
          ...current,
          city: current.city || result.district,
          state: state ?? current.state,
        }));
      } else {
        setPin({
          state: result.status === "unavailable" ? "unavailable" : "not_found",
        });
      }
    });
    return () => {
      live = false;
    };
  }, [draft.pincode]);

  const set =
    (key: keyof AddressInput) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setDraft({ ...draft, [key]: event.target.value } as AddressInput);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const result = AddressSchema.safeParse(draft);
    const problems = result.success ? {} : errorsFrom(result.error.issues);
    if (pin.state === "not_found")
      problems.pincode = "India Post doesn't recognise this pincode.";
    if (Object.keys(problems).length) {
      setErrors(problems);
      return;
    }
    onDone(saveAddress(result.data!, initial?.id));
  };

  const text = (
    key: keyof AddressInput,
    label: string,
    autoComplete: string,
    extra?: string,
    props?: React.InputHTMLAttributes<HTMLInputElement>,
  ) => (
    <div className={extra}>
      <label className="block">
        <span className={labelText}>{label}</span>
        <input
          value={(draft[key] as string) ?? ""}
          onChange={set(key)}
          autoComplete={autoComplete}
          aria-invalid={Boolean(errors[key])}
          aria-describedby={errors[key] ? `address-${key}-error` : undefined}
          className={field}
          {...props}
        />
      </label>
      <FieldError id={`address-${key}-error`} message={errors[key]} />
    </div>
  );

  return (
    <form
      onSubmit={submit}
      noValidate
      className="glass-strong mt-5 rounded-[28px] p-5 sm:p-6"
    >
      <div className="flex items-center justify-between">
        <p className="font-display text-[24px] text-midnight">
          {initial ? "Edit address" : "New address"}
        </p>
        <button
          type="button"
          onClick={() => onDone()}
          aria-label="Cancel"
          className="btn-glass h-10 w-10 !p-0"
        >
          <X size={16} strokeWidth={1.5} />
        </button>
      </div>

      <fieldset className="mt-4">
        <legend className={labelText}>Save as</legend>
        <div className="mt-2 flex gap-2">
          {(["Home", "Work", "Other"] as const).map((label) => (
            <button
              key={label}
              type="button"
              aria-pressed={draft.label === label}
              onClick={() => setDraft({ ...draft, label })}
              className={clsx(
                "rounded-full px-4 py-2 text-[13px] font-medium transition",
                draft.label === label
                  ? "bg-[linear-gradient(110deg,#f6e3c8,#f2c9c4_35%,#d9c8ec_70%,#bfe2e3)] text-midnight-deep shadow-[inset_0_1px_0_rgba(255,255,255,1)] ring-1 ring-white"
                  : "bg-white/55 text-graphite ring-1 ring-inset ring-white/80 hover:bg-white/80",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {text("fullName", "Recipient's name", "name")}
        {text("phone", "Mobile", "tel-national", undefined, {
          type: "tel",
          inputMode: "tel",
        })}
        {text("line1", "House, flat, street", "address-line1", "sm:col-span-2")}
        {text(
          "landmark",
          "Landmark (optional)",
          "address-line2",
          "sm:col-span-2",
        )}
        <div>
          <label className="block">
            <span className={labelText}>Pincode</span>
            <span className="relative block">
              <input
                value={draft.pincode}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    pincode: event.target.value.replace(/\D/g, "").slice(0, 6),
                  })
                }
                autoComplete="postal-code"
                inputMode="numeric"
                aria-invalid={Boolean(errors.pincode)}
                aria-describedby="address-pincode-status"
                className={field}
              />
              {pin.state === "checking" && (
                <Loader2
                  size={16}
                  className="absolute right-4 top-1/2 mt-[3px] -translate-y-1/2 animate-spin text-stone motion-reduce:animate-none"
                />
              )}
            </span>
          </label>
          <span
            id="address-pincode-status"
            aria-live="polite"
            className="mt-1 block text-[12px]"
          >
            {errors.pincode ? (
              <span className="font-medium text-[#8E4F5B]">
                {errors.pincode}
              </span>
            ) : pin.state === "ok" ? (
              <span className="text-[#2C6468]">{pin.zone}</span>
            ) : pin.state === "not_found" ? (
              <span className="font-medium text-[#8E4F5B]">
                India Post doesn&rsquo;t recognise this pincode.
              </span>
            ) : pin.state === "unavailable" ? (
              <span className="text-stone">
                Couldn&rsquo;t check this pincode right now — you can still save
                it.
              </span>
            ) : null}
          </span>
        </div>
        {text("city", "City / district", "address-level2")}
        <div className="sm:col-span-2">
          <label className="block">
            <span className={labelText}>State</span>
            <select
              value={draft.state}
              onChange={set("state")}
              autoComplete="address-level1"
              className={clsx(field, "cursor-pointer appearance-none")}
            >
              {INDIAN_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </label>
          <FieldError id="address-state-error" message={errors.state} />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button type="submit" className="btn-primary !px-8 !py-3.5">
          {initial ? "Save changes" : "Save address"}
        </button>
        <button
          type="button"
          onClick={() => onDone()}
          className="btn-glass !px-8 !py-3.5"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

