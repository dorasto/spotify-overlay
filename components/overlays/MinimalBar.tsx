"use client";

import { Music, Pause, Play } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { themes } from "@/components/overlays/theme"; // Import the themes object
import { cn } from "@/lib/utils";
import { NowPlaying } from "@/types";
import Ticker from "../ticker";

interface MinimalBarOverlayProps {
    nowPlaying: NowPlaying; // Track currently playing
    showTimestamp?: boolean; // Whether to show the timestamp
    theme?: keyof typeof themes; // Use the keys of the themes object as valid values for the theme prop
    showCase?: boolean;
}

export default function MinimalBarOverlay({
    nowPlaying,
    showTimestamp = false,
    theme = "default", // Default theme is "default"
    showCase,
}: MinimalBarOverlayProps) {
    const progressPercentage =
        (nowPlaying.raw_progress_ms / nowPlaying.item.raw_duration_ms) * 100;

    let currentTheme = themes[theme]; // Get the theme object from the imported themes
    if (!currentTheme) {
        console.error(`Theme "${theme}" not found.`);
        currentTheme = themes["default"]; // Fallback to the default theme if the specified theme is not found
    }
    return (
        <div
            className={cn(
                "bottom-0 left-0 right-0 border-t px-4 py-2 backdrop-blur-md",
                currentTheme.card,
                showCase ? "" : "fixed"
            )}
        >
            <div className="mx-auto flex max-w-screen-lg items-center gap-3">
                <div className="relative flex-shrink-0">
                    <Avatar
                        className={`h-14 w-14 rounded-sm ${currentTheme.avatarBorder}`}
                    >
                        <AvatarImage
                            src={
                                nowPlaying.item.album.images[0]?.url ||
                                "/placeholder.svg"
                            }
                            alt={nowPlaying.item.album.name}
                        />
                        <AvatarFallback className="bg-muted">
                            <Music className="h-4 w-4" />
                        </AvatarFallback>
                    </Avatar>

                    {nowPlaying.is_playing ? (
                        <Play
                            size={10}
                            className={cn(
                                "absolute -bottom-1 -right-1 rounded",
                                currentTheme.badge
                            )}
                        />
                    ) : (
                        <Pause
                            size={10}
                            className={cn(
                                "absolute -bottom-1 -right-1 rounded",
                                currentTheme.badge
                            )}
                        />
                    )}
                </div>

                <div className="flex min-w-0 flex-grow flex-col">
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
                            endPadding={5}
                            text={nowPlaying.item.artists
                                .map((artist) => artist.name)
                                .join(", ")}
                        />
                    </div>
                </div>

                {showTimestamp && (
                    <div
                        className={cn(
                            "hidden items-center gap-1 text-xs sm:flex",
                            currentTheme.timestampText
                        )}
                    >
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                            <div
                                className={cn("h-full", currentTheme.badge)}
                                style={{
                                    width: `${progressPercentage}%`,
                                }}
                            />
                        </div>
                        <span>{nowPlaying.progress_ms}</span>
                        <span>/</span>
                        <span>{nowPlaying.item.duration_ms}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
