"use client";

import { Button } from "@/components/ui/button";
import { Music } from "lucide-react";

export default function SpotifyLogin() {
    const handleLogin = () => {
        window.location.href = "/connect/spotify";
    };

    return (
        <div className="max-w-md rounded-xl border border-zinc-700 bg-zinc-900/90 p-6 text-center text-white shadow-lg">
            <h1 className="mb-3 text-3xl font-bold">🎵 Spotify Overlay</h1>
            <p className="mb-4 text-sm text-gray-300">
                Connect your Spotify account to display your currently playing
                track in real time on your stream.
            </p>

            <Button
                onClick={handleLogin}
                className="flex w-full items-center justify-center bg-green-500 px-6 py-2 text-white hover:bg-green-600"
            >
                <Music className="mr-2 h-5 w-5" />
                Login with Spotify
            </Button>

            <p className="mt-3 text-xs text-gray-400">
                Once connected, add this as a **Browser Source** in OBS.
            </p>
        </div>
    );
}
