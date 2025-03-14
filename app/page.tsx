import ThemeShowcase from "@/components/showcase";
import SpotifyLogin from "@/components/spotify-login";

export default function Page() {
    return (
        <main className="bg-background">
            <div className="flex flex-col items-center justify-center">
                <SpotifyLogin />
            </div>
            <ThemeShowcase />
        </main>
    );
}
