"use client";
import React, { useState, useEffect } from "react";
import { themes } from "@/components/overlays/theme";
import SpotifyOverlay from "./overlays";
import AnimatedOverlay from "./overlays/Animated";
import MinimalBarOverlay from "./overlays/MinimalBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { Label } from "./ui/label";
import SpotifyOverlayFade from "./overlays/Fade";
import SpotifyOverlayDynamic from "./overlays/Dynamic";
import { Skeleton } from "./ui/skeleton";
import { positionClasses } from "./overlays/positions";
import SpotifyOverlayMediaStack from "./overlays/MediaStack";

export default function ThemeShowcase({ dialog }: { dialog?: boolean }) {
    const [song, setSong] = useState<any>({
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
    });
    const [showTimestamp, setShowTimestamp] = useState(false); // Toggle state
    const [position, setPosition] =
        useState<keyof typeof positionClasses>("bottom-right");
    const [rootDomain, setRootDomain] = useState("");
    const [globalViewMode, setGlobalViewMode] = useState<string | null>(null);

    useEffect(() => {
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
        if (position !== "bottom-right") params.set("position", position);

        return `${base}/overlay${params.toString() ? `?${params.toString()}` : ""}`;
    };

    return (
        <div className="p-6">
            {/* Controls Row */}
            <div className="mb-6 flex flex-col gap-2">
                {/* Toggle Switch for Timestamp */}
                <div className="flex w-fit flex-col">
                    <Label>Timestamp</Label>
                    <ToggleGroup
                        type="single"
                        className="rounded-md bg-muted p-1"
                        value={showTimestamp ? "on" : "off"}
                        onValueChange={(value) => {
                            if (value === "on" || value === "off") {
                                setShowTimestamp(value === "on");
                            }
                        }}
                    >
                        <ToggleGroupItem
                            value="on"
                            className="bg-transparent data-[state=on]:bg-background"
                        >
                            On
                        </ToggleGroupItem>
                        <ToggleGroupItem
                            value="off"
                            className="bg-transparent data-[state=on]:bg-background"
                        >
                            Off
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>
                <div className="flex w-fit flex-col">
                    <Label>Is Playing</Label>
                    <ToggleGroup
                        type="single"
                        className="rounded-md bg-muted p-1"
                        value={song.is_playing ? "on" : "off"}
                        onValueChange={(value) => {
                            setSong({
                                ...song,
                                is_playing: value === "on" ? true : false,
                            });
                        }}
                    >
                        <ToggleGroupItem
                            value="on"
                            className="bg-transparent data-[state=on]:bg-background"
                        >
                            On
                        </ToggleGroupItem>
                        <ToggleGroupItem
                            value="off"
                            className="bg-transparent data-[state=on]:bg-background"
                        >
                            Off
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>
                <div className="flex w-fit flex-col">
                    <Label>Position</Label>
                    <ToggleGroup
                        type="single"
                        className="rounded-md bg-muted p-1"
                        value={position || undefined}
                        onValueChange={(value: any) => {
                            setPosition(value);
                        }}
                    >
                        {Object.keys(positionClasses).map((position) => (
                            <ToggleGroupItem
                                key={position}
                                value={position}
                                className="bg-transparent data-[state=on]:bg-background"
                            >
                                {position}
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                </div>
                {/* Toggle Group for View Mode */}
                <div className="flex w-fit flex-col">
                    <Label>Theme</Label>
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
                        <ToggleGroupItem
                            value="fade"
                            className="bg-transparent data-[state=on]:bg-background"
                        >
                            Fade
                        </ToggleGroupItem>
                        <ToggleGroupItem
                            value="dynamic"
                            className="bg-transparent data-[state=on]:bg-background"
                        >
                            Dynamic
                        </ToggleGroupItem>
                        <ToggleGroupItem
                            value="media-stack"
                            className="bg-transparent data-[state=on]:bg-background"
                        >
                            MediaStack
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>
            </div>

            {/* Grid for Overlays */}
            <div
                className={cn(
                    "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3",
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
                                <TabsTrigger value="fade">Fade</TabsTrigger>
                                <TabsTrigger value="dynamic">
                                    Dynamic
                                </TabsTrigger>
                                <TabsTrigger value="media-stack">
                                    MediaStack
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="standard">
                                <span className="my-2 block text-white">
                                    {rootDomain.length === 0 ? (
                                        <Skeleton className="h-6 w-full" />
                                    ) : (
                                        <code className="rounded bg-muted px-2 py-1">
                                            {generateOverlayURL(
                                                "default",
                                                themeName,
                                                showTimestamp
                                            )}
                                        </code>
                                    )}
                                </span>
                                {/* Spotify Overlay */}
                                <div className="flex flex-col justify-center">
                                    <SpotifyOverlay
                                        nowPlaying={song}
                                        theme={themeName as keyof typeof themes}
                                        showTimestamp={showTimestamp}
                                        showCase
                                    />
                                </div>
                            </TabsContent>
                            <TabsContent value="minimal">
                                <span className="my-2 block text-white">
                                    {rootDomain.length === 0 ? (
                                        <Skeleton className="h-6 w-full" />
                                    ) : (
                                        <code className="rounded bg-muted px-2 py-1">
                                            {generateOverlayURL(
                                                "minimalBar",
                                                themeName,
                                                showTimestamp
                                            )}
                                        </code>
                                    )}
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
                                    {rootDomain.length === 0 ? (
                                        <Skeleton className="h-6 w-full" />
                                    ) : (
                                        <code className="rounded bg-muted px-2 py-1">
                                            {generateOverlayURL(
                                                "animated",
                                                themeName,
                                                showTimestamp
                                            )}
                                        </code>
                                    )}
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
                            <TabsContent value="fade">
                                <span className="my-2 block text-white">
                                    {rootDomain.length === 0 ? (
                                        <Skeleton className="h-6 w-full" />
                                    ) : (
                                        <code className="rounded bg-muted px-2 py-1">
                                            {generateOverlayURL(
                                                "fade",
                                                themeName,
                                                showTimestamp
                                            )}
                                        </code>
                                    )}
                                </span>
                                <SpotifyOverlayFade
                                    nowPlaying={song}
                                    theme={themeName as keyof typeof themes}
                                    showTimestamp={showTimestamp}
                                    showCase
                                />
                            </TabsContent>
                            <TabsContent value="dynamic">
                                <span className="my-2 block text-white">
                                    {rootDomain.length === 0 ? (
                                        <Skeleton className="h-6 w-full" />
                                    ) : (
                                        <code className="rounded bg-muted px-2 py-1">
                                            {generateOverlayURL(
                                                "dynamic",
                                                themeName,
                                                showTimestamp
                                            )}
                                        </code>
                                    )}
                                </span>
                                <SpotifyOverlayDynamic
                                    nowPlaying={song}
                                    theme={themeName as keyof typeof themes}
                                    showTimestamp={showTimestamp}
                                    showCase
                                />
                            </TabsContent>
                            <TabsContent value="media-stack">
                                <span className="my-2 block text-white">
                                    {rootDomain.length === 0 ? (
                                        <Skeleton className="h-6 w-full" />
                                    ) : (
                                        <code className="rounded bg-muted px-2 py-1">
                                            {generateOverlayURL(
                                                "media-stack",
                                                themeName,
                                                showTimestamp
                                            )}
                                        </code>
                                    )}
                                </span>
                                <SpotifyOverlayMediaStack
                                    nowPlaying={song}
                                    theme={themeName as keyof typeof themes}
                                    showTimestamp={showTimestamp}
                                    showCase
                                />
                            </TabsContent>
                        </Tabs>
                    </div>
                ))}
            </div>
        </div>
    );
}
