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
    const client = useRef<tmi.Client | null>(null);
    const isListenerAttached = useRef(false);
    const [isConnected, setIsConnected] = useState(false);
    useEffect(() => {
        const username = fetchLocalStorage("twitch_username");
        if (!username || !token) {
            return;
        }

        if (isConnected) return; // Prevent multiple connections

        console.log("Connecting to Twitch chat...");

        client.current = new tmi.Client({
            channels: [username],
            identity: {
                username: username,
                password: "oauth:" + token, // Correct OAuth format
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
                    console.warn("Refreshing Twitch token...");
                    await refreshTwitchToken();
                }
            });

        if (!isListenerAttached.current) {
            client.current?.on(
                "message",
                async (channel, tags, message, self) => {
                    if (self) return; // Ignore bot's own messages
                    const command = message.trim().toLowerCase().split(" ")[0];
                    if (!command.startsWith("!")) {
                        return;
                    }
                    const args = message.trim().split(" ").slice(1);
                    switch (command) {
                        case "!song":
                            const nowPlayingSong =
                                fetchLocalStorageJSON<LocalStorageNowPlaying | null>(
                                    "spotify_now_playing",
                                    null
                                );
                            if (nowPlayingSong) {
                                if (nowPlayingSong.playing) {
                                    const song = `🎵 Now Playing: ${nowPlayingSong.name} by ${nowPlayingSong.artists.join(", ")} | 🔗 Listen: ${nowPlayingSong.url}`;
                                    client.current?.say(channel, song);
                                } else {
                                    const song = `🎵 Not Playing: ${nowPlayingSong.name} by ${nowPlayingSong.artists.join(", ")} | 🔗 Listen: ${nowPlayingSong.url}`;
                                    client.current?.say(channel, song);
                                }
                            } else {
                                client.current?.say(
                                    channel,
                                    "I couldn't find the current song! 😢"
                                );
                            }
                            break;
                        case "!sr":
                            if (!songRequest) {
                                return;
                            }
                            // 1. Basic input validation: Check if a URL was provided
                            if (!args[0]) {
                                client.current?.say(
                                    channel,
                                    "Please provide a Spotify track URL to request a song. Usage: !sr <Spotify track URL>"
                                );
                                return;
                            }
                            try {
                                const urlString = args[0];
                                let trackId = null;
                                let isTrack = false;
                                const url = new URL(urlString);
                                const pathSegments = url.pathname.split("/");
                                const type =
                                    pathSegments[pathSegments.length - 2]; // 'track' or 'playlist'
                                const id =
                                    pathSegments[pathSegments.length - 1]; // The actual ID
                                if (
                                    type === "track" &&
                                    id &&
                                    id.length === 22
                                ) {
                                    // Basic check for typical Spotify track ID length
                                    isTrack = true;
                                    trackId = id;
                                } else if (type === "playlist") {
                                    client.current?.say(
                                        channel,
                                        "Sorry, you can only request individual songs, not entire playlists. Please provide a track URL."
                                    );
                                    return;
                                } else {
                                    // Handle cases where the URL structure isn't as expected
                                    client.current?.say(
                                        channel,
                                        "That doesn't look like a valid Spotify track URL. Please ensure it's a direct link to a song."
                                    );
                                    return;
                                }
                                if (!isTrack || !trackId) {
                                    client.current?.say(
                                        channel,
                                        "Couldn't identify a valid track from that URL. Please try again with a Spotify song link."
                                    );
                                    return;
                                }
                                const spotifyApiUrl = `https://api.spotify.com/v1/me/player/queue?uri=spotify:track:${trackId}`;
                                const response = await fetch(spotifyApiUrl, {
                                    method: "POST",
                                    headers: {
                                        Authorization: `Bearer ${spotifyToken}`,
                                        "Content-Type": "application/json", // Good practice, though not always strictly needed for POST with no body
                                    },
                                });
                                if (
                                    response.status === 200 ||
                                    response.status === 204
                                ) {
                                    getTrackDetails(
                                        trackId,
                                        spotifyToken || ""
                                    ).then((e) => {
                                        client.current?.say(
                                            channel,
                                            `✅ ${e?.name} by ${e?.artists} added to the queue!`
                                        );
                                    });
                                } else if (response.status === 401) {
                                    const errorData = await response.json(); // Attempt to parse error details
                                    if (
                                        errorData?.error?.message ===
                                        "The access token expired"
                                    ) {
                                        client.current?.say(
                                            channel,
                                            "Oops! My Spotify connection needs to be refreshed. Please wait a moment while I reconnect."
                                        );
                                    } else {
                                        client.current?.say(
                                            channel,
                                            `Access denied by Spotify. Please ensure the bot's Spotify is linked correctly. (${errorData?.error?.message || "Unknown"})`
                                        );
                                    }
                                } else if (response.status === 403) {
                                    // Forbidden - missing scope or no active device
                                    const errorData = await response.json();
                                    if (
                                        errorData?.error?.reason ===
                                        "NO_ACTIVE_DEVICE"
                                    ) {
                                        client.current?.say(
                                            channel,
                                            "❌ No active Spotify playback device found. Please make sure Spotify is open and playing on a device."
                                        );
                                    } else {
                                        client.current?.say(
                                            channel,
                                            `Permissions issue with Spotify. The bot might not have the correct permissions to control playback. (${errorData?.error?.message || "Unknown"})`
                                        );
                                    }
                                } else if (response.status === 400) {
                                    // Bad Request - potentially malformed URI or other issue
                                    const errorData = await response.json();
                                    client.current?.say(
                                        channel,
                                        `❌ Failed to add song: Bad request to Spotify. Is the URL definitely correct? (${errorData?.error?.message || "Unknown"})`
                                    );
                                } else {
                                    // Catch-all for other unexpected HTTP statuses
                                    client.current?.say(
                                        channel,
                                        `Uh oh, something went wrong adding that song. Spotify API responded with status: ${response.status}.`
                                    );
                                    console.error(
                                        `Spotify API Error (Status: ${response.status}):`,
                                        response
                                    );
                                    // Optionally, try to log the response body if it's JSON
                                    try {
                                        const errorData = await response.json();
                                        console.error(
                                            "Error details:",
                                            errorData
                                        );
                                    } catch (jsonError) {
                                        // If it's not JSON, no big deal
                                    }
                                }
                            } catch (error) {
                                // Catch network errors, invalid URL object creation, etc.
                                console.error("Error in !sr command:", error);
                                client.current?.say(
                                    channel,
                                    "An unexpected error occurred while processing your request. Please try again or contact the bot owner."
                                );
                            }
                            break;
                        default:
                            console.log(
                                `Received command: ${command} message: ${args.join(" ")}`
                            );
                            break;
                    }
                }
            );
            isListenerAttached.current = true;
        }
        return () => {};
    }, [isConnected, token]); // Dependency ensures the effect runs only when needed

    const refreshTwitchToken = async () => {
        if (!refreshToken) return;

        const url = "/connect/twitch/refresh";
        const payload = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: refreshToken }),
        };

        try {
            const response = await fetch(url, payload);
            const data = await response.json();

            if (data.access_token) {
                setIsConnected(false); // Force reconnect with the new token
                if (data.refresh_token) {
                    setRefreshToken(data.refresh_token);
                }
                console.log("Twitch token refreshed! Reloading bot...");
                setToken(data.access_token);
            }
        } catch (error) {
            console.error("Error refreshing token:", error);
        }
    };

    return null;
}
async function getTrackDetails(trackId: string, spotifyToken: string) {
    if (!trackId || !spotifyToken) {
        console.error("Missing trackId or spotifyToken for getTrackDetails.");
        return null;
    }
    try {
        const response = await fetch(
            `https://api.spotify.com/v1/tracks/${trackId}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${spotifyToken}`,
                    "Content-Type": "application/json",
                },
            }
        );
        if (response.status === 200) {
            const data = await response.json();
            const trackName = data.name;
            const artists = data.artists
                .map((artist: any) => artist.name)
                .join(", "); // Join multiple artists with a comma
            const albumName = data.album.name;
            // Get the largest available album image (or null if none)
            const albumArtUrl =
                data.album.images.length > 0 ? data.album.images[0].url : null;
            return {
                name: trackName,
                artists: artists,
                album: albumName,
                albumArt: albumArtUrl,
                uri: data.uri, // Keep the URI handy
            };
        } else if (response.status === 401) {
            const errorData = await response.json();
            console.error(
                `Spotify API Error (401 - Unauthorized) for track ${trackId}:`,
                errorData?.error?.message
            );
            // In a real application, you'd trigger a token refresh here
            return null;
        } else if (response.status === 404) {
            const errorData = await response.json();
            console.error(
                `Spotify API Error (404 - Not Found) for track ${trackId}:`,
                errorData?.error?.message
            );
            return null;
        } else {
            console.error(
                `Spotify API Error fetching track ${trackId}: Status ${response.status} - ${response.statusText}`
            );
            try {
                const errorData = await response.json();
                console.error("Error details:", errorData);
            } catch (jsonError) {
                // If response is not JSON, ignore
            }
            return null;
        }
    } catch (error) {
        console.error(
            `Network or unexpected error fetching track ${trackId}:`,
            error
        );
        return null;
    }
}
