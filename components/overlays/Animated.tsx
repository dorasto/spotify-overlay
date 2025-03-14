"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Marquee from "react-fast-marquee";
import { themes } from "@/components/overlays/theme"; // Import the themes object

interface Track {
    album: {
        images: { url: string }[]; // Album cover images
        name: string; // Album name
    };
    artists: { name: string }[]; // Artist names
    name: string; // Track name
    duration_ms: string; // Track duration in ms
    raw_duration_ms: number;
}

interface NowPlaying {
    is_playing: boolean; // Whether the track is playing or paused
    item: Track; // Track details
    progress_ms: string; // Progress of the track in ms
    raw_progress_ms: number;
}

export default function AnimatedOverlay({
    nowPlaying,
    showTimestamp = false,
    autoHide = false,
    theme = "default", // Default theme is "default"
    showCase,
    className,
}: {
    nowPlaying: NowPlaying; // Current playing track details
    showTimestamp?: boolean; // Whether to show the timestamp of the track
    autoHide?: boolean; // Whether to auto-hide the overlay when not playing
    theme?: keyof typeof themes; // Use the keys of the themes object as valid values for the theme prop
    showCase?: boolean;
    className?: string;
}) {
    let currentTheme = themes[theme]; // Get the theme object from the imported themes
    if (!currentTheme) {
        console.error(`Theme "${theme}" not found.`);
        currentTheme = themes["default"]; // Fallback to the default theme if the specified theme is not found
    }

    const [visible, setVisible] = useState(true);
    const [animationState, setAnimationState] = useState<
        "entering" | "visible" | "exiting"
    >(className ? "exiting" : "visible");
    // Handle song changes and visibility
    useEffect(() => {
        let enterTimer: NodeJS.Timeout | null = null;
        let exitTimer: NodeJS.Timeout | null = null;
        if (autoHide) {
            if (nowPlaying.is_playing) {
                setVisible(true);
                setAnimationState("entering");
                enterTimer = setTimeout(() => {
                    setAnimationState("visible");
                }, 1000);
            } else if (autoHide) {
                exitTimer = setTimeout(() => {
                    setAnimationState("exiting");
                    setTimeout(() => setVisible(false), 1000);
                }, 500);
            }
        }
        return () => {
            if (enterTimer) clearTimeout(enterTimer);
            if (exitTimer) clearTimeout(exitTimer);
        };
    }, [nowPlaying.is_playing, nowPlaying.item?.name, autoHide]);

    const positionClasses = {
        "top-left": "top-4 left-4",
        "top-right": "top-4 right-4",
        "bottom-left": "bottom-4 left-4",
        "bottom-right": "bottom-4 right-4",
    };

    if (!visible) return null;

    const progressPercentage =
        (nowPlaying.raw_progress_ms / nowPlaying.item.raw_duration_ms) * 100;

    return (
        <div
            className={cn(
                "z-50 transition-all duration-1000",
                positionClasses["bottom-right"],
                animationState === "entering" && "translate-y-8 opacity-0",
                animationState === "visible" && "translate-y-0 opacity-100",
                animationState === "exiting" && "translate-y-8 opacity-0",
                showCase ? "" : "fixed",
                className
            )}
        >
            <div
                className={cn(
                    "w-64 overflow-hidden rounded-lg backdrop-blur-md",
                    currentTheme.card
                )}
            >
                {/* Album art with animated equalizer */}
                <div className="relative">
                    <div className="aspect-square w-full overflow-hidden bg-black/50">
                        <img
                            src={
                                nowPlaying.item.album.images[0]?.url ||
                                "/favicon.ico"
                            }
                            alt={nowPlaying.item.album.name}
                            className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    </div>

                    {/* Animated equalizer bars */}
                    <div
                        className={cn(
                            "absolute left-0 right-0 flex h-8 items-end justify-center gap-1 px-4",
                            showTimestamp ? "bottom-1" : "bottom-0"
                        )}
                    >
                        {[...Array(12)].map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "w-1 rounded-t-sm opacity-80",
                                    currentTheme.badge
                                )}
                                style={{
                                    height: `${Math.random() * 100}%`,
                                    animationName: `equalizer`,
                                    animationDuration: `${0.5 + Math.random() * 0.5}s`,
                                    animationTimingFunction: `ease-in-out`,
                                    animationIterationCount: `infinite`,
                                    animationDirection: `alternate`,
                                    animationDelay: `${i * 0.1}s`,
                                }}
                            />
                        ))}
                    </div>
                    {showTimestamp && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                            <div
                                className={cn("h-full", currentTheme.badge)}
                                style={{
                                    width: `${progressPercentage}%`,
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Song info */}
                <div className="p-3">
                    <div className="overflow-hidden">
                        {nowPlaying.is_playing ? (
                            <Marquee
                                speed={25}
                                gradient={false}
                                autoFill
                                play={nowPlaying.is_playing}
                                className={cn(
                                    "text-lg font-bold",
                                    currentTheme.text
                                )}
                            >
                                {nowPlaying.item.name}{" "}
                                <span className="mx-2">•</span>
                            </Marquee>
                        ) : (
                            <p
                                className={cn(
                                    "text-lg font-bold",
                                    currentTheme.text
                                )}
                            >
                                {nowPlaying.item.name}
                            </p>
                        )}
                    </div>
                    <p className={cn("truncate text-xs", currentTheme.text)}>
                        {nowPlaying.item.artists
                            .map((artist) => artist.name)
                            .join(", ")}
                    </p>

                    {showTimestamp && (
                        <div className="mt-1 flex items-center justify-between text-xs">
                            <span className={currentTheme.timestampText}>
                                {nowPlaying.progress_ms}
                            </span>
                            <span className={currentTheme.timestampText}>
                                {nowPlaying.item.duration_ms}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
