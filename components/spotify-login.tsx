"use client";

import { Button } from "@/components/ui/button";
import { IconBrandSpotify } from "@tabler/icons-react";

export default function SpotifyLogin() {
    const handleLogin = () => {
        window.location.href = "/connect/spotify";
    };

    return (
        <div className="max-w-md rounded-xl border border-zinc-700 bg-zinc-900/90 p-6 text-center text-white shadow-lg">
            <h1 className="mb-3 text-3xl font-bold">🎵 Spotify Overlay</h1>
            <p className="mb-4 text-sm text-gray-300">
                Enhance your stream with a live display of your current Spotify
                track. Connect your account to automatically show viewers what
                you're listening to!
            </p>

            <Button
                onClick={handleLogin}
                className="flex w-full items-center justify-center bg-green-500 px-6 py-2 text-white hover:bg-green-600"
            >
                <IconBrandSpotify className="mr-2 h-5 w-5" />
                Login with Spotify
            </Button>

            <p className="mt-3 text-xs text-gray-400">
                Once connected, add this as a **Browser Source** in OBS.
            </p>
        </div>
    );
}
