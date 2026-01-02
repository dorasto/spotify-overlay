"use client";

import { cn } from "@/lib/utils";
import { themes } from "@/components/overlays/theme";
import { positionClasses } from "./positions";
import { NowPlaying, QueueItems } from "@/types";
import { CSSProperties } from "react";
import Ticker, { VerticalTicker } from "../ticker";
import Image from "next/image";

function extractAccentColors(theme: any) {
    if (theme.accentFrom && theme.accentTo) return [theme.accentFrom, theme.accentTo];
    if (theme.text?.includes("gray")) return ["#b0b0b0", "#888"];
    if (theme.badge?.includes("amber")) return ["#fcd34d", "#f97316"];
    if (theme.badge?.includes("blue")) return ["#3b82f6", "#06b6d4"];
    if (theme.badge?.includes("pink") || theme.badge?.includes("fuchsia"))
        return ["#ec4899", "#a855f7"];
    return ["#00ffe7", "#ff00c8"]; // default fallback
}

interface SpotifyOverlayAIProps {
    nowPlaying: NowPlaying;
    showTimestamp?: boolean;
    theme?: keyof typeof themes;
    position?: keyof typeof positionClasses;
    style?: CSSProperties;
    showCase?: boolean;
    queue?: QueueItems[] | null;
}

export default function SpotifyOverlayAI({
    nowPlaying,
    showTimestamp = true,
    theme = "default",
    position = "bottom-right",
    showCase,
    style,
    queue,
}: SpotifyOverlayAIProps) {
    const progressPercentage =
        (nowPlaying.raw_progress_ms / nowPlaying.item.raw_duration_ms) * 100;

    const currentTheme = themes[theme] ?? themes["default"];
    const currentPosition =
        positionClasses[position] ?? positionClasses["bottom-right"];
    const albumImage =
        nowPlaying.item.album.images[0]?.url || "/placeholder.svg";

    const [accentFrom, accentTo] = extractAccentColors(currentTheme);

    return (
        <div
            style={style}
            className={cn(
                "flex items-center gap-3 w-[22rem] px-3 py-2 rounded-xl",
                "border border-white/10 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.4)]",
                currentTheme.card,
                currentPosition,
                showCase ? "" : "fixed select-none"
            )}
        >
            {/* --- Circular Album Art + Progress Ring --- */}
            <div className="relative h-12 w-12 flex-shrink-0">
                <div className="relative h-full w-full rounded-full overflow-hidden border border-white/10">
                    <Image
                        src={albumImage}
                        alt={nowPlaying.item.album.name}
                        fill
                        sizes="48px"
                        className="object-cover rounded-full"
                        priority
                    />
                </div>

                {/* Circular progress ring */}
                <svg
                    className="absolute inset-0 h-full w-full"
                    viewBox="0 0 60 60"
                    fill="none"
                >
                    <circle cx="30" cy="30" r="28" className="stroke-white/10" strokeWidth="2" />
                    <circle
                        cx="30"
                        cy="30"
                        r="28"
                        stroke="url(#ringGradient)"
                        strokeWidth="2.2"
                        strokeDasharray={2 * Math.PI * 28}
                        strokeDashoffset={
                            2 * Math.PI * 28 - (progressPercentage / 100) * 2 * Math.PI * 28
                        }
                        className="transition-[stroke-dashoffset] duration-700 ease-out"
                    />
                    <defs>
                        <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={accentFrom} />
                            <stop offset="100%" stopColor={accentTo} />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            {/* --- Track Info --- */}
            <div className="flex flex-col min-w-0 flex-1">
                <div className="overflow-hidden">
                    <Ticker
                        text={nowPlaying.item.name}
                        className={cn("text-[0.95rem] font-semibold leading-tight", currentTheme.text)}
                    />
                </div>
                <div className={cn("text-[0.8rem] leading-tight", currentTheme.text)}>
                    <Ticker
                        duration={20}
                        endPadding={0}
                        text={nowPlaying.item.artists.map((a) => a.name).join(", ")}
                    />
                </div>

                {showTimestamp && (
                    <div
                        className={cn(
                            "mt-[4px] flex items-center gap-1 text-[0.7rem]",
                            currentTheme.timestampText
                        )}
                    >
                        <span>{formatTime(nowPlaying.raw_progress_ms)}</span>
                        <div className="relative h-[1.5px] flex-1 bg-white/10 rounded overflow-hidden">
                            <div
                                className="h-full"
                                style={{
                                    width: `${progressPercentage}%`,
                                    background: `linear-gradient(to right, ${accentFrom}, ${accentTo})`,
                                }}
                            />
                        </div>
                        <span>{formatTime(nowPlaying.item.raw_duration_ms)}</span>
                    </div>
                )}

                {queue && (
                    <VerticalTicker
                        duration={10}
                        endPadding={0}
                        className={cn("text-xs mt-1", currentTheme.timestampText)}
                        number={true}
                        texts={queue
                            .slice(0, 3)
                            .map(
                                (t) => `${t.name} - ${t.artists.map((a) => a.name).join(", ")}`
                            )}
                    />
                )}
            </div>
        </div>
    );
}

function formatTime(ms: number) {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
}