"use client";

import { themes } from "@/components/overlays/theme"; // Import the themes object
import { positionClasses } from "./positions";
import { NowPlaying } from "@/types";
import { Music, Disc } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Ticker from "../ticker";
import { CSSProperties } from "react";
export default function SpotifyOverlayMediaStack({
    nowPlaying,
    showTimestamp = false,
    theme = "default", // Default theme is "default"
    showCase,
    position = "bottom-right",
    style,
}: {
    nowPlaying: NowPlaying; // Current playing track details
    showTimestamp?: boolean; // Whether to show the timestamp of the track
    theme?: keyof typeof themes; // Use the keys of the themes object as valid values for the theme prop
    showCase?: boolean;
    position?: keyof typeof positionClasses;
    style?: CSSProperties;
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
    const progressPercentage =
        (nowPlaying.raw_progress_ms / nowPlaying.item.raw_duration_ms) * 100;
    return (
        <div
            style={{ ...style, overflow: "hidden" }}
            className={cn(
                "flex w-96 flex-row justify-between rounded-e-lg border-0",
                currentPosition,
                showCase ? "" : "fixed"
            )}
        >
            <Avatar
                className={cn(
                    "h-14 w-14",
                    currentTheme.avatarBorder, // Apply the avatar border from theme
                    showTimestamp && "top-[11px]"
                )}
            >
                <AvatarImage
                    src={
                        nowPlaying.item.album.images[0]?.url ||
                        "/placeholder.svg"
                    }
                    alt={nowPlaying.item.album.name}
                    className={
                        theme.startsWith("neon-") && nowPlaying.is_playing
                            ? "animate-spin"
                            : ""
                    }
                    style={{ animationDuration: "10s" }}
                />
                <AvatarFallback
                    className={cn("bg-muted", currentTheme.avatarFallback)}
                >
                    {theme.startsWith("neon-") ? (
                        <Disc className={cn("h-6 w-6", currentTheme.text)} />
                    ) : (
                        <Music className="h-6 w-6 text-white" />
                    )}
                </AvatarFallback>
            </Avatar>
            <Card
                className={cn(
                    "w-80 border-0",
                    currentTheme.card // Apply the theme's card style
                )}
            >
                <CardContent className={cn(showTimestamp ? "pb-3" : "p-1")}>
                    <div className="flex items-center gap-3">
                        <div
                            className={cn(
                                "flex min-w-0 flex-grow flex-col",
                                showTimestamp && "relative top-[5px]"
                            )}
                        >
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
                                    endPadding={0}
                                    text={nowPlaying.item.artists
                                        .map((artist) => artist.name)
                                        .join(", ")}
                                />
                            </div>
                            {showTimestamp && (
                                <div
                                    className={cn(
                                        "flex items-center gap-1 text-xs",
                                        currentTheme.timestampText
                                    )}
                                >
                                    <div className="inherit bottom-[0.4rem] left-0 right-0 h-1 w-[100%] bg-black/50">
                                        <div
                                            className={cn(
                                                "h-full",
                                                currentTheme.badge
                                            )}
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
                </CardContent>
            </Card>
        </div>
    );
}
