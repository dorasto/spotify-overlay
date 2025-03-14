import ShowcaseSheet from "@/components/ShowcaseSheet";
import SpotifyOverlayMiddle from "@/components/spotify-overlay";

export default async function Page() {
    return (
        <div className="w-full">
            <ShowcaseSheet />
            <div className="fixed bottom-4 right-4 z-50">
                <SpotifyOverlayMiddle />
            </div>
        </div>
    );
}
