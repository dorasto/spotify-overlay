"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { themes } from "@/components/overlays/theme"; // Import the themes object
import { positionClasses } from "./positions";
import { NowPlaying } from "@/types";
import Ticker from "../ticker";

export default function AnimatedOverlay({
    nowPlaying,
    showTimestamp = false,
    autoHide = false,
    theme = "default", // Default theme is "default"
    showCase,
    className,
    position = "bottom-right",
    style,
}: {
    nowPlaying: NowPlaying; // Current playing track details
    showTimestamp?: boolean; // Whether to show the timestamp of the track
    autoHide?: boolean; // Whether to auto-hide the overlay when not playing
    theme?: keyof typeof themes; // Use the keys of the themes object as valid values for the theme prop
    showCase?: boolean;
    className?: string;
    position?: keyof typeof positionClasses;
    style?: React.CSSProperties;
}) {
    let currentTheme = themes[theme]; // Get the theme object from the imported themes
    if (!currentTheme) {
        console.error(`Theme "${theme}" not found.`);
        currentTheme = themes["default"]; // Fallback to the default theme if the specified theme is not found
    }
    let currentPosition = positionClasses[position]; // Get the position class from the imported positionClasses
    if (!currentPosition) {
        console.error(`Position "${position}" not found.`);
        currentPosition = positionClasses["bottom-right"]; // Fallback to the default position if the specified position is not found
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

    if (!visible) return null;

    const progressPercentage =
        (nowPlaying.raw_progress_ms / nowPlaying.item.raw_duration_ms) * 100;
    let enteringAnimation = "translateY(22rem)";
    let exitingAnimation = "translateY(22rem)";
    if (position.includes("top") && position !== "top-center") {
        enteringAnimation = "translateY(-22rem)";
        exitingAnimation = "translateY(-22rem)";
    } else if (position === "top-center") {
        enteringAnimation = "translateX(-50%) translateY(-22rem)"; // Coming from the top
        exitingAnimation = "translateX(-50%) translateY(-22rem)"; // Exiting upwards (no horizontal movement)
    } else if (position === "bottom-center") {
        enteringAnimation = "translateX(-50%) translateY(22rem)"; // Coming from the bottom
        exitingAnimation = "translateX(-50%) translateY(22rem)"; // Exiting downwards (no horizontal movement)
    } else if (position === "center") {
        enteringAnimation = "translate(-50%, -50%)  scale(0.5)"; // Coming from the center
        exitingAnimation = "translate(-50%, -50%)"; // Exiting from the center
    }
    return (
        <div
            className={cn(
                "z-50 transition-all duration-1000",
                currentPosition,
                "translate-y-8 opacity-0",
                showCase ? "" : "fixed",
                className,
                animationState === "visible" && "translate-y-0 opacity-100"
            )}
            style={{
                transform:
                    animationState === "entering"
                        ? enteringAnimation
                        : (animationState === "exiting" && exitingAnimation) ||
                          (position == "center" && "translate(-50%, -50%)") ||
                          (position === "middle-left" &&
                              "translate(0%, -50%)") ||
                          (position === "middle-right" &&
                              "translate(0%,-50%)") ||
                          "",
                transitionDuration: "2s",
                ...style,
            }}
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
                        <Ticker
                            text={nowPlaying.item.name}
                            className={cn(
                                "text-lg font-bold",
                                currentTheme.text
                            )}
                        />
                    </div>
                    <div className={cn("text-sm", currentTheme.text)}>
                        <Ticker
                            duration={20}
                            text={nowPlaying.item.artists
                                .map((artist) => artist.name)
                                .join(", ")}
                        />
                    </div>

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
