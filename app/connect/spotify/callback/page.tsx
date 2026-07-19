import SpotifyCallback from "@/components/spotify/callback";

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ code?: string }>;
}) {
    const params = await searchParams;

    return <SpotifyCallback searchParams={params} />;
}
