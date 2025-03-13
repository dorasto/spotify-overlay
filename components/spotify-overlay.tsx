"use client";

import { useEffect, useState } from "react";
import { parseAsBoolean, parseAsString, useQueryState } from "nuqs";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import SpotifyOverlay from "./overlays";
import MinimalBarOverlay from "./overlays/MinimalBar";
import AnimatedOverlay from "./overlays/Animated";

interface Track {
    album: {
        images: { url: string }[];
        name: string;
    };
    artists: { name: string }[];
    name: string;
    duration_ms: number;
}

interface NowPlaying {
    is_playing: boolean;
    item: Track;
    progress_ms: number;
}

export default function SpotifyOverlayMiddle() {
    const [token, setToken] = useState<string | null>(null);
    const [noToken, setNoToken] = useState(false);
    const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
    const [isVisible] = useState(true);
    const [showTimestamp] = useQueryState(
        "timestamp",
        parseAsBoolean.withDefault(false)
    );
    const [style] = useQueryState<any>("style", parseAsString.withDefault(""));
    const [theme] = useQueryState<any>(
        "theme",
        parseAsString.withDefault("default")
    );
    const [inputCode, setInputCode] = useState("");

    useEffect(() => {
        const storedToken = localStorage.getItem("spotify_access_token");
        if (!storedToken) {
            setNoToken(true);
            return;
        }
        setToken(storedToken);
        fetchNowPlaying();

        const interval = setInterval(fetchNowPlaying, 5_000);
        return () => clearInterval(interval);
    }, [token]);

    const saveCode = () => {
        window.location.href = `/connect/spotify/code?code=${inputCode}`;
    };

    const getRefreshToken = async () => {
        const refreshToken = localStorage.getItem("spotify_refresh_token");
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
                localStorage.setItem("spotify_access_token", data.access_token);
                if (data.refresh_token) {
                    localStorage.setItem(
                        "spotify_refresh_token",
                        data.refresh_token
                    );
                }
                setToken(data.access_token);
            }
        } catch (error) {
            console.error("Error refreshing token:", error);
        }
    };

    const fetchNowPlaying = async () => {
        if (!token) return;

        try {
            const response = await fetch(
                "https://api.spotify.com/v1/me/player/currently-playing",
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response.ok) {
                const data = await response.json();
                setNowPlaying(data);
            } else {
                const data = await response.json();
                if (data?.error?.message === "The access token expired") {
                    getRefreshToken();
                }
            }
        } catch (error) {
            console.error("Error fetching now playing:", error);
        }
    };

    const formatTime = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    if (!isVisible) return null;

    if (noToken) {
        return (
            <div className="flex flex-col items-center gap-2 rounded-lg bg-black/70 p-4">
                <p className="text-white">Enter your Spotify code:</p>
                <Input
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    placeholder="Paste your code here..."
                    className="w-64"
                />
                <Button onClick={saveCode} className="mt-2">
                    Save Token
                </Button>
            </div>
        );
    }

    if (!nowPlaying || !nowPlaying.item) return null;
    if (style == "minimalBar") {
        return (
            <MinimalBarOverlay
                nowPlaying={{
                    ...nowPlaying,
                    progress_ms: formatTime(nowPlaying.progress_ms),
                    item: {
                        ...nowPlaying.item,
                        duration_ms: formatTime(nowPlaying.item.duration_ms),
                    },
                }}
                showTimestamp={showTimestamp}
                theme={theme}
            />
        );
    }
    if (style == "animated") {
        return (
            <AnimatedOverlay
                nowPlaying={{
                    ...nowPlaying,
                    progress_ms: formatTime(nowPlaying.progress_ms),
                    raw_progress_ms: nowPlaying.progress_ms,
                    item: {
                        ...nowPlaying.item,
                        duration_ms: formatTime(nowPlaying.item.duration_ms),
                        raw_duration_ms: nowPlaying.item.duration_ms,
                    },
                }}
                showTimestamp={showTimestamp}
                theme={theme}
            />
        );
    }
    return (
        <SpotifyOverlay
            nowPlaying={{
                ...nowPlaying,
                progress_ms: formatTime(nowPlaying.progress_ms),
                raw_progress_ms: nowPlaying.progress_ms,
                item: {
                    ...nowPlaying.item,
                    duration_ms: formatTime(nowPlaying.item.duration_ms),
                    raw_duration_ms: nowPlaying.item.duration_ms,
                },
            }}
            showTimestamp={showTimestamp}
            theme={theme}
        />
    );
}
