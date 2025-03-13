import { useEffect } from "react";
import { cookies } from "next/headers";
import StorageComp from "@/components/storage";

export default async function Page() {
    const cookieStore = await cookies();
    const spotify_access_token = cookieStore.get("spotify_access_token");
    const spotify_refresh_token = cookieStore.get("spotify_refresh_token");
    const spotify_token_expires_at = cookieStore.get(
        "spotify_token_expires_at"
    );
    return (
        <StorageComp
            cookies={{
                access_token: spotify_access_token?.value,
                refresh_token: spotify_refresh_token?.value,
                token_expires_at: spotify_token_expires_at?.value,
            }}
        />
    );
}
