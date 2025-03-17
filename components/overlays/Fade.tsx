"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { themes } from "@/components/overlays/theme"; // Import the themes object
import SpotifyOverlay from ".";
import { positionClasses } from "./positions";
import { NowPlaying } from "@/types";

export default function SpotifyOverlayFade({
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

        if (nowPlaying.is_playing) {
            setAnimationState("entering");

            enterTimer = setTimeout(() => {
                setAnimationState("visible");
            }, 1000);
        } else {
            exitTimer = setTimeout(() => {
                setAnimationState("exiting");
            }, 500);
        }

        return () => {
            if (enterTimer) clearTimeout(enterTimer);
            if (exitTimer) clearTimeout(exitTimer);
        };
    }, [nowPlaying.is_playing]);
    let enteringTranslate = "translateX(40rem)"; // Default to coming from the right
    let exitingTranslate = "translateX(40rem)"; // Exiting from the right by default
    let transitionDuration = "2200ms"; // Default transition duration
    // Set translate for each position
    if (position.includes("left")) {
        enteringTranslate = "translateX(-40rem)"; // Coming from the left
        exitingTranslate = "translateX(-40rem)"; // Exiting to the left
    } else if (position === "top-center") {
        enteringTranslate = "translateX(-50%) translateY(-7rem)"; // Coming from the top
        exitingTranslate = "translateX(-50%) translateY(-7rem)"; // Exiting upwards (no horizontal movement)
        transitionDuration = "1500ms"; // Shorter transition duration for top-center
    } else if (position === "bottom-center") {
        enteringTranslate = "translateX(-50%) translateY(7rem)"; // Coming from the bottom
        exitingTranslate = "translateX(-50%) translateY(7rem)"; // Exiting downwards (no horizontal movement)
        transitionDuration = "1500ms"; // Shorter transition duration for bottom-center
    }

    return (
        <SpotifyOverlay
            nowPlaying={nowPlaying}
            showTimestamp={showTimestamp}
            theme={theme}
            className={cn(
                "transition-all",
                currentPosition,
                animationState === "visible" && "opacity-100", // Fully visible state
                animationState === "entering" && "opacity-0", // Start with opacity 0 when entering
                animationState === "exiting" && "opacity-0" // Fade out on exit
            )}
            style={{
                transitionDuration: transitionDuration, // Set the transition duration to 1000ms
                animationDuration: transitionDuration, // Set the animation duration to 1000ms
                transform:
                    animationState === "entering"
                        ? (position === "center" &&
                              "scale(1.5) translateX(-50%) translateY(-50%)") ||
                          enteringTranslate // Apply translate for entering
                        : animationState === "exiting"
                          ? (position === "center" &&
                                "scale(0.5) translateX(-50%) translateY(-50%)") ||
                            exitingTranslate // Apply translate for exiting
                          : "", // No translate when visible
            }}
            position={position}
            showCase={showCase}
            background={background}
        />
    );
}
