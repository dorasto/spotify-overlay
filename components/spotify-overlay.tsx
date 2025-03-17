"use client";

import { useEffect, useState } from "react";
import { parseAsBoolean, parseAsString, useQueryState } from "nuqs";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import SpotifyOverlay from "./overlays";
import MinimalBarOverlay from "./overlays/MinimalBar";
import AnimatedOverlay from "./overlays/Animated";
import TestOverlay from "./overlays/Test";
import { positionClasses } from "./overlays/positions";
import SpotifyOverlayFade from "./overlays/Fade";
import { NowPlaying } from "@/types";

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
    const [autoHide] = useQueryState<any>(
        "autoHide",
        parseAsBoolean.withDefault(false)
    );
    const [position] = useQueryState<any>(
        "position",
        parseAsString.withDefault("bottom-right")
    );
    const [background] = useQueryState<any>(
        "background",
        parseAsString.withDefault("")
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
            if (response.status == 200) {
                const data = await response.json();
                setNowPlaying(data);
            } else if (response.status == 401) {
                const data = await response.json();
                if (data?.error?.message === "The access token expired") {
                    getRefreshToken();
                }
            } else {
                console.log(response);
            }
        } catch (error) {
            console.error("Error fetching now playing:", error);
        }
    };

    const formatTime = (ms: any) => {
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
    const newNowPlaying = {
        ...nowPlaying,
        progress_ms: formatTime(nowPlaying.progress_ms),
        raw_progress_ms: parseInt(nowPlaying.progress_ms),
        item: {
            ...nowPlaying.item,
            duration_ms: formatTime(nowPlaying.item.duration_ms),
            raw_duration_ms: parseInt(nowPlaying.item.duration_ms),
        },
    };
    if (style == "minimalBar") {
        return (
            <MinimalBarOverlay
                nowPlaying={newNowPlaying}
                showTimestamp={showTimestamp}
                theme={theme}
            />
        );
    }
    if (style == "animated") {
        return (
            <AnimatedOverlay
                nowPlaying={newNowPlaying}
                showTimestamp={showTimestamp}
                theme={theme}
                position={position}
                autoHide={autoHide}
            />
        );
    }
    if (style == "fade") {
        return (
            <SpotifyOverlayFade
                nowPlaying={newNowPlaying}
                showTimestamp={showTimestamp}
                theme={theme}
                position={position}
                background={background}
            />
        );
    }
    if (style == "test") {
        return (
            <>
                {Object.entries(positionClasses).map(([key, value]) => (
                    <TestOverlay
                        key={key}
                        nowPlaying={newNowPlaying}
                        showTimestamp={showTimestamp}
                        theme={theme}
                        position={key}
                        background={background}
                    />
                ))}
            </>
        );
    }
    return (
        <SpotifyOverlay
            nowPlaying={newNowPlaying}
            showTimestamp={showTimestamp}
            theme={theme}
            position={position}
            background={background}
        />
    );
}
