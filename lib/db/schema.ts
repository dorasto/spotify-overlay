import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const user = sqliteTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: integer("emailVerified", { mode: "boolean" }).notNull(),
    image: text("image"),
    overlayToken: text("overlayToken").unique(),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const session = sqliteTable("session", {
    id: text("id").primaryKey(),
    userId: text("userId")
        .notNull()
        .references(() => user.id),
    token: text("token").notNull().unique(),
    expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const account = sqliteTable("account", {
    id: text("id").primaryKey(),
    userId: text("userId")
        .notNull()
        .references(() => user.id),
    accountId: text("accountId").notNull(),
    providerId: text("providerId").notNull(),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    idToken: text("idToken"),
    accessTokenExpiresAt: integer("accessTokenExpiresAt", { mode: "timestamp" }),
    refreshTokenExpiresAt: integer("refreshTokenExpiresAt", { mode: "timestamp" }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
    createdAt: integer("createdAt", { mode: "timestamp" }),
    updatedAt: integer("updatedAt", { mode: "timestamp" }),
});

export const userConfig = sqliteTable("user_config", {
    id: text("id").primaryKey(),
    userId: text("userId")
        .notNull()
        .unique()
        .references(() => user.id, { onDelete: "cascade" }),
    spotifyAccessToken: text("spotifyAccessToken"),
    spotifyRefreshToken: text("spotifyRefreshToken"),
    spotifyTokenExpiresAt: integer("spotifyTokenExpiresAt", { mode: "timestamp" }),
    twitchEnabled: integer("twitchEnabled", { mode: "boolean" }).default(false),
    twitchAutoAnnounce: integer("twitchAutoAnnounce", { mode: "boolean" }).default(false),
    twitchEnableSongCommand: integer("twitchEnableSongCommand", { mode: "boolean" }).default(true),
    twitchEnableQueueCommand: integer("twitchEnableQueueCommand", { mode: "boolean" }).default(true),
    twitchEnableSrCommand: integer("twitchEnableSrCommand", { mode: "boolean" }).default(true),
    overlayStyle: text("overlayStyle").default("default"),
    overlayTheme: text("overlayTheme").default("default"),
    overlayPosition: text("overlayPosition").default("bottom-right"),
    autoHide: integer("autoHide", { mode: "boolean" }).default(false),
    showTimestamp: integer("showTimestamp", { mode: "boolean" }).default(false),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});
