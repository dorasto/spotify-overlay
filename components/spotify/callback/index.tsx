"use client";

import { useState } from "react";

export default function SpotifyCallback({
    searchParams,
    rootDomain,
}: {
    rootDomain: string;
    searchParams: { code?: string };
}) {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        if (searchParams.code) {
            navigator.clipboard.writeText(searchParams.code); // Copy the code
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
                    🎥 OBS Browser Source Setup
                </h1>
                <p className="mb-4 text-sm text-zinc-300">
                    Follow these steps to add the overlay to your OBS stream:
                </p>

                <ol className="mb-5 list-inside list-decimal space-y-2 text-left text-sm text-zinc-300">
                    <li>
                        Make sure you have the overlay added as a Browser Source
                        in OBS pointing to{" "}
                        <strong className="text-white">
                            {rootDomain}/overlay
                        </strong>
                    </li>
                    <li>
                        In OBS,{" "}
                        <strong className="text-white">
                            make the overlay visible
                        </strong>{" "}
                        in your scene.
                    </li>
                    <li>
                        In OBS,{" "}
                        <strong className="text-white">
                            click on your Browser Source
                        </strong>{" "}
                        in the Sources list to select it
                    </li>
                    <li>
                        Click the{" "}
                        <strong className="text-white">"Interact"</strong>{" "}
                        button in the toolbar that appears above your sources:
                        <div className="mt-2 flex justify-center">
                            <img
                                src="https://cdn.doras.to/doras/assets/473c9e74-3a3b-49ed-a47c-f6463caa6ede/23f7c051-8f4b-446b-8293-bdaaf3b939fd.png"
                                alt="OBS Interact Button"
                                className="rounded border border-zinc-600"
                                width={300}
                                height={40}
                            />
                        </div>
                    </li>
                    <li>
                        In the interaction window that opens,{" "}
                        <strong className="text-white">
                            look for the input box on the overlay
                        </strong>
                        . It might be visible immediately, or you might need to{" "}
                        <strong className="text-white">
                            click the settings icon
                        </strong>{" "}
                        in the top right of the overlay to open the settings
                        panel. Then look for the{" "}
                        <strong className="text-white">Spotify tab</strong>.
                    </li>

                    <li>
                        Paste the code below into the input field labeled
                        "Spotify Code".
                    </li>
                    <li>
                        Click the{" "}
                        <strong className="text-white">
                            Save Spotify Code
                        </strong>{" "}
                        button (if available) to complete the connection.
                    </li>
                </ol>

                <button
                    className={`w-full rounded-lg px-4 py-2 text-white transition ${
                        copied
                            ? "cursor-default bg-green-500"
                            : "bg-blue-500 hover:bg-blue-600"
                    }`}
                    onClick={handleCopy}
                    disabled={copied}
                >
                    {copied ? "✅ Code Copied!" : "Copy Spotify Code"}
                </button>
                {copied && (
                    <p className="mt-2 text-sm text-green-400">
                        Now paste this code in the Spotify tab of your overlay
                        settings!
                    </p>
                )}
            </div>
        </main>
    );
}
