import { themes } from "@/components/overlays/theme"; // Import the themes object
import SpotifyOverlay from ".";
import { positionClasses } from "./positions";
import { NowPlaying, QueueItems } from "@/types";

export default function QueueOverlay({
    nowPlaying,
    showTimestamp = false,
    theme = "default", // Default theme is "default"
    showCase,
    position = "bottom-right",
    background,
    queue,
}: {
    nowPlaying: NowPlaying; // Current playing track details
    showTimestamp?: boolean; // Whether to show the timestamp of the track
    theme?: keyof typeof themes; // Use the keys of the themes object as valid values for the theme prop
    showCase?: boolean;
    position?: keyof typeof positionClasses;
    background?: "song-image" | "";
    queue: QueueItems[] | null;
}) {
    return (
        <>
            <SpotifyOverlay
                nowPlaying={nowPlaying}
                showTimestamp={showTimestamp}
                theme={theme}
                position={position}
                showCase={showCase}
                background={background}
                queue={queue}
            />
        </>
    );
}
