"use client";

import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export default function TwitchCodeInput() {
    const [twitchCode, setTwitchCode] = useState("");
    const saveCode = async () => {
        try {
            const response = await fetch("/connect/twitch/code", {
                method: "POST",
                body: JSON.stringify({
                    code: twitchCode,
                }),
            });
            if (response.status == 200) {
                const data = await response.json();
                localStorage.setItem(
                    "twitch_access_token",
                    data.token.access_token
                );
                localStorage.setItem(
                    "twitch_refresh_token",
                    data.token.refresh_token
                );
                localStorage.setItem(
                    "twitch_token_expires_at",
                    data.token.expires_in
                );
                localStorage.setItem("twitch_username", data.user.login);
                window.location.reload();
            } else {
                console.log(response);
            }
        } catch (error) {
            console.error("Error fetching now playing:", error);
        }
    };
    return (
        <div className="flex flex-col items-center gap-2 rounded-lg bg-black/70 p-4">
            <p className="text-white">Enter your Twitch code:</p>
            <Button
                onClick={() => {
                    window.open("/connect/twitch", "_blank");
                }}
            >
                Link
            </Button>
            <Input
                value={twitchCode}
                onChange={(e) => setTwitchCode(e.target.value)}
                placeholder="Paste your code here..."
                className="w-64"
            />
            <Button onClick={saveCode} className="mt-2">
                Save Token
            </Button>
        </div>
    );
}
