import ThemeShowcase from "@/components/showcase";
import TwitchLogin from "@/components/twitch-login";

export default function Page() {
    return (
        <main className="bg-background">
            <div className="flex flex-row items-center justify-center gap-4">
                <TwitchLogin />
            </div>
            <ThemeShowcase />
        </main>
    );
}
