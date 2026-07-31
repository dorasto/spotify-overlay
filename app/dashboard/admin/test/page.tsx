import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import SpotifyOverlayTestBench from "@/components/testing/SpotifyOverlayTestBench";
import { user } from "@/lib/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
export const runtime = "nodejs";

export default async function AdminPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect("/");
    }

    const adminId = process.env.ADMIN_USER_ID;
    if (!adminId || session.user.id !== adminId) {
        redirect("/dashboard");
    }

    const userData = await db.query.user.findFirst({
        where: eq(user.id, session.user.id),
    });

    if (!userData?.overlayToken) {
        return null;
    }

    return (
        <SpotifyOverlayTestBench overlayToken={userData.overlayToken} />
    );
}