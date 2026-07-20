"use client";

import { useEffect, useState, useRef } from "react";
import { parseAsBoolean, parseAsString, useQueryState } from "nuqs";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import SpotifyOverlay from "./overlays";
import MinimalBarOverlay from "./overlays/MinimalBar";
import AnimatedOverlay from "./overlays/Animated";
import SpotifyOverlayFade from "./overlays/Fade";
import { LocalStorageNowPlaying, NowPlaying, QueueItems } from "@/types";
import QueueOverlay from "./overlays/queue";
import { useLocalStorageJSON } from "@/hooks/useLocalStorage";
import SpotifyOverlayDynamic from "./overlays/Dynamic";
import { toast } from "sonner";
import SpotifyOverlayMediaStack from "./overlays/MediaStack";
import SpotifyOverlayAI from "./overlays/Ai";
import { themes } from "./overlays/theme";
import { positionClasses } from "./overlays/positions";

interface ServerConfig {
    user: { id: string; overlayToken: string | null };
    config: any;
    spotify: {
        accessToken: string | null;
        refreshToken: string | null;
        tokenExpiresAt: number | null;
    } | null;
    customPosition?: {
        x: number;
        y: number;
        scale: number;
    };
}

export default function SpotifyOverlayMiddle({
    serverConfig,
    _position,
    mockData,
}: {
    serverConfig?: ServerConfig | null;
    _position?: string;
    mockData?: { nowPlaying: NowPlaying; queue?: QueueItems[] | null };
}) {
    const [noToken, setNoToken] = useState(false);
    const [inputCode, setInputCode] = useState("");
    const [nowPlayingSong, setNowPlayingSong] =
        useLocalStorageJSON<LocalStorageNowPlaying | null>(
            "spotify_now_playing",
            null
        );
    const [token, setToken] = useState(serverConfig?.spotify?.accessToken || "");
    const [refreshToken, setRefreshToken] = useState(
        serverConfig?.spotify?.refreshToken || ""
    );
    const [queue, setQueue] = useLocalStorageJSON<QueueItems[] | null>(
        "spotify_queue",
        null
    );
    const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
    const [showTimestamp] = useQueryState(
        "timestamp",
        parseAsBoolean.withDefault(serverConfig?.config?.showTimestamp ?? false)
    );
    const [style] = useQueryState<any>("style", parseAsString.withDefault(serverConfig?.config?.style ?? ""));
    const [theme] = useQueryState<any>(
        "theme",
        parseAsString.withDefault(serverConfig?.config?.theme ?? "default")
    );
    const [autoHide] = useQueryState<any>(
        "autoHide",
        parseAsBoolean.withDefault(serverConfig?.config?.autoHide ?? false)
    );
    const [position] = useQueryState<any>(
        "position",
        parseAsString.withDefault(serverConfig?.config?.position ?? "bottom-right")
    );
    const [background] = useQueryState<any>(
        "background",
        parseAsString.withDefault("")
    );
    const overlayTokenRef = useRef<string | null>(serverConfig?.user?.overlayToken || null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const ot = params.get("overlayToken");
        if (ot) {
            overlayTokenRef.current = ot;
        }
    }, []);

    if (mockData?.nowPlaying) {
        const { nowPlaying: np, queue: mockQueue } = mockData;

        const newNowPlaying = {
            ...np,
            progress_ms: np.progress_ms,
            raw_progress_ms: Number(np.progress_ms),
            item: {
                ...np.item,
                duration_ms: np.item.duration_ms,
                raw_duration_ms: Number(np.item.duration_ms),
            },
        };

        return renderOverlay({
            style,
            position,
            _position,
            newNowPlaying,
            showTimestamp,
            theme,
            autoHide,
            background,
            queue: mockQueue,
        });
    }
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
            const trackName = newNowPlaying.item?.name;
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
    }, [nowPlaying?.item?.name, nowPlaying?.is_playing]);

    const saveCodeWithValue = async (code: string) => {
        try {
            const response = await fetch("/connect/spotify/code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code }),
            });

            if (response.status == 200) {
                const data = await response.json();
                setToken(data.access_token);
                setRefreshToken(data.refresh_token);
                localStorage.setItem(
                    "spotify_token_expires_at",
                    data.expires_in
                );
                setNoToken(false);
                toast.success("Spotify code saved");
            } else {
                setNoToken(true);
                toast.error("Error saving spotify code");
            }
        } catch (error) {
            console.error("Error saving spotify code:", error);
            setNoToken(true);
        }
    };

    const saveCode = async () => {
        saveCodeWithValue(inputCode);
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
            if (response.status === 400) {
                setNoToken(true);
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
                if (nowPlayingSong?.id !== data.item?.id) {
                    fetchQueue();
                }
                setNowPlaying(data);
            } else if (response.status == 401) {
                const data = await response.json();
                getRefreshToken();
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

    if (noToken && !serverConfig) {
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

    const overlayContent = renderOverlay({
        style,
        position,
        _position,
        newNowPlaying,
        showTimestamp,
        theme,
        autoHide,
        background,
        queue,
    });

    const customPos = serverConfig?.customPosition;
    if (customPos !== undefined) {
        return (
            <div
                style={{
                    position: "absolute",
                    left: customPos.x,
                    top: customPos.y,
                    transform: `scale(${customPos.scale})`,
                    transformOrigin: "top left",
                }}
            >
                {overlayContent}
            </div>
        );
    }

    return overlayContent;
}

function renderOverlay({
    style,
    newNowPlaying,
    showTimestamp,
    theme,
    position,
    _position,
    autoHide,
    background,
    queue,
}: {
    style: string;
    newNowPlaying: any;
    showTimestamp: boolean;
    theme?: keyof typeof themes;
    position?: keyof typeof positionClasses;
    _position?: string;
    autoHide?: boolean;
    background?: "song-image" | "";
    queue?: QueueItems[] | null;
}) {
    switch (style) {
        case "minimalBar":
            return <MinimalBarOverlay nowPlaying={newNowPlaying} showTimestamp={showTimestamp} theme={theme} />;
        case "animated":
            return (
                <AnimatedOverlay
                    nowPlaying={newNowPlaying}
                    showTimestamp={showTimestamp}
                    theme={theme}
                    position={_position ?? position}
                    autoHide={autoHide}
                />
            );
        case "fade":
            return (
                <SpotifyOverlayFade
                    nowPlaying={newNowPlaying}
                    showTimestamp={showTimestamp}
                    theme={theme}
                    position={_position ?? position}
                    background={background}
                />
            );
        case "queue":
            return (
                <QueueOverlay
                    nowPlaying={newNowPlaying}
                    showTimestamp={showTimestamp}
                    theme={theme}
                    position={_position ?? position}
                    background={background}
                    queue={queue || null}
                />
            );
        case "dynamic":
            return (
                <SpotifyOverlayDynamic
                    nowPlaying={newNowPlaying}
                    showTimestamp={showTimestamp}
                    theme={theme}
                    position={_position ?? position}
                    background={background}
                    queue={queue}
                />
            );
        case "media-stack":
            return (
                <SpotifyOverlayMediaStack
                    nowPlaying={newNowPlaying}
                    showTimestamp={showTimestamp}
                    theme={theme}
                    position={_position ?? position}
                />
            );
        case "ai":
            return (
                <SpotifyOverlayAI
                    nowPlaying={newNowPlaying}
                    showTimestamp={showTimestamp}
                    theme={theme}
                    position={_position ?? position}
                />
            );
        default:
            return (
                <SpotifyOverlay
                    nowPlaying={newNowPlaying}
                    showTimestamp={showTimestamp}
                    theme={theme}
                    position={_position ?? position}
                    background={background}
                />
            );
    }
}