"use client";

import { useEffect, useState } from "react";
import SpotifyOverlayMiddle from "@/components/spotify-overlay";
import { positionClasses } from "@/components/overlays/positions";
import type { NowPlaying, QueueItems } from "@/types";
import { useLocalStorage } from "@/hooks/useLocalStorage";

/**
 * SpotifyOverlayTestBench
 * A dev-only test environment that renders overlays in multiple positions
 * while fetching Spotify "now playing" data just once.
 */
export default function SpotifyOverlayTestBench({
    refreshInterval = 5000,
}: {
    refreshInterval?: number;
}) {
    const [token, setToken] = useLocalStorage("spotify_access_token", null);
    const [refreshToken, setRefreshToken] = useLocalStorage(
        "spotify_refresh_token",
        null
    );
    const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
    const [queue, setQueue] = useState<QueueItems[] | null>(null);

    useEffect(() => {
        (async () => {
            if (!token) {
                return (
                    <div className="flex h-screen w-full items-center justify-center bg-black text-gray-300">
                        NO TOKEN
                    </div>
                );
            }
            await fetchData(token);
            const interval = setInterval(() => fetchData(token), refreshInterval);
            return () => clearInterval(interval);
        })();
    }, [refreshInterval]);

    async function fetchData(token: string) {
        try {
            const res = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.status === 200) {
                const data = await res.json();
                setNowPlaying(data);

                const queueRes = await fetch("https://api.spotify.com/v1/me/player/queue", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (queueRes.status === 200) {
                    const queueData = await queueRes.json();
                    setQueue(queueData.queue);
                }
            } else {
                console.warn("Spotify API status:", res.status);
            }
        } catch (err) {
            console.error("Error fetching Spotify data:", err);
        }
    }

    // Wait for data load
    if (!nowPlaying || !nowPlaying.item) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-black text-gray-300">
                Fetching Spotify currently playing…
            </div>
        );
    }

    // Data formatting
    const newNowPlaying: NowPlaying = {
        ...nowPlaying,
        progress_ms: formatTime(nowPlaying.progress_ms),
        raw_progress_ms: parseInt(nowPlaying.progress_ms),
        item: {
            ...nowPlaying.item,
            duration_ms: formatTime(nowPlaying.item.duration_ms),
            raw_duration_ms: parseInt(nowPlaying.item.duration_ms),
        },
    };

    const positions = Object.entries(positionClasses);

    return (
        <div className="relative w-full min-h-screen bg-black">
            {positions.map(([key]) => (
                <SpotifyOverlayMiddle
                    key={key}
                    _position={key as keyof typeof positionClasses}
                    firstLoadToken={token as string}
                    // ⬇ Feed fetched data to each overlay (one API source)
                    mockData={{
                        nowPlaying: newNowPlaying,
                        queue: queue,
                    }}
                />
            ))}
        </div>
    );
}

/* --- helper utilities --- */
function formatTime(ms: any) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}