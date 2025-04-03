"use client";

import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

export default function TwitchConnect() {
    const handleLogin = () => {
        window.location.href = "/connect/twitch";
    };

    return (
        <div className="max-w-md rounded-xl border border-zinc-700 bg-zinc-900/90 p-6 text-center text-white shadow-lg">
            <h1 className="mb-3 text-3xl font-bold">💬 Twitch Commands</h1>
            <p className="mb-4 text-sm text-gray-300">
                Connect your Twitch account to enable the !song command in your
                chat, allowing viewers to see what music you're currently
                playing.
            </p>

            <Button
                onClick={handleLogin}
                className="flex w-full items-center justify-center bg-purple-600 px-6 py-2 text-white hover:bg-purple-700"
            >
                <MessageSquare className="mr-2 h-5 w-5" />
                Login with Twitch
            </Button>

            <p className="mt-3 text-xs text-gray-400">
                Once connected, viewers can type{" "}
                <span className="font-mono font-bold">!song</span> in your chat
                to see your current track.
            </p>
        </div>
    );
}
