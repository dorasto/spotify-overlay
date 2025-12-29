"use client";

import { Button } from "@/components/ui/button";
import { IconBrandTwitch } from "@tabler/icons-react";

export default function TwitchConnect() {
    const handleLogin = () => {
        window.location.href = "/connect/twitch";
    };

    return (
        <div className="max-w-md rounded-xl border border-zinc-700 bg-zinc-900/90 p-6 text-center text-white shadow-lg">
            <h1 className="mb-3 text-3xl font-bold">💬 Twitch Chat Bot</h1>

            <p className="mb-4 text-sm text-gray-300">
                Connect your Twitch account to enable interactive chat commands
                and automatic song announcements directly in your stream chat.
            </p>

            <div className="mb-4 rounded-lg bg-zinc-800 p-4 text-left text-sm text-gray-300">
                <p className="mb-2 font-semibold text-white">
                    ✅ Available Commands
                </p>
                <ul className="list-inside list-disc space-y-1">
                    <li>
                        <span className="font-mono text-white">!song</span> —
                        shows the current or last played Spotify track
                    </li>
                    <li>
                        <span className="font-mono text-white">!queue</span> —
                        shows the next songs in the Spotify queue
                    </li>
                    <li>
                        <span className="font-mono text-white">
                            !sr &lt;url&gt;
                        </span>{" "}
                        — lets viewers request songs{" "}
                        <span className="text-zinc-400">
                            (Spotify Premium required)
                        </span>
                    </li>
                    <li>
                        <span className="font-mono text-white">!commands</span>{" "}
                        — lists all available bot commands
                    </li>
                    <li>
                        <span className="font-mono text-white">!ping</span> —
                        checks if the bot is online
                    </li>
                </ul>
            </div>

            <div className="mb-4 rounded-lg bg-zinc-800 p-4 text-left text-sm text-gray-300">
                <p className="mb-2 font-semibold text-white">
                    ⚙️ Overlay URL Options
                </p>
                <ul className="list-inside list-disc space-y-1">
                    <li>
                        <span className="font-mono text-white">
                            ?autoAnnounce=true
                        </span>{" "}
                        — automatically announces songs when they change
                    </li>
                    <li>
                        <span className="font-mono text-white">?sr=true</span>{" "}
                        — enables viewer song requests via{" "}
                        <span className="font-mono text-white">!sr</span>{" "}
                        <span className="text-zinc-400">
                            (Spotify Premium required)
                        </span>
                    </li>
                </ul>
            </div>

            <Button
                onClick={handleLogin}
                className="flex w-full items-center justify-center bg-purple-600 px-6 py-2 text-white hover:bg-purple-700"
            >
                <IconBrandTwitch className="mr-2 h-5 w-5" />
                Connect Twitch
            </Button>

            <p className="mt-3 text-xs text-gray-400">
                After connecting, copy the provided overlay URL into your OBS
                Browser Source.
            </p>
        </div>
    );
}