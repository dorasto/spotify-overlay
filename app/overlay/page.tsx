import SpotifyOverlayMiddle from "@/components/spotify-overlay";

export default async function Page() {
    return (
        <div className="fixed bottom-4 right-4 z-50">
            <SpotifyOverlayMiddle />
        </div>
    );
}
