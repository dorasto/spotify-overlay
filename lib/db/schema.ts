import { pgTable, text, boolean, timestamp, integer, real } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("emailVerified").notNull(),
    image: text("image"),
    overlayToken: text("overlayToken").unique(),
    createdAt: timestamp("createdAt").notNull(),
    updatedAt: timestamp("updatedAt").notNull(),
    enabled: boolean("enabled").default(true).notNull()
});

export const session = pgTable("session", {
    id: text("id").primaryKey(),
    userId: text("userId")
        .notNull()
        .references(() => user.id),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expiresAt").notNull(),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    createdAt: timestamp("createdAt").notNull(),
    updatedAt: timestamp("updatedAt").notNull(),
});

export const account = pgTable("account", {
    id: text("id").primaryKey(),
    userId: text("userId")
        .notNull()
        .references(() => user.id),
    accountId: text("accountId").notNull(),
    providerId: text("providerId").notNull(),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    idToken: text("idToken"),
    accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
    refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("createdAt").notNull(),
    updatedAt: timestamp("updatedAt").notNull(),
});

export const verification = pgTable("verification", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    createdAt: timestamp("createdAt"),
    updatedAt: timestamp("updatedAt"),
});

export const userConfig = pgTable("user_config", {
    id: text("id").primaryKey(),
    userId: text("userId")
        .notNull()
        .unique()
        .references(() => user.id, { onDelete: "cascade" }),
    spotifyAccessToken: text("spotifyAccessToken"),
    spotifyRefreshToken: text("spotifyRefreshToken"),
    spotifyTokenExpiresAt: timestamp("spotifyTokenExpiresAt"),
    twitchEnabled: boolean("twitchEnabled").default(false),
    twitchAutoAnnounce: boolean("twitchAutoAnnounce").default(false),
    twitchEnableSongCommand: boolean("twitchEnableSongCommand").default(true),
    twitchEnableQueueCommand: boolean("twitchEnableQueueCommand").default(true),
    twitchEnableSrCommand: boolean("twitchEnableSrCommand").default(true),
    overlayStyle: text("overlayStyle").default("default"),
    overlayTheme: text("overlayTheme").default("default"),
    overlayPosition: text("overlayPosition").default("bottom-right"),
    autoHide: boolean("autoHide").default(false),
    showTimestamp: boolean("showTimestamp").default(false),
    customX: integer("customX").default(0),
    customY: integer("customY").default(0),
    customScale: real("customScale").default(1),
    createdAt: timestamp("createdAt").notNull(),
    updatedAt: timestamp("updatedAt").notNull(),
});
