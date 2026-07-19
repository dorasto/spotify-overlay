import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userConfig, user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { encrypt } from "@/lib/encryption";

export const runtime = "nodejs";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    const { token } = await params;

    const userData = await db.query.user.findFirst({
        where: eq(user.overlayToken, token),
    });

    if (!userData) {
        return NextResponse.json({ error: "Invalid token" }, { status: 404 });
    }

    const body = await request.json();
    const { access_token, refresh_token, expires_at } = body;

    if (!access_token) {
        return NextResponse.json({ error: "access_token required" }, { status: 400 });
    }

    const existing = await db.query.userConfig.findFirst({
        where: eq(userConfig.userId, userData.id),
    });

    const data: any = {
        userId: userData.id,
        spotifyAccessToken: encrypt(access_token),
        updatedAt: new Date(),
    };

    if (refresh_token) {
        data.spotifyRefreshToken = encrypt(refresh_token);
    }

    if (expires_at) {
        data.spotifyTokenExpiresAt = new Date(expires_at);
    }

    if (existing) {
        await db
            .update(userConfig)
            .set(data)
            .where(eq(userConfig.userId, userData.id));
    } else {
        data.id = crypto.randomUUID();
        data.createdAt = new Date();
        await db.insert(userConfig).values(data);
    }

    return NextResponse.json({ success: true });
}
