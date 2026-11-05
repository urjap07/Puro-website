import { NextResponse } from "next/server";
import { getActiveProducts } from "@/db/queries/products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const products = await getActiveProducts();

        return NextResponse.json(
            {
                success: true,
                count: products.length,
                products,
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error("Products API error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Unable to fetch products.",
            },
            {
                status: 500,
            }
        );
    }
}