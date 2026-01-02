import { SettingsSheet } from "@/components/Settings";
import ShowcaseSheet from "@/components/ShowcaseSheet";
import SpotifyOverlayMiddle from "@/components/spotify-overlay";
import TwitchBotChat from "@/components/twitch";
import Zoom from "@/components/zoom";

export default async function Page({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const { token } = await searchParams;
    return (
        <div className="w-full">
            <Zoom />
            <SettingsSheet />
            <ShowcaseSheet />
            <TwitchBotChat />
            <div className="absolute">
                <SpotifyOverlayMiddle firstLoadToken={token as string} />
            </div>
        </div>
    );
}
