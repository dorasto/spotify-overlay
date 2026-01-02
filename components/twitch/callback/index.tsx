"use client";

import { useState } from "react";

export default function TwitchCallback({
    searchParams,
    rootDomain,
}: {
    rootDomain: string;
    searchParams: { code?: string };
}) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (searchParams.code) {
            const overlayUrl = `${rootDomain}/overlay?twitch=${searchParams.code}`;
            navigator.clipboard.writeText(overlayUrl);
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
            }, 5000);
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-900 p-6 text-white">
            <div className="w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-800 p-6 text-center shadow-lg">
                <h1 className="mb-3 text-2xl font-bold">
                    🎮 Connect Twitch Chat Commands
                </h1>
                <p className="mb-4 text-sm text-zinc-300">
                    Follow these steps to connect your Twitch account and enable
                    the{" "}
                    <code className="rounded bg-zinc-700 px-1 py-0.5 text-white">
                        !song
                    </code>{" "}
                    command in your stream chat.
                </p>

                <ol className="mb-5 list-inside list-decimal space-y-2 text-left text-sm text-zinc-300">
                    <li>
                        In OBS, add (or select) a{" "}
                        <strong className="text-white">Browser Source</strong>{" "}
                        in your scene.
                    </li>
                    <li>
                        Click the{" "}
                        <strong className="text-white">Copy Overlay URL</strong>{" "}
                        button below.
                    </li>
                    <li>
                        Paste the copied URL into the{" "}
                        <strong className="text-white">URL field</strong> of the
                        Browser Source settings.
                    </li>
                    <li>
                        Click{" "}
                        <strong className="text-white">OK</strong> to apply the
                        changes.
                    </li>
                    <li>
                        Make sure the Browser Source is{" "}
                        <strong className="text-white">visible</strong> in your
                        scene.
                    </li>
                    <li>
                        The overlay will automatically connect to Twitch and
                        enable{" "}
                        <strong className="text-white">!song</strong>{" "}
                        commands in chat.
                    </li>
                </ol>

                <button
                    className={`w-full rounded-lg px-4 py-2 text-white transition ${
                        copied
                            ? "cursor-default bg-green-500"
                            : "bg-purple-600 hover:bg-purple-700"
                    }`}
                    onClick={handleCopy}
                    disabled={copied}
                >
                    {copied ? "✅ URL Copied!" : "Copy Overlay URL"}
                </button>

                {copied && (
                    <p className="mt-2 text-sm text-green-400">
                        Paste this URL into your OBS Browser Source settings.
                    </p>
                )}
            </div>
        </main>
    );
}