"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { themes } from "@/components/overlays/theme"; // Import the themes object
import SpotifyOverlay from ".";
import AnimatedOverlay from "./Animated";
import { positionClasses } from "./positions";
import { NowPlaying } from "@/types";

export default function TestOverlay({
    nowPlaying,
    showTimestamp = false,
    theme = "default", // Default theme is "default"
    showCase,
    position = "bottom-right",
    background,
}: {
    nowPlaying: NowPlaying; // Current playing track details
    showTimestamp?: boolean; // Whether to show the timestamp of the track
    theme?: keyof typeof themes; // Use the keys of the themes object as valid values for the theme prop
    showCase?: boolean;
    position?: keyof typeof positionClasses;
    background?: "song-image" | "";
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

    const [animationState, setAnimationState] = useState<
        "entering" | "visible" | "exiting"
    >("visible");
    useEffect(() => {
        let enterTimer: NodeJS.Timeout | null = null;
        let exitTimer: NodeJS.Timeout | null = null;

        if (nowPlaying.item?.name) {
            setAnimationState("entering");
            // setVisible(true);
            enterTimer = setTimeout(() => {
                setAnimationState("visible");
            }, 1000);
            exitTimer = setTimeout(() => {
                setAnimationState("exiting");
                // setVisible(false);
            }, 10000);
            return () => {
                if (enterTimer) clearTimeout(enterTimer);
                if (exitTimer) clearTimeout(exitTimer);
            };
        }
    }, [nowPlaying.item?.name]);
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
        <>
            <SpotifyOverlay
                nowPlaying={nowPlaying}
                showTimestamp={showTimestamp}
                theme={theme}
                className={cn(
                    "z-50 w-64 transition-all",
                    "translate-x-8 opacity-0",
                    animationState === "entering" && "translate-x-8 opacity-0",
                    animationState === "exiting" &&
                        "w-96 translate-x-0 opacity-100",
                    showCase ? "" : "fixed"
                )}
                style={{
                    transform:
                        animationState === "entering"
                            ? "translateX(2rem)"
                            : (animationState === "exiting" &&
                                  (position === "top-center" ||
                                      position === "bottom-center") &&
                                  "translateX(-50%)") ||
                              (position === "center" &&
                                  "translateX(-50%) translateY(-50%)") ||
                              "",
                    transitionDuration: "1s",
                }}
                position={position}
                showCase={showCase}
                background={background}
            />
            <AnimatedOverlay
                nowPlaying={nowPlaying}
                showTimestamp={showTimestamp}
                theme={theme}
                autoHide={false}
                showCase={showCase}
                className={cn(
                    currentPosition,
                    animationState === "visible" && "translate-y-0 opacity-100"
                )}
                style={{
                    transform:
                        animationState === "entering"
                            ? enteringAnimation
                            : (animationState === "exiting" &&
                                  exitingAnimation) ||
                              (position == "center" &&
                                  "translate(-50%, -50%)") ||
                              (position === "middle-left" &&
                                  "translate(0%, -50%)") ||
                              (position === "middle-right" &&
                                  "translate(0%,-50%)") ||
                              "",
                    transitionDuration: "2s",
                }}
                position={position}
            />
        </>
    );
}
