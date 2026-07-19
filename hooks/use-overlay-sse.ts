"use client";

import { useEffect, useState } from "react";

interface OverlayConfig {
    style: string;
    theme: string;
    position: string;
    autoHide: boolean;
    showTimestamp: boolean;
}

interface SSEMessage {
    type: string;
    overlay?: Partial<OverlayConfig>;
}

export function useOverlaySSE(overlayToken: string | null) {
    const [liveConfig, setLiveConfig] = useState<Partial<OverlayConfig> | null>(null);

    useEffect(() => {
        if (!overlayToken) return;

        const eventSource = new EventSource(`/api/sse?token=${overlayToken}`);

        eventSource.onmessage = (event) => {
            try {
                const data: SSEMessage = JSON.parse(event.data);
                if (data.type === "config-update") {
                    setLiveConfig(data.overlay || null);
                }
            } catch (error) {
                console.error("Failed to parse SSE message:", error);
            }
        };

        eventSource.onerror = (error) => {
            console.error("SSE error:", error);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, [overlayToken]);

    return liveConfig;
}
