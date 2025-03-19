import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { code } = await req.json(); // Extract `code` from request body

        if (!code) {
            return NextResponse.json(
                { error: "Missing authorization code" },
                { status: 400 }
            );
        }

        const client_id = process.env.TWITCH_CLIENT_ID;
        const client_secret = process.env.TWITCH_CLIENT_SECRET;
        const root_domain = process.env.ROOT_DOMAIN;

        if (!client_id || !client_secret || !root_domain) {
            return NextResponse.json(
                { error: "Missing environment variables" },
                { status: 500 }
            );
        }

        const redirect_uri = `${root_domain}/connect/twitch/callback`;
        const tokenUrl = "https://id.twitch.tv/oauth2/token";

        const body = new URLSearchParams({
            grant_type: "authorization_code", // Correct grant type
            code, // Authorization code from request body
            redirect_uri,
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
                    error: "Failed to fetch Twitch token",
                    details: await response.text(),
                },
                { status: 500 }
            );
        }

        const data = await response.json();
        const userResponse = await fetch("https://api.twitch.tv/helix/users", {
            headers: {
                Authorization: `Bearer ${data.access_token}`,
                "Client-Id": client_id,
            },
        });
        if (!userResponse.ok) {
            return NextResponse.json(
                {
                    error: "Failed to fetch Twitch user",
                    details: await userResponse.text(),
                },
                { status: 500 }
            );
        }
        const userData = await userResponse.json();
        return NextResponse.json({
            token: data,
            user: userData.data[0],
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
