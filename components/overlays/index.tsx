"use client";

import { Music, Disc } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Marquee from "react-fast-marquee";
import { themes } from "@/components/overlays/theme"; // Import themes
import { CSSProperties } from "react";

interface Track {
    album: {
        images: { url: string }[];
        name: string;
    };
    artists: { name: string }[];
    name: string;
    duration_ms: string;
    raw_duration_ms: number;
}

interface NowPlaying {
    is_playing: boolean;
    item: Track;
    progress_ms: string;
    raw_progress_ms: number;
}

interface SpotifyOverlayProps {
    nowPlaying: NowPlaying;
    showTimestamp?: boolean;
    theme?: keyof typeof themes; // Type the theme as a key of the themes object
    className?: string;
    classNameCardContent?: string;
    style?: CSSProperties;
}

export default function SpotifyOverlay({
    nowPlaying,
    showTimestamp,
    theme = "default", // Default theme is "default"
    className,
    style,
}: SpotifyOverlayProps) {
    const progressPercentage =
        (nowPlaying.raw_progress_ms / nowPlaying.item.raw_duration_ms) * 100;

    let currentTheme = themes[theme]; // Get the theme object from the imported themes
    if (!currentTheme) {
        console.error(`Theme "${theme}" not found.`);
        currentTheme = themes["default"]; // Fallback to the default theme if the specified theme is not found
    }
    return (
        <Card
            className={cn(
                "relative w-96 border-0",
                "shadow-lg backdrop-blur-lg transition-all duration-300",
                currentTheme.card, // Apply the theme's card style
                className
            )}
            style={style}
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
                        <p
                            className={cn(
                                "truncate text-sm",
                                currentTheme.text
                            )}
                        >
                            {nowPlaying.item.artists
                                .map((artist) => artist.name)
                                .join(", ")}
                        </p>

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
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
