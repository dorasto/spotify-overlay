import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: Request) {
    const cookieStore = await cookies();
    const url = new URL(req.url);
    const code = url.searchParams.get("code");

    if (!code) {
        return NextResponse.json({ error: "Missing code" }, { status: 400 });
    }

    const client_id = process.env.SPOTIFY_CLIENT_ID!;
    const client_secret = process.env.SPOTIFY_CLIENT_SECRET!;
    const redirect_uri =
        process.env.NEXT_PUBLIC_ROOT_DOMAIN + "/connect/spotify/callback";

    const tokenUrl = "https://accounts.spotify.com/api/token";

    const body = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri,
        client_id,
        client_secret,
    });

    try {
        const response = await fetch(tokenUrl, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: body.toString(),
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: "Failed to fetch token" },
                { status: 500 }
            );
        }

        const data = await response.json();
        const { access_token, refresh_token, expires_in } = data;

        cookieStore.set("spotify_access_token", access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: expires_in, // Spotify's token expiry time in seconds
            path: "/",
        });

        cookieStore.set("spotify_refresh_token", refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: "/",
        });

        cookieStore.set("spotify_token_expires_at", expires_in.toString(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: "/",
        });

        return NextResponse.redirect(new URL("/storage", req.url)); // Fixes redirect issue
    } catch (error: any) {
        return NextResponse.json(
            { error: "Internal server error", details: error.toString() },
            { status: 500 }
        );
    }
}
