import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({
        rootDomain: process.env.NEXT_PUBLIC_ROOT_DOMAIN || "",
        // Add any other environment variables you might need in client components
    });
}
