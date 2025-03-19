"use client";
import { useEffect, useRef, useState } from "react";
import tmi from "tmi.js";

export default function TwitchBotChat() {
    const [token, setToken] = useState<string | null>();
    const client = useRef<tmi.Client | null>(null);
    const isListenerAttached = useRef(false);
    const [isConnected, setIsConnected] = useState(false);
    useEffect(() => {
        const _token = localStorage.getItem("twitch_access_token");
        setToken(_token);
    });
    useEffect(() => {
        const username = localStorage.getItem("twitch_username");
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
            client.current?.on("message", (channel, tags, message, self) => {
                if (self) return; // Ignore bot's own messages
                const command = message.trim().toLowerCase().split(" ")[0];
                if (!command.startsWith("!")) {
                    return;
                }
                const args = message.trim().split(" ").slice(1);
                switch (command) {
                    case "!song":
                        const song = localStorage.getItem("spotify_song");
                        if (song) {
                            client.current?.say(channel, song);
                        } else {
                            client.current?.say(
                                channel,
                                "I couldn't find the current song! 😢"
                            );
                        }
                        break;
                    default:
                        console.log(
                            `Received command: ${command} message: ${args.join(" ")}`
                        );
                        break;
                }
            });

            isListenerAttached.current = true;
        }

        return () => {};
    }, [isConnected, token]); // Dependency ensures the effect runs only when needed

    const refreshTwitchToken = async () => {
        const refreshToken = localStorage.getItem("twitch_refresh_token");
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
                localStorage.setItem("twitch_access_token", data.access_token);
                localStorage.setItem(
                    "twitch_refresh_token",
                    data.refresh_token
                );
                console.log("Twitch token refreshed! Reloading bot...");
                setIsConnected(false); // Force reconnect with the new token
                setToken(data.access_token);
            }
        } catch (error) {
            console.error("Error refreshing token:", error);
        }
    };

    return null;
}
