import { NextResponse } from "next/server";
import { pincodeProblem } from "@/lib/delivery-rules";
import { lookupIndiaPost } from "@/lib/pincode-lookup";

export const runtime = "nodejs";

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

  const lookup = await lookupIndiaPost(code);
  if (lookup.status === "unavailable") return NextResponse.json(lookup, { status: 503 });
  // "Not found" is a normal answer, so it is a 200 and the browser console stays clean.
  return NextResponse.json(lookup, { status: 200, headers: { "Cache-Control": "public, max-age=86400" } });
}
