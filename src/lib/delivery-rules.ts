/**
 * Delivery rules in one place: the zones, how long each takes, and how a
 * pincode is checked. Change the numbers here and the whole site follows.
 */

export type ZoneId = "maharashtra" | "india" | "international";

export interface DeliveryZone {
  id: ZoneId;
  /** Shown to shoppers, e.g. "Maharashtra". */
  label: string;
  /** Days from ordering to delivery. */
  min: number;
  max: number;
}

export const DELIVERY_ZONES: Record<ZoneId, DeliveryZone> = {
  maharashtra: { id: "maharashtra", label: "Maharashtra", min: 4, max: 7 },
  india: { id: "india", label: "Rest of India", min: 7, max: 10 },
  international: { id: "international", label: "Outside India", min: 12, max: 14 },
};

/**
 * Why a pincode can't be right, or null when its format is fine.
 * Indian pincodes are six digits; the first digit is the postal region
 * (1–8). Codes starting with 9 belong to the Army Post Office, which
 * couriers can't deliver to.
 */
export function pincodeProblem(value: string): string | null {
  const pincode = value.trim();
  if (!/^\d*$/.test(pincode)) return "A pincode has numbers only.";
  if (pincode.length < 6) return "Please enter all 6 digits of your pincode.";
  if (pincode.length > 6) return "A pincode has exactly 6 digits.";
  if (pincode[0] === "0") return "Indian pincodes don’t start with 0.";
  if (pincode[0] === "9") return "Pincodes starting with 9 are Army Post Office codes, which we can’t deliver to.";
  return null;
}

export function isValidPincode(value: string) {
  return pincodeProblem(value) === null;
}

/**
 * Fallback when India Post can't be reached: Maharashtra pincodes run from
 * 400000 to 445999, except 403xxx, which is Goa.
 */
export function pincodeLooksMaharashtra(pincode: string) {
  const prefix = Number(pincode.slice(0, 2));
  return prefix >= 40 && prefix <= 44 && !pincode.startsWith("403");
}

/** Countries we ship to outside India. */
export const COUNTRIES: { code: string; name: string }[] = [
  { code: "AE", name: "United Arab Emirates" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "SG", name: "Singapore" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "QA", name: "Qatar" },
  { code: "KW", name: "Kuwait" },
  { code: "OM", name: "Oman" },
  { code: "BH", name: "Bahrain" },
  { code: "NZ", name: "New Zealand" },
  { code: "MY", name: "Malaysia" },
  { code: "HK", name: "Hong Kong" },
  { code: "JP", name: "Japan" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "NL", name: "Netherlands" },
  { code: "IE", name: "Ireland" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "CH", name: "Switzerland" },
  { code: "SE", name: "Sweden" },
  { code: "ZA", name: "South Africa" },
  { code: "KE", name: "Kenya" },
  { code: "MU", name: "Mauritius" },
  { code: "LK", name: "Sri Lanka" },
  { code: "NP", name: "Nepal" },
  { code: "BD", name: "Bangladesh" },
].sort((a, b) => a.name.localeCompare(b.name));

export function countryName(code: string) {
  return COUNTRIES.find((country) => country.code === code)?.name ?? code;
}

/** Range across India before we know the pincode, e.g. "4–10 days". */
export const INDIA_DAYS = `${DELIVERY_ZONES.maharashtra.min}–${DELIVERY_ZONES.india.max} days`;
