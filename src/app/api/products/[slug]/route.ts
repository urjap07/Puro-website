import { NextRequest, NextResponse } from "next/server";
import { getProductBySlug } from "@/db/queries/products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
    params: Promise<{
        slug: string;
    }>;
}

export async function GET(
    request: NextRequest,
    { params }: RouteContext
) {
    try {
        const { slug } = await params;

        const product = await getProductBySlug(slug);

        if (!product) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Product not found.",
                },
                {
                    status: 404,
                }
            );
        }

        return NextResponse.json(
            {
                success: true,
                product,
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error("Individual product API error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Unable to fetch product details.",
            },
            {
                status: 500,
            }
        );
    }
}