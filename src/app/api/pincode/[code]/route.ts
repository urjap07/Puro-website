import { NextResponse } from "next/server";
import { pincodeProblem } from "@/lib/delivery-rules";

export const runtime = "nodejs";

type Lookup =
  | { status: "ok"; pincode: string; district: string; state: string }
  | { status: "not_found" };

interface PostOffice {
  District: string;
  State: string;
}

/** Answers already fetched from India Post; pincodes rarely change. */
const cache = new Map<string, Lookup>();
const MAX_CACHE = 5000;

/**
 * Checks that an Indian pincode really exists by asking India Post, and
 * returns its district and state. Replies:
 *  200 { status: "ok", district, state }
 *  200 { status: "not_found" }   no such pincode
 *  400 { status: "invalid" }     wrong format
 *  503 { status: "unavailable" } India Post couldn't be reached
 */
export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const problem = pincodeProblem(code);
  if (problem) return NextResponse.json({ status: "invalid", message: problem }, { status: 400 });

  const known = cache.get(code);
  if (known) return reply(known);

  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${code}`, {
      signal: AbortSignal.timeout(6000),
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`India Post replied ${response.status}`);
    const [result] = (await response.json()) as { Status: string; PostOffice: PostOffice[] | null }[];

    const office = result?.Status === "Success" ? result.PostOffice?.[0] : undefined;
    const lookup: Lookup = office
      ? { status: "ok", pincode: code, district: office.District, state: office.State }
      : { status: "not_found" };

    if (cache.size >= MAX_CACHE) cache.delete(cache.keys().next().value!);
    cache.set(code, lookup);
    return reply(lookup);
  } catch (error) {
    console.error("Pincode lookup failed:", error);
    return NextResponse.json({ status: "unavailable" }, { status: 503 });
  }
}

function reply(lookup: Lookup) {
  return NextResponse.json(lookup, {
    // "Not found" is a normal answer, so it is a 200 and the browser console stays clean.
    status: 200,
    headers: { "Cache-Control": "public, max-age=86400" },
  });
}
