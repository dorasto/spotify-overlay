import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { userConfig, user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { encrypt, decrypt } from "@/lib/encryption";
import { sseBroadcaster } from "@/app/api/sse/helpers";
import crypto from "crypto";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const now = new Date();

    const existing = await db.query.userConfig.findFirst({
        where: eq(userConfig.userId, session.user.id),
    });

    const data: any = {
        userId: session.user.id,
        updatedAt: now,
    };

    if (body.spotify) {
        if (body.spotify.accessToken !== undefined) {
            data.spotifyAccessToken = body.spotify.accessToken
                ? encrypt(body.spotify.accessToken)
                : null;
        }
        if (body.spotify.refreshToken !== undefined) {
            data.spotifyRefreshToken = body.spotify.refreshToken
                ? encrypt(body.spotify.refreshToken)
                : null;
        }
        if (body.spotify.tokenExpiresAt !== undefined) {
            data.spotifyTokenExpiresAt = body.spotify.tokenExpiresAt
                ? new Date(body.spotify.tokenExpiresAt)
                : null;
        }
    }

    if (body.overlay) {
        if (body.overlay.style !== undefined)
            data.overlayStyle = body.overlay.style;
        if (body.overlay.theme !== undefined)
            data.overlayTheme = body.overlay.theme;
        if (body.overlay.position !== undefined)
            data.overlayPosition = body.overlay.position;
        if (body.overlay.autoHide !== undefined)
            data.autoHide = body.overlay.autoHide;
        if (body.overlay.showTimestamp !== undefined)
            data.showTimestamp = body.overlay.showTimestamp;
    }

    if (body.twitch) {
        if (body.twitch.enabled !== undefined)
            data.twitchEnabled = body.twitch.enabled;
        if (body.twitch.autoAnnounce !== undefined)
            data.twitchAutoAnnounce = body.twitch.autoAnnounce;
        if (body.twitch.enableSongCommand !== undefined)
            data.twitchEnableSongCommand = body.twitch.enableSongCommand;
        if (body.twitch.enableQueueCommand !== undefined)
            data.twitchEnableQueueCommand = body.twitch.enableQueueCommand;
        if (body.twitch.enableSrCommand !== undefined)
            data.twitchEnableSrCommand = body.twitch.enableSrCommand;
    }

    if (existing) {
        await db
            .update(userConfig)
            .set(data)
            .where(eq(userConfig.userId, session.user.id));
    } else {
        data.id = crypto.randomUUID();
        data.createdAt = now;
        await db.insert(userConfig).values(data);
    }

    const userData = await db.query.user.findFirst({
        where: eq(user.id, session.user.id),
    });

    const broadcastData = {
        type: "config-update",
        overlay: body.overlay || {},
    };

    if (userData?.overlayToken) {
        sseBroadcaster.sendToToken(userData.overlayToken, broadcastData);
    }

    return NextResponse.json({ success: true });
}
