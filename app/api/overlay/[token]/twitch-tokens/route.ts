import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userConfig, user, account } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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
    const { access_token, refresh_token } = body;

    if (!access_token) {
        return NextResponse.json({ error: "access_token required" }, { status: 400 });
    }

    const twitchAccount = await db.query.account.findFirst({
        where: (a, { and, eq }) => and(eq(a.userId, userData.id), eq(a.providerId, "twitch")),
    });
    if (access_token && twitchAccount) {
        twitchAccount.accessToken = access_token;
    }

    if (refresh_token && twitchAccount) {
        twitchAccount.refreshToken = refresh_token;
    }

    if (twitchAccount) {
        await db
            .update(account)
            .set(twitchAccount)
            .where(eq(userConfig.userId, userData.id));
    }

    return NextResponse.json({
        success: true,
        access_token,
        refresh_token: refresh_token || null,
    });
}
