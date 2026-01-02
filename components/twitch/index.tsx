"use client";
import {
    fetchLocalStorage,
    fetchLocalStorageJSON,
    useLocalStorage,
} from "@/hooks/useLocalStorage";
import { LocalStorageNowPlaying } from "@/types";
import { parseAsBoolean, useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
import tmi from "tmi.js";

export default function TwitchBotChat() {
    const [token, setToken] = useLocalStorage("twitch_access_token", null);
    const [spotifyToken] = useLocalStorage("spotify_access_token", null);
    const [refreshToken, setRefreshToken] = useLocalStorage(
        "twitch_refresh_token",
        null
    );

    const [songRequest] = useQueryState(
        "sr",
        parseAsBoolean.withDefault(false)
    );

    const [autoAnnounce] = useQueryState(
        "autoAnnounce",
        parseAsBoolean.withDefault(false)
    );

    const client = useRef<tmi.Client | null>(null);
    const isListenerAttached = useRef(false);
    const [isConnected, setIsConnected] = useState(false);
    const lastAnnouncedSongId = useRef<string | null>(null);

    useEffect(() => {
        const username = fetchLocalStorage("twitch_username");
        if (!username || !token) {
            return;
        }

        if (isConnected) return;

        console.log("Connecting to Twitch chat...");

        client.current = new tmi.Client({
            channels: [username],
            identity: {
                username: username,
                password: "oauth:" + token,
            },
        });

        client.current
            .connect()
            .then(() => {
                console.log("Connected to Twitch chat!");
                setIsConnected(true);
            })
            .catch(async (err) => {
                isListenerAttached.current = false;
                console.error("Connection failed:", err);
                if (err.includes("Login authentication failed")) {
                    await refreshTwitchToken();
                }
            });

        if (!isListenerAttached.current) {
            client.current?.on(
                "message",
                async (channel, tags, message, self) => {
                    if (self) return;

                    const command = message
                        .trim()
                        .toLowerCase()
                        .split(" ")[0];

                    if (!command.startsWith("!")) return;

                    const args = message.trim().split(" ").slice(1);

                    switch (command) {
                        case "!ping":
                            client.current?.say(channel, "✅ Bot is online!");
                            break;

                        case "!commands":
                            client.current?.say(
                                channel,
                                "🎮 Commands: !song, !queue, !sr <Spotify link>, !spotify"
                            );
                            break;

                        case "!spotify":
                            client.current?.say(
                                channel,
                                spotifyToken
                                    ? "✅ Spotify is connected."
                                    : "❌ Spotify is not connected."
                            );
                            break;

                        case "!song":
                            const nowPlayingSong =
                                fetchLocalStorageJSON<LocalStorageNowPlaying | null>(
                                    "spotify_now_playing",
                                    null
                                );

                            if (!nowPlayingSong) {
                                client.current?.say(
                                    channel,
                                    "I can't see a song right now 😢"
                                );
                                return;
                            }

                            const songMessage = nowPlayingSong.playing
                                ? `🎵 Now Playing: ${nowPlayingSong.name} by ${nowPlayingSong.artists.join(
                                      ", "
                                  )} | 🔗 ${nowPlayingSong.url}`
                                : `⏸ Last Played: ${nowPlayingSong.name} by ${nowPlayingSong.artists.join(
                                      ", "
                                  )} | 🔗 ${nowPlayingSong.url}`;

                            client.current?.say(channel, songMessage);
                            break;

                        case "!queue":
                            if (!spotifyToken) {
                                client.current?.say(
                                    channel,
                                    "❌ Spotify is not connected."
                                );
                                return;
                            }

                            const queue = await getQueue(spotifyToken);

                            if (!queue || queue.length === 0) {
                                client.current?.say(
                                    channel,
                                    "🎵 The queue is currently empty."
                                );
                                return;
                            }

                            const formatted = queue
                                .slice(0, 5)
                                .map(
                                    (track: { name: any; artists: any; }, i: number) =>
                                        `${i + 1}. ${track.name} – ${track.artists}`
                                )
                                .join(" | ");

                            client.current?.say(
                                channel,
                                `🎶 Up Next: ${formatted}`
                            );
                            break;

                        case "!sr":
                            if (!songRequest) return;

                            if (!spotifyToken) {
                                client.current?.say(
                                    channel,
                                    "❌ Spotify is not connected."
                                );
                                return;
                            }

                            if (!args[0]) {
                                client.current?.say(
                                    channel,
                                    "Usage: !sr <Spotify track URL>"
                                );
                                return;
                            }

                            try {
                                const url = new URL(args[0]);
                                const parts = url.pathname.split("/");
                                const type = parts[parts.length - 2];
                                const id = parts[parts.length - 1];

                                if (type !== "track" || !id) {
                                    client.current?.say(
                                        channel,
                                        "❌ Please provide a Spotify track link."
                                    );
                                    return;
                                }

                                const response = await fetch(
                                    `https://api.spotify.com/v1/me/player/queue?uri=spotify:track:${id}`,
                                    {
                                        method: "POST",
                                        headers: {
                                            Authorization: `Bearer ${spotifyToken}`,
                                        },
                                    }
                                );

                                if (
                                    response.status === 200 ||
                                    response.status === 204
                                ) {
                                    const track = await getTrackDetails(
                                        id,
                                        spotifyToken
                                    );
                                    if (track) {
                                        client.current?.say(
                                            channel,
                                            `✅ Added: ${track.name} by ${track.artists}`
                                        );
                                    }
                                }
                            } catch (error) {
                                client.current?.say(
                                    channel,
                                    "❌ Invalid Spotify URL."
                                );
                            }
                            break;

                        default:
                            break;
                    }
                }
            );

            isListenerAttached.current = true;
        }
    }, [isConnected, token]);

    useEffect(() => {
        if (!autoAnnounce) return;
        if (!isConnected) return;

        const interval = setInterval(() => {
            const nowPlaying =
                fetchLocalStorageJSON<LocalStorageNowPlaying | null>(
                    "spotify_now_playing",
                    null
                );

            if (
                nowPlaying &&
                nowPlaying.playing &&
                nowPlaying.id &&
                nowPlaying.id !== lastAnnouncedSongId.current
            ) {
                lastAnnouncedSongId.current = nowPlaying.id;

                const message = `🎶 Now Playing: ${nowPlaying.name} by ${nowPlaying.artists.join(
                    ", "
                )} | 🔗 ${nowPlaying.url}`;

                const username = fetchLocalStorage("twitch_username");
                if (username) {
                    client.current?.say(`#${username}`, message);
                }
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [autoAnnounce, isConnected]);

    const refreshTwitchToken = async () => {
        if (!refreshToken) return;

        const response = await fetch("/connect/twitch/refresh", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: refreshToken }),
        });

        const data = await response.json();

        if (data.access_token) {
            setIsConnected(false);
            setToken(data.access_token);
            if (data.refresh_token) {
                setRefreshToken(data.refresh_token);
            }
        }
    };

    return null;
}

async function getTrackDetails(trackId: string, spotifyToken: string) {
    try {
        const response = await fetch(
            `https://api.spotify.com/v1/tracks/${trackId}`,
            {
                headers: {
                    Authorization: `Bearer ${spotifyToken}`,
                },
            }
        );
        if (response.status === 200) {
            const data = await response.json();
            return {
                name: data.name,
                artists: data.artists.map((a: any) => a.name).join(", "),
            };
        }
    } catch (error) {
        console.error(error);
    }
    return null;
}

async function getQueue(spotifyToken: string) {
    try {
        const response = await fetch(
            "https://api.spotify.com/v1/me/player/queue",
            {
                headers: {
                    Authorization: `Bearer ${spotifyToken}`,
                },
            }
        );

        if (response.status === 200) {
            const data = await response.json();
            return data.queue.map((track: any) => ({
                name: track.name,
                artists: track.artists.map((a: any) => a.name).join(", "),
            }));
        }
    } catch (error) {
        console.error("Error fetching queue:", error);
    }
    return null;
}