import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { userConfig } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { encrypt } from "@/lib/encryption";
import crypto from "crypto";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await request.json();

    if (!code) {
        return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    try {
        const redirectUri = `${process.env.ROOT_DOMAIN || "http://localhost:5434"}/connect/spotify/callback`;
        
        const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${Buffer.from(
                    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
                ).toString("base64")}`,
            },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code,
                redirect_uri: redirectUri,
            }),
        });

        if (!tokenResponse.ok) {
            const error = await tokenResponse.json();
            console.error("Spotify token error:", error);
            return NextResponse.json(
                { error: "Failed to exchange code for tokens" },
                { status: 400 }
            );
        }

        const tokens = await tokenResponse.json();
        const { access_token, refresh_token, expires_in } = tokens;

        const now = new Date();
        const expiresAt = new Date(now.getTime() + expires_in * 1000);

        const existing = await db.query.userConfig.findFirst({
            where: eq(userConfig.userId, session.user.id),
        });

        const data: any = {
            userId: session.user.id,
            spotifyAccessToken: encrypt(access_token),
            spotifyRefreshToken: encrypt(refresh_token),
            spotifyTokenExpiresAt: expiresAt,
            updatedAt: now,
        };

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

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error in Spotify callback:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
