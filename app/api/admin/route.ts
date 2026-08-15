import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";

export const runtime = "nodejs";

function isAdmin(userId: string): boolean {
    const adminId = process.env.ADMIN_USER_ID;
    if (!adminId) return false;
    return userId === adminId;
}

export async function GET() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user || !isAdmin(session.user.id)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const allUsers = await db.query.user.findMany({
        orderBy: (users, { desc }) => [desc(users.createdAt)],
    });

    const allConfigs = await db.query.userConfig.findMany();

    const configMap = new Map(allConfigs.map((c) => [c.userId, c]));

    const usersWithDetails = allUsers.map((u) => {
        const config = configMap.get(u.id);
        const hasSpotify = !!config?.spotifyAccessToken;
        const hasTwitch = !!config?.twitchEnabled;
        return {
            id: u.id,
            name: u.name,
            image: u.image,
            createdAt: u.createdAt,
            hasSpotify,
            hasTwitch,
            overlayStyle: config?.overlayStyle ?? null,
            overlayTheme: config?.overlayTheme ?? null,
            enabled: u.enabled,
        };
    });

    const totalUsers = allUsers.length;
    const spotifyConnected = usersWithDetails.filter((u) => u.hasSpotify).length;
    const twitchEnabled = usersWithDetails.filter((u) => u.hasTwitch).length;

    return NextResponse.json({
        stats: {
            totalUsers,
            spotifyConnected,
            twitchEnabled,
        },
        users: usersWithDetails,
    });
}
