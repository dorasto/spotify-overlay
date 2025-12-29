"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { parseAsString, useQueryState } from "nuqs";

export function SettingsSheet() {
    const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);
    const [isTwitchConnected, setIsTwitchConnected] = useState(false);

    const [twitchQueryCode] = useQueryState(
        "twitch",
        parseAsString.withDefault("")
    );

    useEffect(() => {
        const spotifyToken = localStorage.getItem("spotify_access_token");
        setIsSpotifyConnected(!!spotifyToken);

        const twitchToken = localStorage.getItem("twitch_access_token");
        setIsTwitchConnected(!!twitchToken);
    }, []);

    useEffect(() => {
        if (!twitchQueryCode) return;
        if (localStorage.getItem("twitch_access_token")) return;

        const saveTwitchCode = async () => {
            try {
                const response = await fetch("/connect/twitch/code", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ code: twitchQueryCode }),
                });

                if (response.status === 200) {
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
                    localStorage.setItem(
                        "twitch_username",
                        data.user.login
                    );

                    setIsTwitchConnected(true);
                    toast.success("Twitch connected");

                    const url = new URL(window.location.href);
                    url.searchParams.delete("twitch");
                    window.history.replaceState({}, "", url.toString());
                    window.location.reload();
                }
            } catch (error) {
                console.error("Error saving twitch code:", error);
            }
        };

        saveTwitchCode();
    }, [twitchQueryCode]);

    const handleDisconnectSpotify = () => {
        localStorage.removeItem("spotify_access_token");
        localStorage.removeItem("spotify_refresh_token");
        localStorage.removeItem("spotify_token_expires_at");

        setIsSpotifyConnected(false);
        toast.success("Spotify disconnected");
        window.location.reload();
    };

    const handleDisconnectTwitch = () => {
        localStorage.removeItem("twitch_access_token");
        localStorage.removeItem("twitch_refresh_token");
        localStorage.removeItem("twitch_token_expires_at");
        localStorage.removeItem("twitch_username");

        setIsTwitchConnected(false);
        toast.success("Twitch disconnected");
        window.location.reload();
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button className="fixed right-0 top-0 bg-transparent text-transparent hover:text-foreground">
                    <Settings className="h-4 w-4" />
                    <span className="sr-only">Open settings</span>
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full overflow-y-auto p-0 sm:w-full sm:max-w-[500px]">
                <SheetHeader className="sticky top-0 z-40 border-b bg-background p-4">
                    <SheetTitle>Settings</SheetTitle>
                    <SheetDescription>
                        Connect Spotify and Twitch to enable overlays and chat
                        commands
                    </SheetDescription>
                </SheetHeader>

                <div className="p-4">
                    <Tabs defaultValue="spotify" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="spotify">Spotify</TabsTrigger>
                            <TabsTrigger value="twitch">Twitch</TabsTrigger>
                        </TabsList>

                        <TabsContent value="spotify">
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        Spotify Music Integration
                                    </CardTitle>
                                    <CardDescription>
                                        Show your currently playing song on
                                        stream.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
                                        <li>
                                            Go to the website and click{" "}
                                            <strong>Connect Spotify</strong>.
                                        </li>
                                        <li>
                                            Log in to Spotify and approve access.
                                        </li>
                                        <li>
                                            You will be given a special overlay
                                            URL.
                                        </li>
                                        <li>
                                            Copy that URL and paste it into your{" "}
                                            <strong>
                                                OBS Browser Source URL
                                            </strong>
                                            .
                                        </li>
                                        <li>
                                            The overlay will automatically
                                            connect
                                        </li>
                                    </ol>
                                </CardContent>
                                <CardFooter>
                                    {isSpotifyConnected ? (
                                        <Button
                                            variant="destructive"
                                            onClick={handleDisconnectSpotify}
                                        >
                                            Disconnect Spotify
                                        </Button>
                                    ) : (
                                        <Button disabled>
                                            Waiting for Spotify authorization
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        </TabsContent>

                        <TabsContent value="twitch">
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        Twitch Chat Command Integration
                                    </CardTitle>
                                    <CardDescription>
                                        Enable chat commands like !song.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
                                        <li>
                                            Go to the website and click{" "}
                                            <strong>Connect Twitch</strong>.
                                        </li>
                                        <li>
                                            Log in to Twitch and approve access.
                                        </li>
                                        <li>
                                            You will receive an overlay URL.
                                        </li>
                                        <li>
                                            Copy the URL and paste it into your{" "}
                                            <strong>
                                                OBS Browser Source URL
                                            </strong>
                                            .
                                        </li>
                                        <li>
                                            Twitch will connect automatically
                                            and enable chat commands.
                                        </li>
                                    </ol>
                                </CardContent>
                                <CardFooter>
                                    {isTwitchConnected ? (
                                        <Button
                                            variant="destructive"
                                            onClick={handleDisconnectTwitch}
                                        >
                                            Disconnect Twitch
                                        </Button>
                                    ) : (
                                        <Button disabled>
                                            Waiting for Twitch authorization
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </SheetContent>
        </Sheet>
    );
}