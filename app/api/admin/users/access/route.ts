import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";

export async function PATCH(request: Request) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 },
        );
    }

    if (session.user.id !== process.env.ADMIN_USER_ID) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    if (
        typeof body.userId !== "string" ||
        typeof body.enabled !== "boolean"
    ) {
        return NextResponse.json(
            { error: "Invalid request" },
            { status: 400 },
        );
    }

    if (body.userId === session.user.id) {
        return NextResponse.json(
            { error: "You cannot disable your own account" },
            { status: 400 },
        );
    }

    const updated = await db
        .update(user)
        .set({ enabled: body.enabled })
        .where(eq(user.id, body.userId))
        .returning({ id: user.id, enabled: user.enabled });

    if (updated.length === 0) {
        return NextResponse.json(
            { error: "User not found" },
            { status: 404 },
        );
    }

    return NextResponse.json({
        success: true,
        user: updated[0],
    });
}