"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SpotifyCallback({
    searchParams,
}: {
    searchParams: { code?: string };
}) {
    const router = useRouter();
    const [processing, setProcessing] = useState(true);

    useEffect(() => {
        if (!searchParams.code) {
            toast.error("No authorization code received");
            router.push("/dashboard");
            return;
        }

        const exchangeCode = async () => {
            try {
                const res = await fetch("/api/spotify/callback", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ code: searchParams.code }),
                });

                if (res.ok) {
                    toast.success("Spotify connected successfully");
                } else {
                    const data = await res.json();
                    toast.error(data.error || "Failed to connect Spotify");
                }
            } catch (error) {
                console.error("Error exchanging code:", error);
                toast.error("Failed to connect Spotify");
            } finally {
                setProcessing(false);
                router.push("/dashboard?tab=spotify");
            }
        };

        exchangeCode();
    }, [searchParams.code, router]);

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 text-white">
            <div className="w-full max-w-md rounded-xl border border-gray-700 bg-gray-800 p-6 text-center shadow-lg">
                <h1 className="mb-3 text-2xl font-bold">Connecting Spotify...</h1>
                {processing ? (
                    <p className="text-sm text-gray-400">
                        Please wait while we connect your Spotify account.
                    </p>
                ) : (
                    <p className="text-sm text-gray-400">
                        Redirecting to dashboard...
                    </p>
                )}
            </div>
        </main>
    );
}
