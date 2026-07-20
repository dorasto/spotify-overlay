"use client";
import React, { useState, useEffect } from "react";
import { themes } from "@/components/overlays/theme";
import SpotifyOverlay from "./overlays";
import AnimatedOverlay from "./overlays/Animated";
import MinimalBarOverlay from "./overlays/MinimalBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import SpotifyOverlayFade from "./overlays/Fade";
import SpotifyOverlayDynamic from "./overlays/Dynamic";
import { Skeleton } from "./ui/skeleton";
import SpotifyOverlayMediaStack from "./overlays/MediaStack";
import SpotifyOverlayAI from "./overlays/Ai";

export default function ThemeShowcase({ dialog }: { dialog?: boolean }) {
    const [song] = useState<any>({
        is_playing: true,
        item: {
            album: {
                images: [{ url: "/favicon.ico" }],
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
    const [rootDomain, setRootDomain] = useState("");

    useEffect(() => {
        fetch("/api/env")
            .then((res) => res.json())
            .then((data) => {
                setRootDomain(data.ROOT_DOMAIN || window.location.origin);
            })
            .catch((err) => {
                console.error("Failed to fetch environment variables:", err);
                setRootDomain(window.location.origin);
            });
    }, []);

    const generateOverlayURL = (
        style: string,
        theme: string,
    ) => {
        const base = rootDomain;
        const params = new URLSearchParams();

        if (theme !== "default") params.set("theme", theme);
        if (style !== "default") params.set("style", style);

        return `${base}/overlay${params.toString() ? `?${params.toString()}` : ""}`;
    };

    return (
        <div>
            <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-white">Choose Your Theme</h2>
                <p className="mt-2 text-gray-400">
                    Browse available themes and styles for your overlay
                </p>
            </div>

            <div
                className={cn(
                    "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3",
                    dialog && "grid-cols-1 md:grid-cols-1 lg:grid-cols-1"
                )}
            >
                {Object.entries(themes).map(([themeName, theme], index) => (
                    <div
                        key={index}
                        className="space-y-4 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4"
                    >
                        <div className="flex items-center justify-between">
                            <div className="text-lg font-semibold text-white">
                                {themeName}
                            </div>
                            {theme?.author && (
                                <div className="text-sm text-gray-400">
                                    by {theme.author}
                                </div>
                            )}
                        </div>

                        <Tabs defaultValue="standard" className="w-full">
                            <TabsList className="mb-4 bg-white/[0.05]">
                                <TabsTrigger value="standard" className="data-[state=active]:bg-white/10">
                                    Standard
                                </TabsTrigger>
                                <TabsTrigger value="minimal" className="data-[state=active]:bg-white/10">
                                    Bar
                                </TabsTrigger>
                                <TabsTrigger value="animated" className="data-[state=active]:bg-white/10">
                                    Animated
                                </TabsTrigger>
                                <TabsTrigger value="fade" className="data-[state=active]:bg-white/10">
                                    Fade
                                </TabsTrigger>
                                <TabsTrigger value="dynamic" className="data-[state=active]:bg-white/10">
                                    Dynamic
                                </TabsTrigger>
                                <TabsTrigger value="media-stack" className="data-[state=active]:bg-white/10">
                                    MediaStack
                                </TabsTrigger>
                                <TabsTrigger value="ai" className="data-[state=active]:bg-white/10">
                                    AI
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="standard">
                                {rootDomain?.length === 0 ? (
                                    <Skeleton className="h-6 w-full" />
                                ) : (
                                    <code className="mb-2 block rounded bg-black/30 px-2 py-1 text-xs text-gray-400">
                                        {generateOverlayURL("default", themeName)}
                                    </code>
                                )}
                                <div className="flex flex-col justify-center">
                                    <SpotifyOverlay
                                        nowPlaying={song}
                                        theme={themeName as keyof typeof themes}
                                        showCase
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="minimal">
                                {rootDomain?.length === 0 ? (
                                    <Skeleton className="h-6 w-full" />
                                ) : (
                                    <code className="mb-2 block rounded bg-black/30 px-2 py-1 text-xs text-gray-400">
                                        {generateOverlayURL("minimalBar", themeName)}
                                    </code>
                                )}
                                <MinimalBarOverlay
                                    nowPlaying={song}
                                    theme={themeName as keyof typeof themes}
                                    showCase
                                />
                            </TabsContent>

                            <TabsContent value="animated">
                                {rootDomain?.length === 0 ? (
                                    <Skeleton className="h-6 w-full" />
                                ) : (
                                    <code className="mb-2 block rounded bg-black/30 px-2 py-1 text-xs text-gray-400">
                                        {generateOverlayURL("animated", themeName)}
                                    </code>
                                )}
                                <div className="flex justify-center">
                                    <AnimatedOverlay
                                        nowPlaying={song}
                                        theme={themeName as keyof typeof themes}
                                        showCase
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="fade">
                                {rootDomain?.length === 0 ? (
                                    <Skeleton className="h-6 w-full" />
                                ) : (
                                    <code className="mb-2 block rounded bg-black/30 px-2 py-1 text-xs text-gray-400">
                                        {generateOverlayURL("fade", themeName)}
                                    </code>
                                )}
                                <SpotifyOverlayFade
                                    nowPlaying={song}
                                    theme={themeName as keyof typeof themes}
                                    showCase
                                />
                            </TabsContent>

                            <TabsContent value="dynamic">
                                {rootDomain?.length === 0 ? (
                                    <Skeleton className="h-6 w-full" />
                                ) : (
                                    <code className="mb-2 block rounded bg-black/30 px-2 py-1 text-xs text-gray-400">
                                        {generateOverlayURL("dynamic", themeName)}
                                    </code>
                                )}
                                <SpotifyOverlayDynamic
                                    nowPlaying={song}
                                    theme={themeName as keyof typeof themes}
                                    showCase
                                />
                            </TabsContent>

                            <TabsContent value="media-stack">
                                {rootDomain?.length === 0 ? (
                                    <Skeleton className="h-6 w-full" />
                                ) : (
                                    <code className="mb-2 block rounded bg-black/30 px-2 py-1 text-xs text-gray-400">
                                        {generateOverlayURL("media-stack", themeName)}
                                    </code>
                                )}
                                <SpotifyOverlayMediaStack
                                    nowPlaying={song}
                                    theme={themeName as keyof typeof themes}
                                    showCase
                                />
                            </TabsContent>

                            <TabsContent value="ai">
                                {rootDomain?.length === 0 ? (
                                    <Skeleton className="h-6 w-full" />
                                ) : (
                                    <code className="mb-2 block rounded bg-black/30 px-2 py-1 text-xs text-gray-400">
                                        {generateOverlayURL("ai", themeName)}
                                    </code>
                                )}
                                <SpotifyOverlayAI
                                    nowPlaying={song}
                                    theme={themeName as keyof typeof themes}
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
