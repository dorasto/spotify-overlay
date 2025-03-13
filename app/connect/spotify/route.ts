import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

export async function GET() {
    const state = randomBytes(16).toString("hex");
    const scope = [
        "user-read-playback-state",
        "user-read-currently-playing",
    ].join(" ");

    const client_id = process.env.SPOTIFY_CLIENT_ID;
    const redirect_uri =
        process.env.NEXT_PUBLIC_ROOT_DOMAIN + "/connect/spotify/callback";

    if (!client_id || !redirect_uri) {
        return NextResponse.json(
            { error: "Missing environment variables" },
            { status: 500 }
        );
    }

    const authUrl = new URL("https://accounts.spotify.com/authorize");
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("client_id", client_id);
    authUrl.searchParams.set("scope", scope);
    authUrl.searchParams.set("redirect_uri", redirect_uri);
    authUrl.searchParams.set("state", state);

    return NextResponse.redirect(authUrl.toString());
}
