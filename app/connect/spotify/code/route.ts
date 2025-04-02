import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { code } = await req.json();

    if (!code) {
        return NextResponse.json({ error: "Missing code" }, { status: 400 });
    }

    const client_id = process.env.SPOTIFY_CLIENT_ID!;
    const client_secret = process.env.SPOTIFY_CLIENT_SECRET!;
    const redirect_uri = process.env.ROOT_DOMAIN + "/connect/spotify/callback";

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
                {
                    error: "Failed to fetch token",
                    details: await response.text(),
                },
                { status: 500 }
            );
        }

        const data = await response.json();
        const { access_token, refresh_token, expires_in } = data;
        return NextResponse.json({
            access_token,
            refresh_token,
            expires_in,
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: "Internal server error", details: error.toString() },
            { status: 500 }
        );
    }
}
