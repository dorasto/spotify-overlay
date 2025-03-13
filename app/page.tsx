import ThemeShowcase from "@/components/showcase";
import SpotifyLogin from "@/components/spotify-login";

export default function Home() {
    return (
        <main className="bg-zinc-900">
            <div className="flex flex-col items-center justify-center">
                <SpotifyLogin />
            </div>
            <ThemeShowcase />
        </main>
    );
}
