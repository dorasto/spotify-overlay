import { db } from "@/lib/db";
import { userConfig, user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { decrypt } from "@/lib/encryption";

export async function getConfigByOverlayToken(token: string) {
    const userData = await db.query.user.findFirst({
        where: eq(user.overlayToken, token),
    });

    if (!userData) {
        return null;
    }

    const config = await db.query.userConfig.findFirst({
        where: eq(userConfig.userId, userData.id),
    });

    if (!config) {
        return {
            user: userData,
            config: null,
            spotify: null,
        };
    }

    let spotifyAccessToken = null;
    let spotifyRefreshToken = null;

    if (config.spotifyAccessToken) {
        try {
            spotifyAccessToken = decrypt(config.spotifyAccessToken);
        } catch {}
    }
    if (config.spotifyRefreshToken) {
        try {
            spotifyRefreshToken = decrypt(config.spotifyRefreshToken);
        } catch {}
    }

    return {
        user: userData,
        config,
        spotify: {
            accessToken: spotifyAccessToken,
            refreshToken: spotifyRefreshToken,
            tokenExpiresAt: config.spotifyTokenExpiresAt?.getTime() ?? null,
        },
    };
}
