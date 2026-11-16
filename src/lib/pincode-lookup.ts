/**
 * Server-side India Post pincode lookup, shared by /api/pincode and checkout.
 * Answers are cached in memory: pincodes rarely change.
 */
export type PincodeResult =
  | { status: "ok"; pincode: string; district: string; state: string }
  | { status: "not_found" }
  | { status: "unavailable" };

interface PostOffice {
  District: string;
  State: string;
}

const cache = new Map<string, Exclude<PincodeResult, { status: "unavailable" }>>();
const MAX_CACHE = 5000;

/** Expects a pincode whose format is already valid (see pincodeProblem). */
export async function lookupIndiaPost(code: string): Promise<PincodeResult> {
  const known = cache.get(code);
  if (known) return known;
  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${code}`, {
      signal: AbortSignal.timeout(6000),
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`India Post replied ${response.status}`);
    const [result] = (await response.json()) as { Status: string; PostOffice: PostOffice[] | null }[];
    const office = result?.Status === "Success" ? result.PostOffice?.[0] : undefined;
    const lookup = office
      ? ({ status: "ok", pincode: code, district: office.District, state: office.State } as const)
      : ({ status: "not_found" } as const);
    if (cache.size >= MAX_CACHE) cache.delete(cache.keys().next().value!);
    cache.set(code, lookup);
    return lookup;
  } catch (error) {
    console.error("Pincode lookup failed:", error);
    return { status: "unavailable" };
  }
}
