import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { userConfig, user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { decrypt } from "@/lib/encryption";

export const runtime = "nodejs";

export async function GET() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const config = await db.query.userConfig.findFirst({
        where: eq(userConfig.userId, session.user.id),
    });

    const userData = await db.query.user.findFirst({
        where: eq(user.id, session.user.id),
    });

    const twitchAccount = await db.query.account.findFirst({
        where: (a, { and, eq }) => and(eq(a.userId, session.user.id), eq(a.providerId, "twitch")),
    });


    if (!config) {
        return NextResponse.json({
            overlayToken: userData?.overlayToken,
            spotify: null,
            twitch: null,
            overlay: {
                style: "default",
                theme: "default",
                position: "bottom-right",
                autoHide: false,
                showTimestamp: false,
            },
        });
    }

    let spotifyAccessToken = null;
    let spotifyRefreshToken = null;

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

    return NextResponse.json({
        overlayToken: userData?.overlayToken,
        spotify: {
            accessToken: spotifyAccessToken,
            refreshToken: spotifyRefreshToken,
            tokenExpiresAt: config.spotifyTokenExpiresAt?.getTime() ?? null,
        },
        twitch: {
            enabled: config.twitchEnabled ?? false,
            autoAnnounce: config.twitchAutoAnnounce ?? false,
            enableSongCommand: config.twitchEnableSongCommand ?? true,
            enableQueueCommand: config.twitchEnableQueueCommand ?? true,
            enableSrCommand: config.twitchEnableSrCommand ?? true,
        },
        overlay: {
            style: config.overlayStyle ?? "default",
            theme: config.overlayTheme ?? "default",
            position: config.overlayPosition ?? "bottom-right",
            autoHide: config.autoHide ?? false,
            showTimestamp: config.showTimestamp ?? false,
        },
    });
}
