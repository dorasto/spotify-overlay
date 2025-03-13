import SpotifyCallback from "@/components/spotify/callback";

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ code?: string }>;
}) {
    const SearchParams = await searchParams;

    return (
        <SpotifyCallback
            searchParams={SearchParams}
            rootDomain={process.env.ROOT_DOMAIN || ""}
        />
    );
}
