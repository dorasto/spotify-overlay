import TwitchCallback from "@/components/twitch/callback";

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ code?: string }>;
}) {
    const SearchParams = await searchParams;

    return (
        <TwitchCallback
            searchParams={SearchParams}
            rootDomain={process.env.ROOT_DOMAIN || ""}
        />
    );
}
