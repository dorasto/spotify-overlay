"use client";
import React, { useState, useEffect } from "react";
import { themes } from "@/components/overlays/theme";
import SpotifyOverlay from "./overlays";
import AnimatedOverlay from "./overlays/Animated";
import MinimalBarOverlay from "./overlays/MinimalBar";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

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

export default function ThemeShowcase({ dialog }: { dialog?: boolean }) {
    const [clientLoad, setClientLoad] = useState(false);
    const [showTimestamp, setShowTimestamp] = useState(false); // Toggle state
    const [rootDomain, setRootDomain] = useState("");

    const [globalViewMode, setGlobalViewMode] = useState<string | null>(null);

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

    // Apply global view mode change
    const handleGlobalViewModeChange = (value: string) => {
        if (value) {
            setGlobalViewMode(value);
        }
    };

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
            {/* Controls Row */}
            <div className="mb-6 flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-6 sm:space-y-0">
                {/* Toggle Switch for Timestamp */}
                <label className="flex cursor-pointer items-center">
                    <span className="mr-2 text-white">Show Timestamp</span>
                    <Switch
                        checked={showTimestamp}
                        onCheckedChange={setShowTimestamp}
                    ></Switch>
                </label>

                {/* Toggle Group for View Mode */}
                <div className="flex items-center">
                    <span className="mr-2 text-white">View All As:</span>
                    <ToggleGroup
                        type="single"
                        className="rounded-md bg-muted p-1"
                        value={globalViewMode || undefined}
                        onValueChange={handleGlobalViewModeChange}
                    >
                        <ToggleGroupItem
                            value="standard"
                            className="bg-transparent data-[state=on]:bg-background"
                        >
                            Standard
                        </ToggleGroupItem>
                        <ToggleGroupItem
                            value="minimal"
                            className="bg-transparent data-[state=on]:bg-background"
                        >
                            Bar
                        </ToggleGroupItem>
                        <ToggleGroupItem
                            value="animated"
                            className="bg-transparent data-[state=on]:bg-background"
                        >
                            Animated
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>
            </div>

            {/* Grid for Overlays */}
            <div
                className={cn(
                    "grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4",
                    dialog && "grid-cols-1 md:grid-cols-1 lg:grid-cols-1"
                )}
            >
                {Object.entries(themes).map(([themeName, theme], index) => (
                    <div
                        key={index}
                        className="space-y-4 rounded-xl border-2 bg-card p-2"
                    >
                        {/* Display the Author if available */}
                        <div className="flex items-center justify-between">
                            {themeName && (
                                <div className="text-lg font-bold text-white">
                                    Theme: {themeName}
                                </div>
                            )}
                            {theme?.author && (
                                <div className="text-white">
                                    <span className="text-left font-bold">
                                        Author:{" "}
                                    </span>
                                    {theme.author}
                                </div>
                            )}
                        </div>

                        <Tabs
                            defaultValue="standard"
                            className="w-full"
                            // Apply global view mode if it exists, otherwise keep the current value
                            value={globalViewMode || undefined}
                            onValueChange={() => {
                                // Clear global view mode when a user interacts with individual tabs
                                setGlobalViewMode(null);
                            }}
                        >
                            <TabsList className="mb-4">
                                <TabsTrigger value="standard">
                                    Standard
                                </TabsTrigger>
                                <TabsTrigger value="minimal">Bar</TabsTrigger>
                                <TabsTrigger value="animated">
                                    Animated
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="standard">
                                <span className="my-2 block text-white">
                                    <code className="rounded bg-muted px-2 py-1">
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
                            </TabsContent>
                            <TabsContent value="minimal">
                                <span className="my-2 block text-white">
                                    <code className="rounded bg-muted px-2 py-1">
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
                            </TabsContent>
                            <TabsContent value="animated">
                                <span className="my-2 block text-white">
                                    <code className="rounded bg-muted px-2 py-1">
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
                            </TabsContent>
                        </Tabs>
                    </div>
                ))}
            </div>
        </div>
    );
}
