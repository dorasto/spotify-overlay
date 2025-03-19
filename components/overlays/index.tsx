"use client";

import { Music, Disc } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { themes } from "@/components/overlays/theme"; // Import themes
import { CSSProperties } from "react";
import { positionClasses } from "./positions";
import { NowPlaying, QueueItems } from "@/types";
import Ticker, { VerticalTicker } from "../ticker";

interface SpotifyOverlayProps {
    nowPlaying: NowPlaying;
    showTimestamp?: boolean;
    theme?: keyof typeof themes; // Type the theme as a key of the themes object
    className?: string;
    classNameCardContent?: string;
    style?: CSSProperties;
    position?: keyof typeof positionClasses;
    showCase?: boolean;
    background?: "song-image" | "";
    onMouseDown?: (e: React.MouseEvent) => void;
    ref?: React.RefObject<HTMLDivElement | null>;
    queue?: QueueItems[] | null;
}

export default function SpotifyOverlay({
    nowPlaying,
    showTimestamp,
    theme = "default", // Default theme is "default"
    className,
    style,
    position = "bottom-right",
    showCase,
    background,
    onMouseDown,
    ref,
    queue,
}: SpotifyOverlayProps) {
    const progressPercentage =
        (nowPlaying.raw_progress_ms / nowPlaying.item.raw_duration_ms) * 100;

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
    if (background === "song-image") {
        return (
            <div
                ref={ref}
                onMouseDown={onMouseDown}
                style={{ ...style, overflow: "hidden" }}
                className={cn(
                    "rounded-lg",
                    currentTheme.card,
                    "w-96",
                    !showCase && currentPosition,
                    showCase ? "relative" : "fixed",
                    className
                )}
            >
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: `url(${nowPlaying.item.album.images[0].url})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        filter: "blur(3px)", // Only applies to the background
                        WebkitFilter: "blur(3px)",
                    }}
                />

                <SpotifyOverlay
                    nowPlaying={nowPlaying}
                    showTimestamp={showTimestamp}
                    theme={theme}
                    className={cn("backdrop-blur-none", "right-0 top-0")}
                    style={{
                        position: "relative",
                        zIndex: 10, // Ensures content is above the blurred background
                        background: "transparent",
                    }}
                    queue={queue}
                />
            </div>
        );
    }
    return (
        <Card
            className={cn(
                "w-96 border-0",
                "shadow-lg backdrop-blur-lg transition-all duration-300",
                currentTheme.card, // Apply the theme's card style
                currentPosition,
                className,
                showCase ? "" : "fixed"
            )}
            style={style}
            onMouseDown={onMouseDown}
        >
            <CardContent className={cn(showTimestamp ? "pb-3" : "p-1")}>
                <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                        <Avatar
                            className={cn(
                                "h-14 w-14",
                                currentTheme.avatarBorder // Apply the avatar border from theme
                            )}
                        >
                            <AvatarImage
                                src={
                                    nowPlaying.item.album.images[0]?.url ||
                                    "/placeholder.svg"
                                }
                                alt={nowPlaying.item.album.name}
                                className={
                                    theme.startsWith("neon-") &&
                                    nowPlaying.is_playing
                                        ? "animate-spin"
                                        : ""
                                }
                                style={{ animationDuration: "10s" }}
                            />
                            <AvatarFallback
                                className={cn(
                                    "bg-muted",
                                    currentTheme.avatarFallback
                                )}
                            >
                                {theme.startsWith("neon-") ? (
                                    <Disc
                                        className={cn(
                                            "h-6 w-6",
                                            currentTheme.text
                                        )}
                                    />
                                ) : (
                                    <Music className="h-6 w-6 text-white" />
                                )}
                            </AvatarFallback>
                        </Avatar>

                        <Badge
                            variant="music"
                            className={cn(
                                "hover:none absolute -bottom-1 -right-1 h-4 w-4 p-0",
                                currentTheme.badge
                            )}
                        >
                            <Music size={20} className="text-black" />
                        </Badge>
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
                                endPadding={0}
                                text={nowPlaying.item.artists
                                    .map((artist) => artist.name)
                                    .join(", ")}
                            />
                        </div>

                        {showTimestamp && (
                            <div
                                className={cn(
                                    "mt-2 flex items-center gap-1 text-xs",
                                    currentTheme.timestampText
                                )}
                            >
                                <div className="absolute bottom-[0.4rem] left-0 right-0 h-1 bg-black/50">
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
                        {queue && (
                            <VerticalTicker
                                duration={10}
                                endPadding={0}
                                className={cn(
                                    "text-xs",
                                    currentTheme.timestampText
                                )}
                                number={true}
                                texts={queue
                                    .slice(0, 5)
                                    .map(
                                        (track) =>
                                            track.name +
                                            " - " +
                                            track.artists
                                                .map((artist) => artist.name)
                                                .join(", ")
                                    )}
                            />
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
