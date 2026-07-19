"use client";

import { Button } from "@/components/ui/button";
import { IconBrandSpotify } from "@tabler/icons-react";
import { signInWithTwitch } from "@/lib/auth-client";

export default function SpotifyLogin() {
    return (
        <div className="rounded-xl border border-gray-700 bg-gray-800/90 p-6 text-center text-white shadow-lg">
            <h1 className="mb-3 text-3xl font-bold">🎵 Spotify Overlay</h1>
            <p className="mb-4 text-sm text-gray-300">
                Enhance your stream with a live display of your current Spotify
                track. Sign in to get started!
            </p>

            <Button
                onClick={() => signInWithTwitch()}
                className="flex w-full items-center justify-center bg-purple-600 px-6 py-2 text-white hover:bg-purple-700"
            >
                <IconBrandSpotify className="mr-2 h-5 w-5" />
                Sign in with Twitch
            </Button>

            <p className="mt-3 text-xs text-gray-400">
                Once signed in, connect your Spotify account in the dashboard.
            </p>
        </div>
    );
}
