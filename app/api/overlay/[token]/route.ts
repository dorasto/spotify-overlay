import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userConfig, user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { decrypt } from "@/lib/encryption";

export const runtime = "nodejs";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    const { token } = await params;

    const userData = await db.query.user.findFirst({
        where: eq(user.overlayToken, token),
    });

    if (!userData) {
        return NextResponse.json({ error: "Invalid token" }, { status: 404 });
    }

    const twitchAccount = await db.query.account.findFirst({
        where: (a, { and, eq }) => and(eq(a.userId, userData.id), eq(a.providerId, "twitch")),
    });

    const twitchUsername = userData?.name || null;

    const config = await db.query.userConfig.findFirst({
        where: eq(userConfig.userId, userData.id),
    });

    if (!config) {
        return NextResponse.json({
            spotify: null,
            twitch: null,
            twitchUsername,
            overlay: {
                style: "default",
                theme: "default",
                position: "bottom-right",
                autoHide: false,
                showTimestamp: false,
                customPosition: {
                    x: 0,
                    y: 0,
                    scale: 1,
                },
            },
            dvd: "/favicon.ico",
        });
    }

    let spotifyAccessToken = null;
    let spotifyRefreshToken = null;
    let twitchAccessToken = null;
    let twitchRefreshToken = null;

    if (config.spotifyAccessToken) {
        try {
            spotifyAccessToken = decrypt(config.spotifyAccessToken);
        } catch { }
    }
    if (config.spotifyRefreshToken) {
        try {
            spotifyRefreshToken = decrypt(config.spotifyRefreshToken);
        } catch { }
    }
    if (twitchAccount?.accessToken) {
        try {
            twitchAccessToken = twitchAccount.accessToken;
        } catch { }
    }
    if (twitchAccount?.refreshToken) {
        try {
            twitchRefreshToken = twitchAccount.refreshToken;
        } catch { }
    }

    return NextResponse.json({
        spotify: {
            accessToken: spotifyAccessToken,
            refreshToken: spotifyRefreshToken,
            tokenExpiresAt: config.spotifyTokenExpiresAt?.getTime() ?? null,
        },
        twitch: {
            accessToken: twitchAccessToken,
            refreshToken: twitchRefreshToken,
            enabled: config.twitchEnabled ?? false,
            autoAnnounce: config.twitchAutoAnnounce ?? false,
            enableSongCommand: config.twitchEnableSongCommand ?? true,
            enableQueueCommand: config.twitchEnableQueueCommand ?? true,
            enableSrCommand: config.twitchEnableSrCommand ?? true,
        },
        twitchUsername,
        overlay: {
            style: config.overlayStyle ?? "default",
            theme: config.overlayTheme ?? "default",
            position: config.overlayPosition ?? "bottom-right",
            autoHide: config.autoHide ?? false,
            showTimestamp: config.showTimestamp ?? false,
            customPosition: {
                x: config.customX ?? 0,
                y: config.customY ?? 0,
                scale: config.customScale ?? 1,
            },
        },
        dvd: config.dvd ?? "/favicon.ico",
    });
}
