import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({
        ROOT_DOMAIN: process.env.ROOT_DOMAIN,
    });
}
