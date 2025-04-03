import ThemeShowcase from "@/components/showcase";
import SpotifyLogin from "@/components/spotify-login";
import TwitchConnect from "@/components/twitch-connect";

export default function Page() {
    return (
        <main className="bg-background">
            <div className="flex flex-col items-center justify-center">
                <SpotifyLogin />
                <TwitchConnect />
            </div>
            <ThemeShowcase />
        </main>
    );
}
