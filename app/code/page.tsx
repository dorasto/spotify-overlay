"use client";

import { use, useState } from "react";
import { toast } from "sonner";

export default function Page({
    searchParams,
}: {
    searchParams: Promise<{ code?: string }>;
}) {
    const SearchParams = use(searchParams);
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        if (SearchParams.code) {
            navigator.clipboard.writeText(SearchParams.code);
            toast.success("✅ Code copied! Paste it into OBS.");
            setCopied(true);

            // Close the window after a short delay
            setTimeout(() => {
                window.close();
            }, 3000);
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
                        Open OBS and select the scene where you want the
                        overlay.
                    </li>
                    <li>
                        Click the <strong className="text-white">+</strong>{" "}
                        button in the "Sources" panel.
                    </li>
                    <li>
                        Select <strong className="text-white">Browser</strong>{" "}
                        and click "OK".
                    </li>
                    <li>
                        Paste the copied link into the{" "}
                        <code className="rounded bg-zinc-700 px-1 py-0.5 text-white">
                            https://sync-music.thehopton.work/overlay
                        </code>{" "}
                        field.
                    </li>
                    <li>
                        Adjust width & height (e.g.,{" "}
                        <code className="rounded bg-zinc-700 px-1 py-0.5 text-white">
                            800x200
                        </code>
                        ).
                    </li>
                    <li>Click "OK" to save.</li>
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
                    {copied ? "✅ Copied!" : "Copy Link"}
                </button>

                <p className="mt-3 text-xs text-zinc-400">
                    This page will close automatically after copying.
                </p>
            </div>
        </main>
    );
}
