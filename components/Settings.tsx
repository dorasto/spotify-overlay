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
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function SettingsSheet() {
    const [spotifyCode, setSpotifyCode] = useState("");
    const [twitchCode, setTwitchCode] = useState("");
    const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);
    const [isTwitchConnected, setIsTwitchConnected] = useState(false);
    useEffect(() => {
        // Check if Spotify is connected
        const spotifyToken = localStorage.getItem("spotify_access_token");
        setIsSpotifyConnected(!!spotifyToken);

        // Check if Twitch is connected
        const twitchToken = localStorage.getItem("twitch_access_token");
        setIsTwitchConnected(!!twitchToken);
    }, []);
    const handleSaveTwitchCode = async () => {
        try {
            const response = await fetch("/connect/twitch/code", {
                method: "POST",
                body: JSON.stringify({
                    code: twitchCode,
                }),
            });
            if (response.status == 200) {
                const data = await response.json();
                toast.success("Twitch code saved");
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
                toast.error("Error saving twitch code");
                console.log(response);
            }
        } catch (error) {
            console.error("Error fetching twitch info:", error);
        }
    };
    const handleSaveSpotifyCode = async () => {
        try {
            const response = await fetch("/connect/spotify/code", {
                method: "POST",
                body: JSON.stringify({
                    code: spotifyCode,
                }),
            });
            if (response.status == 200) {
                const data = await response.json();
                toast.success("Spotify code saved");
                localStorage.setItem("spotify_access_token", data.access_token);
                localStorage.setItem(
                    "spotify_refresh_token",
                    data.refresh_token
                );
                localStorage.setItem(
                    "spotify_token_expires_at",
                    data.expires_in
                );
                window.location.reload();
            } else {
                toast.error("Error saving spotify code");
                console.log(response);
            }
        } catch (error) {
            console.error("Error fetching now playing:", error);
        }
    };
    const handleDisconnectSpotify = () => {
        // Remove Spotify tokens from localStorage
        localStorage.removeItem("spotify_access_token");
        localStorage.removeItem("spotify_refresh_token");
        localStorage.removeItem("spotify_token_expires_at");

        // Update state
        setIsSpotifyConnected(false);
        toast.success("Spotify disconnected");
        window.location.reload();
    };

    const handleDisconnectTwitch = () => {
        // Remove Twitch tokens from localStorage
        localStorage.removeItem("twitch_access_token");
        localStorage.removeItem("twitch_refresh_token");
        localStorage.removeItem("twitch_token_expires_at");
        localStorage.removeItem("twitch_username");

        // Update state
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
                        Configure your integration codes for Spotify and Twitch
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
                                        Enter your Spotify code to enable music
                                        tracking.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="spotify-code">
                                                Spotify Music Code
                                            </Label>
                                            <Input
                                                id="spotify-code"
                                                placeholder="Enter your Spotify code"
                                                value={spotifyCode}
                                                onChange={(e) =>
                                                    setSpotifyCode(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                This code connects to Spotify to
                                                play and track music in your
                                                stream.
                                            </p>
                                        </div>
                                    </div>
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
                                        <Button onClick={handleSaveSpotifyCode}>
                                            Save Spotify Code
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
                                        Enter your Twitch code to enable the
                                        !song command in chat.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="twitch-code">
                                                Twitch Command Code
                                            </Label>
                                            <Input
                                                id="twitch-code"
                                                placeholder="Enter your Twitch code"
                                                value={twitchCode}
                                                onChange={(e) =>
                                                    setTwitchCode(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                This code enables the !song
                                                command in your Twitch chat,
                                                allowing viewers to check what
                                                song is currently playing.
                                            </p>
                                        </div>
                                    </div>
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
                                        <Button onClick={handleSaveTwitchCode}>
                                            Save Twitch Code
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
