"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  Heart,
  Home,
  Loader2,
  MapPin,
  Package,
  Pencil,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import type { Product } from "@/db/queries/products";
import {
  type Address,
  type AddressInput,
  AddressSchema,
  INDIAN_STATES,
  type Profile,
  ProfileSchema,
  defaultAddress,
  useAccount,
} from "@/lib/account-store";
import { cartCount, cartSubtotal, useCart } from "@/lib/cart-store";
import { useWishlist } from "@/lib/wishlist-store";
import { useRecentlyViewed } from "@/lib/recent-store";
import { lookupPincode, useDestination, zoneFor } from "@/lib/delivery";
import { formatPrice } from "@/lib/format";
import { RecentlyViewedRow } from "@/components/commerce/ProductRow";

const field =
  "mt-1.5 h-12 w-full rounded-[16px] bg-white/70 px-4 text-[15px] text-midnight shadow-[inset_0_1px_2px_rgba(14,39,42,0.08),inset_0_0_0_1px_rgba(255,255,255,0.75)] outline-none transition placeholder:text-stone/60 focus:bg-white/90 focus:ring-2 focus:ring-[#5E4B8A]/50";
const labelText =
  "text-[12px] font-semibold uppercase tracking-[0.16em] text-midnight";

type Errors = Partial<Record<string, string>>;

function errorsFrom(
  issues: { path: PropertyKey[]; message: string }[],
): Errors {
  const out: Errors = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "");
    out[key] ??= issue.message;
  }
  return out;
}

