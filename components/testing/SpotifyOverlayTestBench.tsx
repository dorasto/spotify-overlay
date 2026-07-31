"use client";

import { useEffect, useRef, useState } from "react";
import SpotifyOverlayMiddle from "@/components/spotify-overlay";
import { positionClasses } from "@/components/overlays/positions";
import type { NowPlaying, QueueItems } from "@/types";
import { useOverlaySSE } from "@/hooks/use-overlay-sse";

interface SpotifyConfig {
    accessToken: string | null;
    refreshToken: string | null;
    tokenExpiresAt: number | null;
}

interface TwitchConfig {
    accessToken: string | null;
    refreshToken: string | null;
    enabled: boolean;
    autoAnnounce: boolean;
    enableSongCommand: boolean;
    enableQueueCommand: boolean;
    enableSrCommand: boolean;
}

interface OverlayConfig {
    style: string;
    theme: string;
    position: string;
    autoHide: boolean;
    showTimestamp: boolean;
    customPosition?: {
        x: number;
        y: number;
        scale: number;
    };
}

interface FetchedConfig {
    spotify: SpotifyConfig | null;
    twitch: TwitchConfig | null;
    overlay: OverlayConfig;
    twitchUsername: string | null;
}
export default function SpotifyOverlayTestBench({
    overlayToken,
    refreshInterval = 5000,
}: {
    overlayToken: string;
    refreshInterval?: number;
}) {
    const [config, setConfig] = useState<FetchedConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const liveConfig = useOverlaySSE(overlayToken);

    useEffect(() => {
        if (!overlayToken) {
            setError("No overlay token provided");
            setLoading(false);
            return;
        }

        const fetchConfig = async () => {
            try {
                const res = await fetch(`/api/overlay/${overlayToken}`);
                if (!res.ok) {
                    throw new Error("Invalid overlay token");
                }
                const data = await res.json();
                setConfig(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load config");
            } finally {
                setLoading(false);
            }
        };

        fetchConfig();
    }, [overlayToken]);

    useEffect(() => {
        if (liveConfig && config) {
            setConfig((prev) =>
                prev
                    ? {
                        ...prev,
                        overlay: { ...prev.overlay, ...liveConfig },
                    }
                    : prev
            );
        }
    }, [liveConfig]);

    const [token, setToken] = useState("");
    const [refreshToken, setRefreshToken] = useState("");
    const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
    const [queue, setQueue] = useState<QueueItems[] | null>(null);
    const overlayTokenRef = useRef<string | null>(overlayToken || null);

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
    }, [refreshInterval, token]);
    const getRefreshToken = async () => {
        if (!refreshToken) return;

        const url = "/connect/spotify/refresh";
        const payload = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: refreshToken }),
        };

        try {
            const response = await fetch(url, payload);
            const data = await response.json();

            if (data.access_token) {
                const newAccessToken = data.access_token;
                const newRefreshToken = data.refresh_token || refreshToken;
                const expiresIn = data.expires_in || 3600;
                const expiresAt = Date.now() + expiresIn * 1000;

                if (data.refresh_token) {
                    setRefreshToken(data.refresh_token);
                }
                setToken(data.access_token);

                const ot = overlayTokenRef.current;
                if (ot) {
                    fetch(`/api/overlay/${ot}/tokens`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            access_token: newAccessToken,
                            refresh_token: newRefreshToken,
                            expires_at: expiresAt,
                        }),
                    }).catch((err) =>
                        console.error("Failed to sync tokens to server:", err)
                    );
                }
            }
        } catch (error) {
            console.error("Error refreshing token:", error);
        }
    };
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
                getRefreshToken();
                console.warn("Spotify API status:", res.status);
            }
        } catch (err) {
            console.error("Error fetching Spotify data:", err);
        }
    }
    useEffect(() => {
        setToken(config?.spotify?.accessToken || "")
        setRefreshToken(config?.spotify?.refreshToken || "")
    }, [config?.spotify?.accessToken, config?.spotify?.refreshToken])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    if (error || !config) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black">
                <div className="text-white text-center">
                    <div className="text-lg font-semibold">{error || "No config found"}</div>
                    <div className="text-sm text-gray-400 mt-2">
                        Make sure you have a valid overlay token
                    </div>
                </div>
            </div>
        );
    }

    const serverConfig = {
        user: { id: "", overlayToken },
        config: config.overlay,
        spotify: config.spotify,
    };

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
                    mockData={{
                        nowPlaying: newNowPlaying,
                        queue: queue,
                    }}
                    serverConfig={serverConfig}
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