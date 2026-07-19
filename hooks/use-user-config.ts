"use client";

import { useCallback, useEffect, useState } from "react";

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
}

export interface UserConfig {
    overlayToken: string | null;
    spotify: SpotifyConfig | null;
    twitch: TwitchConfig | null;
    overlay: OverlayConfig;
}

export function useUserConfig() {
    const [config, setConfig] = useState<UserConfig | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchConfig = useCallback(async () => {
        try {
            const res = await fetch("/api/config");
            if (res.ok) {
                const data = await res.json();
                setConfig(data);
            }
        } catch (error) {
            console.error("Failed to fetch config:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const saveConfig = useCallback(async (updates: Partial<UserConfig>) => {
        try {
            const res = await fetch("/api/config/broadcast", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            });
            if (res.ok) {
                setConfig((prev) => {
                    if (!prev) return prev;
                    return { ...prev, ...updates };
                });
            }
        } catch (error) {
            console.error("Failed to save config:", error);
        }
    }, []);

    useEffect(() => {
        fetchConfig();
    }, [fetchConfig]);

    return { config, loading, saveConfig, refetch: fetchConfig };
}
