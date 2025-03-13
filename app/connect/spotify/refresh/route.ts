import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const client_id = process.env.SPOTIFY_CLIENT_ID!;
    const client_secret = process.env.SPOTIFY_CLIENT_SECRET!;

    try {
        const { refresh_token } = await req.json(); // Parse the JSON body

        if (!refresh_token) {
            return NextResponse.json(
                { error: "Missing refresh token" },
                { status: 400 }
            );
        }

        const tokenUrl = "https://accounts.spotify.com/api/token";

        const body = new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token,
            client_id,
            client_secret,
        });

        const response = await fetch(tokenUrl, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: body.toString(),
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: "Failed to refresh token" },
                { status: response.status }
            );
        }

        const data = await response.json();
        const { access_token, refresh_token: new_refresh_token } = data;

        return NextResponse.json({
            access_token,
            refresh_token: new_refresh_token || refresh_token, // Keep old one if no new refresh token
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: "Internal server error", details: error.toString() },
            { status: 500 }
        );
    }
}
