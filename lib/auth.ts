import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL!,
    trustedOrigins: ["http://localhost:5434", "http://127.0.0.1:5434"],
    database: drizzleAdapter(db, {
        provider: "pg",
        schema,
    }),
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        twitch: {
            clientId: process.env.TWITCH_CLIENT_ID!,
            clientSecret: process.env.TWITCH_CLIENT_SECRET!,
            scope: ["chat:read", "chat:edit"]
        },
    },
    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    const overlayToken = `ovl_${crypto.randomBytes(32).toString("hex")}`;
                    await db
                        .update(schema.user)
                        .set({ overlayToken })
                        .where(eq(schema.user.id, user.id));
                },
            },
        },
    },
});

export type Session = typeof auth.$Infer.Session;
