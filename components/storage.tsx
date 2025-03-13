"use client";
import { useEffect } from "react";
import Cookies from "js-cookie";

export default function StorageComp({ cookies }: any) {
    useEffect(() => {
        // Get cookies
        const accessToken = cookies.access_token;
        const refreshToken = cookies.refresh_token;
        const expiresIn = cookies.expires_in;

        if (accessToken && refreshToken) {
            // Store in localStorage
            localStorage.setItem("spotify_access_token", accessToken);
            localStorage.setItem("spotify_refresh_token", refreshToken);
            localStorage.setItem(
                "spotify_token_expires_at",
                expiresIn || "3600"
            ); // Default expires_in to 1 hour

            // Remove cookies after storing
            Cookies.remove("spotify_access_token");
            Cookies.remove("spotify_refresh_token");
            Cookies.remove("spotify_token_expires_at");
        }
    }, []);
    if (typeof window !== "undefined") {
        window.location.href = "/overlay";
        return null;
    }
    return null;
}
