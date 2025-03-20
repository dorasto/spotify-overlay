"use client";

import { useEffect, useState } from "react";
import { parseAsBoolean, parseAsString, useQueryState } from "nuqs";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import SpotifyOverlay from "./overlays";
import MinimalBarOverlay from "./overlays/MinimalBar";
import AnimatedOverlay from "./overlays/Animated";
import SpotifyOverlayFade from "./overlays/Fade";
import { LocalStorageNowPlaying, NowPlaying, QueueItems } from "@/types";
import QueueOverlay from "./overlays/queue";
import { useLocalStorageJSON, useLocalStorage } from "@/hooks/useLocalStorage";
import SpotifyOverlayDynamic from "./overlays/Dynamic";

export default function SpotifyOverlayMiddle({
    _position,
}: {
    _position?: string;
}) {
    const [noToken, setNoToken] = useState(false);
    const [inputCode, setInputCode] = useState("");
    const [nowPlayingSong, setNowPlayingSong] =
        useLocalStorageJSON<LocalStorageNowPlaying | null>(
            "spotify_now_playing",
            null
        );
    const [token, setToken] = useLocalStorage("spotify_access_token", null);
    const [refreshToken, setRefreshToken] = useLocalStorage(
        "spotify_refresh_token",
        null
    );
    const [queue, setQueue] = useLocalStorageJSON<QueueItems[] | null>(
        "spotify_queue",
        null
    );
    const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
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
    useEffect(() => {
        if (!token) {
            setNoToken(true);
            return;
        }
        fetchNowPlaying();
        const interval = setInterval(fetchNowPlaying, 5_000);
        return () => clearInterval(interval);
    }, [token, nowPlayingSong?.id, refreshToken]);

    useEffect(() => {
        if (nowPlaying) {
            const trackName = newNowPlaying.item.name;
            const trackUrl = newNowPlaying.item.external_urls.spotify;
            setNowPlayingSong({
                playing: nowPlaying.is_playing,
                name: trackName,
                artists: nowPlaying.item.artists.map((artist) => artist.name),
                url: trackUrl,
                id: nowPlaying.item.id,
            });
        } else {
            setNowPlayingSong(null);
        }
    }, [nowPlaying?.item.name, nowPlaying?.is_playing]);

    const saveCode = () => {
        window.location.href = `/connect/spotify/code?code=${inputCode}`;
    };

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
                if (data.refresh_token) {
                    setRefreshToken(data.refresh_token);
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
                if (nowPlayingSong?.id !== data.item.id) {
                    fetchQueue();
                }
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
    const fetchQueue = async () => {
        if (!token) return;
        try {
            const response = await fetch(
                "https://api.spotify.com/v1/me/player/queue",
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (response.status == 200) {
                const data = await response.json();
                setQueue(data.queue);
            } else if (response.status == 401) {
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
                position={_position ? _position : position}
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
                position={_position ? _position : position}
                background={background}
            />
        );
    }
    if (style == "queue") {
        return (
            <QueueOverlay
                nowPlaying={newNowPlaying}
                showTimestamp={showTimestamp}
                theme={theme}
                position={_position ? _position : position}
                background={background}
                queue={queue}
            />
        );
    }
    if (style == "dynamic") {
        return (
            <SpotifyOverlayDynamic
                nowPlaying={newNowPlaying}
                showTimestamp={showTimestamp}
                theme={theme}
                position={_position ? _position : position}
                background={background}
                queue={queue}
            />
        );
    }

    return (
        <SpotifyOverlay
            nowPlaying={newNowPlaying}
            showTimestamp={showTimestamp}
            theme={theme}
            position={_position ? _position : position}
            background={background}
        />
    );
}