function FieldError({ message, id }: { message?: string; id: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1 text-[12px] font-medium text-[#8E4F5B]">
      {message}
    </p>
  );
}

/** The default address doubles as the delivery destination used for delivery dates. */
function useDefaultAsDestination() {
  const setDestination = useDestination((state) => state.setDestination);
  return (address: Address | null) => {
    if (address)
      setDestination({
        country: "IN",
        pincode: address.pincode,
        district: address.city,
        state: address.state,
      });
  };
}

/* ------------------------------------------------------------------ */

function Overview({ addresses }: { addresses: number }) {
  const items = useCart((state) => state.items);
  const open = useCart((state) => state.open);
  const saved = useWishlist((state) => state.items.length);
  const count = cartCount(items);

  const tiles = [
    {
      key: "bag",
      icon: ShoppingBag,
      title: "Your bag",
      value: count ? `${count} ${count === 1 ? "item" : "items"}` : "Empty",
      note: count ? formatPrice(cartSubtotal(items)) : "Nothing in it yet",
      tint: "tint-saffron",
      href: "/cart",
    },
    {
      key: "wish",
      icon: Heart,
      title: "Wishlist",
      value: `${saved} saved`,
      note: saved ? "Move them to your bag any time" : "Tap a heart to save",
      tint: "tint-quartz",
      href: "/wishlist",
    },
    {
      key: "addr",
      icon: MapPin,
      title: "Addresses",
      value: `${addresses} saved`,
      note: addresses ? "For faster checkout" : "Add one for delivery dates",
      tint: "tint-aqua",
      href: "#addresses",
    },
    {
      key: "orders",
      icon: Package,
      title: "Orders",
      value: "None yet",
      note: "Checkout opens soon",
      tint: "tint-lilac",
      href: "#orders",
    },
  ];

  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {tiles.map(({ key, icon: Icon, title, value, note, tint, href }) => (
        <li key={key}>
          <Link
            href={href}
            onClick={(event) => {
              if (key === "bag" && count) {
                event.preventDefault();
                open();
              }
            }}
            className={clsx(
              "glass glass-hover flex h-full flex-col rounded-[26px] p-4 sm:p-5",
              tint,
            )}
          >
            <span className="relative z-[2] flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/65 text-midnight shadow-[inset_0_1px_0_rgba(255,255,255,1),0_6px_14px_-8px_rgba(14,39,42,0.4)]">
                <Icon size={18} strokeWidth={1.4} />
              </span>
              <ArrowUpRight
                size={16}
                strokeWidth={1.4}
                className="text-stone"
              />
            </span>
            <span className="relative z-[2] mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone">
              {title}
            </span>
            <span className="relative z-[2] mt-1 font-display text-[26px] leading-tight text-midnight sm:text-[30px]">
              {value}
            </span>
            <span className="relative z-[2] mt-1 text-[13px] text-stone">
              {note}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */

function ProfileCard() {
  const profile = useAccount((state) => state.profile);
  const saveProfile = useAccount((state) => state.saveProfile);
  const [draft, setDraft] = useState<Profile>(profile);
  const [errors, setErrors] = useState<Errors>({});
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => setDraft(profile), [profile]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const result = ProfileSchema.safeParse(draft);
    if (!result.success) {
      setErrors(errorsFrom(result.error.issues));
      return;
    }
    setErrors({});
    saveProfile({
      name: result.data.name ?? "",
      email: result.data.email ?? "",
      phone: result.data.phone ?? "",
    });
    setSavedAt(Date.now());
    setTimeout(() => setSavedAt(null), 2400);
  };

  const input = (
    key: keyof Profile,
    label: string,
    type: string,
    autoComplete: string,
    placeholder: string,
  ) => (
    <div>
      <label className="block">
        <span className={labelText}>{label}</span>
        <input
          type={type}
          value={draft[key]}
          onChange={(event) =>
            setDraft({ ...draft, [key]: event.target.value })
          }
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={Boolean(errors[key])}
          aria-describedby={errors[key] ? `profile-${key}-error` : undefined}
          className={field}
        />
      </label>
      <FieldError id={`profile-${key}-error`} message={errors[key]} />
    </div>
  );

  return (
    <section
      aria-labelledby="details-title"
      className="glass-strong rounded-[32px] p-6 sm:p-8"
    >
      <div className="flex items-center gap-3">
        <span className="glass tint-apricot flex h-11 w-11 items-center justify-center rounded-full">
          <UserRound
            size={19}
            strokeWidth={1.4}
            className="relative z-[2] text-midnight"
          />
        </span>
        <h2
          id="details-title"
          className="font-display text-[30px] leading-none text-midnight"
        >
          Your details
        </h2>
      </div>
      <form
        onSubmit={submit}
        noValidate
        className="mt-6 grid gap-4 sm:grid-cols-2"
      >
        <div className="sm:col-span-2">
          {input("name", "Full name", "text", "name", "Your name")}
        </div>
        {input("email", "Email", "email", "email", "you@example.com")}
        {input(
          "phone",
          "Mobile",
          "tel",
          "tel-national",
          "10-digit mobile number",
        )}
        <div className="flex items-center gap-4 sm:col-span-2">
          <button type="submit" className="btn-primary !px-8 !py-3.5">
            Save details
          </button>
          <AnimatePresence>
            {savedAt && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                role="status"
                className="flex items-center gap-1.5 text-[13px] font-medium text-[#45633D]"
              >
                <Check size={15} strokeWidth={2} /> Saved
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </form>
    </section>
  );
}

/* ------------------------------------------------------------------ */

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

function AddressForm({
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

function Addresses() {
  const addresses = useAccount((state) => state.addresses);
  const removeAddress = useAccount((state) => state.removeAddress);
  const setDefault = useAccount((state) => state.setDefault);
  const toDestination = useDefaultAsDestination();
  const [editing, setEditing] = useState<string | "new" | null>(null);

  const finish = (saved?: Address) => {
    setEditing(null);
    if (saved) toDestination(defaultAddress(useAccount.getState().addresses));
  };

  return (
    <section
      id="addresses"
      aria-labelledby="addresses-title"
      className="glass-strong scroll-mt-28 rounded-[32px] p-6 sm:p-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="glass tint-aqua flex h-11 w-11 items-center justify-center rounded-full">
            <MapPin
              size={19}
              strokeWidth={1.4}
              className="relative z-[2] text-midnight"
            />
          </span>
          <h2
            id="addresses-title"
            className="font-display text-[30px] leading-none text-midnight"
          >
            Delivery addresses
          </h2>
        </div>
        {editing === null && (
          <button
            type="button"
            onClick={() => setEditing("new")}
            className="btn-glass !px-5 !py-3 !text-[11px]"
          >
            <Plus size={14} strokeWidth={1.8} /> Add address
          </button>
        )}
      </div>

      {editing === "new" && <AddressForm onDone={finish} />}

      {addresses.length === 0 && editing === null ? (
        <p className="mt-6 text-[15px] leading-7 text-stone">
          No addresses yet. Add one and we&rsquo;ll show delivery dates for it
          across the shop.
        </p>
      ) : (
        <ul className="mt-6 grid gap-3 md:grid-cols-2">
          {addresses.map((address) =>
            editing === address.id ? (
              <li key={address.id} className="md:col-span-2">
                <AddressForm initial={address} onDone={finish} />
              </li>
            ) : (
              <li
                key={address.id}
                className={clsx(
                  "glass flex flex-col rounded-[24px] p-5",
                  address.isDefault ? "tint-aqua" : "",
                )}
              >
                <div className="relative z-[2] flex items-start justify-between gap-3">
                  <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-midnight">
                    <Home size={14} strokeWidth={1.6} /> {address.label}
                  </p>
                  {address.isDefault && (
                    <span className="rounded-full bg-white/75 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#2C6468]">
                      Default
                    </span>
                  )}
                </div>
                <address className="relative z-[2] mt-3 text-[14px] not-italic leading-[1.65] text-graphite">
                  <strong className="font-semibold text-midnight">
                    {address.fullName}
                  </strong>
                  <br />
                  {address.line1}
                  {address.landmark && (
                    <>
                      <br />
                      Near {address.landmark}
                    </>
                  )}
                  <br />
                  {address.city}, {address.state} {address.pincode}
                  <br />
                  <span className="text-stone">+91 {address.phone}</span>
                </address>
                <div className="relative z-[2] mt-4 flex flex-wrap gap-2 border-t border-white/70 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditing(address.id)}
                    className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium text-midnight hover:bg-white/60"
                  >
                    <Pencil size={13} strokeWidth={1.6} /> Edit
                  </button>
                  {!address.isDefault && (
                    <button
                      type="button"
                      onClick={() => {
                        setDefault(address.id);
                        toDestination({ ...address, isDefault: true });
                      }}
                      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium text-midnight hover:bg-white/60"
                    >
                      <Check size={13} strokeWidth={1.8} /> Make default
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      removeAddress(address.id);
                      toDestination(
                        defaultAddress(useAccount.getState().addresses),
                      );
                    }}
                    className="ml-auto flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium text-[#8E4F5B] hover:bg-white/60"
                  >
                    <Trash2 size={13} strokeWidth={1.6} /> Delete
                  </button>
                </div>
              </li>
            ),
          )}
        </ul>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Orders() {
  return (
    <section
      id="orders"
      aria-labelledby="orders-title"
      className="glass tint-lilac scroll-mt-28 rounded-[32px] p-6 sm:p-8"
    >
      <div className="relative z-[2] flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/65">
          <Package size={19} strokeWidth={1.4} className="text-midnight" />
        </span>
        <h2
          id="orders-title"
          className="font-display text-[30px] leading-none text-midnight"
        >
          Your orders
        </h2>
      </div>
      <p className="relative z-[2] mt-5 max-w-[520px] text-[15px] leading-7 text-graphite/85">
        No orders yet. Secure checkout is being set up — once it opens, your
        orders, their status and tracking will appear right here.
      </p>
      <Link href="/shop" className="btn-iris relative z-[2] mt-6 !px-8 !py-3.5">
        Explore the collection
      </Link>
    </section>
  );
}

function DeviceData() {
  const clear = useAccount((state) => state.clear);
  const [confirming, setConfirming] = useState(false);
  return (
    <section
      aria-labelledby="privacy-title"
      className="glass rounded-[32px] p-6 sm:p-8"
    >
      <div className="relative z-[2] flex items-start gap-3">
        <span className="glass tint-sage flex h-11 w-11 shrink-0 items-center justify-center rounded-full">
          <ShieldCheck
            size={19}
            strokeWidth={1.4}
            className="relative z-[2] text-midnight"
          />
        </span>
        <div>
          <h2
            id="privacy-title"
            className="font-display text-[26px] leading-tight text-midnight"
          >
            Saved on this device
          </h2>
          <p className="mt-2 max-w-[620px] text-[14px] leading-[1.7] text-stone">
            There&rsquo;s no sign-in yet, so your details, addresses, bag and
            wishlist are kept privately in this browser and aren&rsquo;t sent to
            us until you place an order.
          </p>
          {confirming ? (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-[14px] text-midnight">
                Forget your details and addresses on this device?
              </span>
              <button
                type="button"
                onClick={() => {
                  clear();
                  setConfirming(false);
                }}
                className="rounded-full bg-[#8E4F5B] px-4 py-2 text-[12px] font-semibold text-ivory"
              >
                Yes, forget them
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="rounded-full px-4 py-2 text-[12px] font-medium text-midnight hover:bg-white/60"
              >
                Keep
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="mt-4 text-[13px] font-medium text-[#8E4F5B] underline-offset-4 hover:underline"
            >
              Forget my details on this device
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

/** "Your PURO": the account, without a sign-in. */
export default function AccountPage({ products }: { products: Product[] }) {
  const profile = useAccount((state) => state.profile);
  const addresses = useAccount((state) => state.addresses);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    useAccount.persist.rehydrate();
    useRecentlyViewed.persist.rehydrate();
    setReady(true);
  }, []);

  const firstName = profile.name.trim().split(/\s+/)[0];

  return (
    <div className="pb-20">
      <div className="container-site pt-8 sm:pt-12">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-[13px] text-stone"
        >
          <Link
            href="/"
            className="underline-offset-4 hover:text-midnight hover:underline"
          >
            Home
          </Link>
          <ChevronRight size={13} strokeWidth={1.4} />
          <span className="text-ink">Your account</span>
        </nav>

        <header className="glass mt-6 overflow-hidden rounded-[32px] p-6 sm:p-10">
          <p className="label relative z-[2] text-[#8E4F5B]">Your PURO</p>
          <h1 className="relative z-[2] mt-4 font-display text-[44px] font-light leading-[1] text-midnight sm:text-[64px]">
            {ready && firstName ? (
              <>
                Hello, <em className="text-iris pr-1">{firstName}</em>
              </>
            ) : (
              <>
                Welcome <em className="text-iris pr-1">back</em>
              </>
            )}
          </h1>
          <p className="relative z-[2] mt-4 max-w-[560px] text-[15px] leading-7 text-stone">
            Your bag, wishlist, details and delivery addresses in one place. No
            password needed.
          </p>
        </header>

        <div className="mt-5">
          {ready && <Overview addresses={addresses.length} />}
        </div>

        {ready && (
          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="space-y-5">
              <ProfileCard />
              <Orders />
            </div>
            <div className="space-y-5">
              <Addresses />
              <DeviceData />
            </div>
          </div>
        )}
      </div>

      <div className="container-site mt-12">
        <RecentlyViewedRow products={products} />
      </div>
    </div>
  );
}
