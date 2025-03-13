"use client";
import React, { useState, useEffect } from "react";
import { themes } from "@/components/overlays/theme";
import SpotifyOverlay from "./overlays";
import AnimatedOverlay from "./overlays/Animated";
import MinimalBarOverlay from "./overlays/MinimalBar";
import { Switch } from "./ui/switch";

// Dummy song data
const song = {
    is_playing: true,
    item: {
        album: {
            images: [{ url: "/favicon.ico" }], // Placeholder image
            name: "Doras.to",
        },
        artists: [{ name: "Doras.to" }],
        name: "Doras",
        duration_ms: "3:50",
        raw_duration_ms: 390000,
    },
    progress_ms: "1:00",
    raw_progress_ms: 120000,
};

// Function to generate overlay URLs
const generateOverlayURL = (
    style: string,
    theme: string,
    showTimestamp?: boolean
) => {
    const base = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "";
    const params = new URLSearchParams();

    if (theme !== "default") params.set("theme", theme);
    if (style !== "default") params.set("style", style);
    if (showTimestamp) params.set("timestamp", "true");

    return `${base}/overlay${params.toString() ? `?${params.toString()}` : ""}`;
};

export default function ThemeShowcase() {
    const [clientLoad, setClientLoad] = useState(false);
    const [showTimestamp, setShowTimestamp] = useState(false); // Toggle state
    const [rootDomain, setRootDomain] = useState("");

    useEffect(() => {
        setClientLoad(true);

        fetch("/api/env")
            .then((res) => res.json())
            .then((data) => {
                setRootDomain(data.ROOT_DOMAIN || window.location.origin);
            })
            .catch((err) => {
                console.error("Failed to fetch environment variables:", err);
                setRootDomain(window.location.origin); // Fallback to current origin
            });
    }, []);

    // Function to generate overlay URLs with runtime values
    const generateOverlayURL = (
        style: string,
        theme: string,
        showTimestamp?: boolean
    ) => {
        const base = rootDomain; // Use the state variable instead of process.env
        const params = new URLSearchParams();

        if (theme !== "default") params.set("theme", theme);
        if (style !== "default") params.set("style", style);
        if (showTimestamp) params.set("timestamp", "true");

        return `${base}/overlay${params.toString() ? `?${params.toString()}` : ""}`;
    };

    if (!clientLoad) return <div className="h-screen bg-zinc-900"></div>;

    return (
        <div className="p-6">
            {/* Toggle Switch for Timestamp */}
            <div className="mb-6 flex items-center justify-center">
                <label className="flex cursor-pointer items-center">
                    <span className="mr-2 text-white">Show Timestamp</span>
                    <Switch
                        checked={showTimestamp}
                        onCheckedChange={setShowTimestamp}
                    ></Switch>
                </label>
            </div>

            {/* Grid for Overlays */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(themes).map(([themeName, theme], index) => (
                    <div
                        key={index}
                        className="space-y-4 rounded border-2 p-2 text-center"
                    >
                        {/* Display the Author if available */}
                        {theme?.author && (
                            <div className="text-white">
                                <span className="font-bold">Author: </span>
                                {theme.author}
                            </div>
                        )}
                        <span className="mt-2 block text-white">
                            <code className="rounded bg-black px-2 py-1">
                                {generateOverlayURL(
                                    "default",
                                    themeName,
                                    showTimestamp
                                )}
                            </code>
                        </span>
                        {/* Spotify Overlay */}
                        <div className="flex justify-center">
                            <SpotifyOverlay
                                nowPlaying={song}
                                theme={themeName as keyof typeof themes}
                                showTimestamp={showTimestamp}
                            />
                        </div>

                        <span className="mt-2 block text-white">
                            <code className="rounded bg-black px-2 py-1">
                                {generateOverlayURL(
                                    "minimalBar",
                                    themeName,
                                    showTimestamp
                                )}
                            </code>
                        </span>
                        {/* Minimal Bar Overlay */}
                        <MinimalBarOverlay
                            nowPlaying={song}
                            theme={themeName as keyof typeof themes}
                            showTimestamp={showTimestamp}
                            showCase
                        />

                        <span className="mt-2 block text-white">
                            <code className="rounded bg-black px-2 py-1">
                                {generateOverlayURL(
                                    "animated",
                                    themeName,
                                    showTimestamp
                                )}
                            </code>
                        </span>
                        {/* Animated Overlay */}
                        <div className="flex justify-center">
                            <AnimatedOverlay
                                nowPlaying={song}
                                theme={themeName as keyof typeof themes}
                                showTimestamp={showTimestamp}
                                showCase
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
