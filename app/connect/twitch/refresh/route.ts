import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const client_id = process.env.TWITCH_CLIENT_ID;
    const client_secret = process.env.TWITCH_CLIENT_SECRET;

    if (!client_id || !client_secret) {
        return NextResponse.json(
            { error: "Missing environment variables" },
            { status: 500 }
        );
    }

    try {
        const { refresh_token } = await req.json(); // Extract `refresh_token` from request body

        if (!refresh_token) {
            return NextResponse.json(
                { error: "Missing refresh token" },
                { status: 400 }
            );
        }

        const tokenUrl = "https://id.twitch.tv/oauth2/token";

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
                {
                    error: "Failed to refresh Twitch token",
                    details: await response.text(),
                },
                { status: response.status }
            );
        }

        const data = await response.json();
        const { access_token, refresh_token: new_refresh_token } = data;

        return NextResponse.json({
            access_token,
            refresh_token: new_refresh_token || refresh_token, // Use new refresh token if provided
        });
    } catch (error: any) {
        return NextResponse.json(
            {
                error: "Internal server error",
                details: error.message || error.toString(),
            },
            { status: 500 }
        );
    }
}
