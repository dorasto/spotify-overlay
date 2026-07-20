"use client";
import SpotifyOverlayMiddle from "@/components/spotify-overlay";
import Zoom from "@/components/zoom";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useOverlaySSE } from "@/hooks/use-overlay-sse";
import TwitchBotChat from "./twitch";


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

export default function CustomOverlayEditorNew() {
    const searchParams = useSearchParams();
    const overlayToken = searchParams.get("overlayToken");

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
        config: { ...config.overlay, position: "bottom-right" },
        spotify: config.spotify,
    };

    const style = {
        top: serverConfig.config.customPosition?.y,
        left: serverConfig.config.customPosition?.x,
        willChange: "transform",
        transform: `scale(${serverConfig.config.customPosition?.scale})`,
    }

    return (
        <div className="w-full">
            <Zoom />
            {config.twitch?.enabled && config.twitchUsername && (
                <TwitchBotChat
                    twitchToken={config.twitch.accessToken || ""}
                    twitchRefreshToken={config.twitch.refreshToken || "null"}
                    twitchUsername={config.twitchUsername}
                    spotifyToken={config.spotify?.accessToken || "null"}
                    autoAnnounce={config.twitch.autoAnnounce}
                    enableSongCommand={config.twitch.enableSongCommand}
                    enableQueueCommand={config.twitch.enableQueueCommand}
                    enableSrCommand={config.twitch.enableSrCommand}
                    overlayToken={overlayToken || ""}
                />
            )}
            <div className="absolute" style={style}>
                <SpotifyOverlayMiddle serverConfig={serverConfig} />
            </div>
        </div>
    );
}
