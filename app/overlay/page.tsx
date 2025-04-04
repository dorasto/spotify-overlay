import { SettingsSheet } from "@/components/Settings";
import ShowcaseSheet from "@/components/ShowcaseSheet";
import SpotifyOverlayMiddle from "@/components/spotify-overlay";
import TwitchBotChat from "@/components/twitch";
import Zoom from "@/components/zoom";

export default async function Page() {
    return (
        <div className="w-full">
            <Zoom />
            <SettingsSheet />
            <ShowcaseSheet />
            <TwitchBotChat />
            <div className="absolute">
                <SpotifyOverlayMiddle />
            </div>
        </div>
    );
}
