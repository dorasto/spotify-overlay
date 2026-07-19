"use client";

import { useUserConfig } from "@/hooks/use-user-config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { IconBrandSpotify, IconBrandTwitch, IconCopy, IconCheck, IconLogout, IconLink, IconEye } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { signOut } from "@/lib/auth-client";
import { themes } from "@/components/overlays/theme";
import { positionClasses } from "@/components/overlays/positions";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface DashboardClientProps {
    user: {
        id: string;
        name: string;
        email: string;
        image?: string | null;
    };
}

const overlayStyles = [
    { value: "default", label: "Default" },
    { value: "minimalBar", label: "Minimal Bar" },
    { value: "animated", label: "Animated" },
    { value: "fade", label: "Fade" },
    { value: "queue", label: "Queue" },
    { value: "dynamic", label: "Dynamic" },
    { value: "media-stack", label: "Media Stack" },
    { value: "ai", label: "AI" },
];

export default function DashboardClient({ user }: DashboardClientProps) {
    const { config, loading, saveConfig } = useUserConfig();
    const searchParams = useSearchParams();
    const [copied, setCopied] = useState(false);
    const [spotifyConnecting, setSpotifyConnecting] = useState(false);
    const [activeTab, setActiveTab] = useState("overlay");

    const [overlayStyle, setOverlayStyle] = useState("default");
    const [overlayTheme, setOverlayTheme] = useState("default");
    const [overlayPosition, setOverlayPosition] = useState("bottom-right");
    const [autoHide, setAutoHide] = useState(false);
    const [showTimestamp, setShowTimestamp] = useState(false);

    const [twitchEnabled, setTwitchEnabled] = useState(false);
    const [twitchAutoAnnounce, setTwitchAutoAnnounce] = useState(false);
    const [twitchEnableSongCommand, setTwitchEnableSongCommand] = useState(true);
    const [twitchEnableQueueCommand, setTwitchEnableQueueCommand] = useState(true);
    const [twitchEnableSrCommand, setTwitchEnableSrCommand] = useState(true);

    useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    useEffect(() => {
        if (config?.overlay) {
            setOverlayStyle(config.overlay.style || "default");
            setOverlayTheme(config.overlay.theme || "default");
            setOverlayPosition(config.overlay.position || "bottom-right");
            setAutoHide(config.overlay.autoHide || false);
            setShowTimestamp(config.overlay.showTimestamp || false);
        }
        if (config?.twitch) {
            setTwitchEnabled(config.twitch.enabled || false);
            setTwitchAutoAnnounce(config.twitch.autoAnnounce || false);
            setTwitchEnableSongCommand(config.twitch.enableSongCommand ?? true);
            setTwitchEnableQueueCommand(config.twitch.enableQueueCommand ?? true);
            setTwitchEnableSrCommand(config.twitch.enableSrCommand ?? true);
        }
    }, [config]);

    const handleSaveOverlaySettings = async () => {
        await saveConfig({
            overlay: {
                style: overlayStyle,
                theme: overlayTheme,
                position: overlayPosition,
                autoHide,
                showTimestamp,
            },
        });
        toast.success("Overlay settings saved");
    };

    const handleSaveTwitchSettings = async () => {
        await saveConfig({
            twitch: {
                enabled: twitchEnabled,
                autoAnnounce: twitchAutoAnnounce,
                enableSongCommand: twitchEnableSongCommand,
                enableQueueCommand: twitchEnableQueueCommand,
                enableSrCommand: twitchEnableSrCommand,
            } as any,
        });
        toast.success("Twitch settings saved");
    };

    const handleConnectSpotify = async () => {
        setSpotifyConnecting(true);
        const { SPOTIFY_CLIENT_ID } = await fetch("/api/env").then(res => res.json());
        const redirectUri = `${window.location.origin}/connect/spotify/callback`;
        const params = new URLSearchParams({
            client_id: SPOTIFY_CLIENT_ID,
            response_type: "code",
            redirect_uri: redirectUri,
            scope: "user-read-currently-playing user-read-playback-state user-modify-playback-state",
        });
        window.location.href = `https://accounts.spotify.com/authorize?${params}`;
    };

    const handleDisconnectSpotify = async () => {
        await saveConfig({
            spotify: {
                accessToken: null,
                refreshToken: null,
                tokenExpiresAt: null,
            },
        });
        toast.success("Spotify disconnected");
    };

    const copyOverlayUrl = async () => {
        if (!config?.overlayToken) {
            toast.error("No overlay token available");
            return;
        }
        const url = `${window.location.origin}/overlay?overlayToken=${config.overlayToken}`;
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            toast.success("Overlay URL copied to clipboard");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Failed to copy");
        }
    };

    const handleSignOut = async () => {
        await signOut();
        window.location.href = "/";
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 text-lg">Loading...</div>
                </div>
            </div>
        );
    }

    const overlayUrl = config?.overlayToken
        ? `${window.location.origin}/overlay?overlayToken=${config.overlayToken}`
        : "";

    const isConnected = config?.spotify?.accessToken;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={user.image || undefined} />
                            <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                        </div>
                    </div>
                    <Button variant="outline" onClick={handleSignOut}>
                        <IconLogout className="mr-2 h-4 w-4" />
                        Sign Out
                    </Button>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4 bg-gray-800">
                        <TabsTrigger value="overlay">Overlay</TabsTrigger>
                        <TabsTrigger value="spotify">Spotify</TabsTrigger>
                        <TabsTrigger value="twitch">Twitch</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overlay" className="space-y-6">
                        <Card className="bg-gray-800 border-gray-700">
                            <CardHeader>
                                <CardTitle className="text-white">Your Overlay URL</CardTitle>
                                <CardDescription className="text-gray-400">
                                    Add this URL as a Browser Source in OBS to display your overlay
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-2">
                                    <Input
                                        value={overlayUrl}
                                        readOnly
                                        className="flex-1 bg-gray-900 border-gray-600 text-white font-mono text-sm"
                                    />
                                    <Button onClick={copyOverlayUrl} variant="outline" size="icon">
                                        {copied ? (
                                            <IconCheck className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <IconCopy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <IconLink className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm text-gray-400">
                                        Overlay Token: <code className="text-gray-300">{config?.overlayToken}</code>
                                    </span>
                                </div>
                                <Link href="/dashboard/preview">
                                    <Button variant="outline" className="w-full">
                                        <IconEye className="mr-2 h-4 w-4" />
                                        Open Live Preview
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className="bg-gray-800 border-gray-700">
                            <CardHeader>
                                <CardTitle className="text-white">Overlay Style</CardTitle>
                                <CardDescription className="text-gray-400">
                                    Choose how your overlay looks
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4">
                                    <div>
                                        <Label className="text-gray-300">Style</Label>
                                        <Select value={overlayStyle} onValueChange={setOverlayStyle}>
                                            <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {overlayStyles.map((style) => (
                                                    <SelectItem key={style.value} value={style.value}>
                                                        {style.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label className="text-gray-300">Theme</Label>
                                        <Select value={overlayTheme} onValueChange={setOverlayTheme}>
                                            <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-[300px]">
                                                {Object.keys(themes).map((themeKey) => (
                                                    <SelectItem key={themeKey} value={themeKey}>
                                                        {themeKey}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label className="text-gray-300">Position</Label>
                                        <Select value={overlayPosition} onValueChange={setOverlayPosition}>
                                            <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.keys(positionClasses).map((pos) => (
                                                    <SelectItem key={pos} value={pos}>
                                                        {pos}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Separator className="bg-gray-700" />

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label className="text-gray-300">Auto Hide</Label>
                                            <p className="text-sm text-gray-400">
                                                Hide overlay when nothing is playing
                                            </p>
                                        </div>
                                        <Switch checked={autoHide} onCheckedChange={setAutoHide} />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label className="text-gray-300">Show Timestamp</Label>
                                            <p className="text-sm text-gray-400">
                                                Display current time in overlay
                                            </p>
                                        </div>
                                        <Switch checked={showTimestamp} onCheckedChange={setShowTimestamp} />
                                    </div>
                                </div>

                                <Button onClick={handleSaveOverlaySettings} className="w-full">
                                    Save Overlay Settings
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="spotify" className="space-y-6">
                        <Card className="bg-gray-800 border-gray-700">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <IconBrandSpotify className="h-6 w-6 text-green-500" />
                                    Spotify Connection
                                </CardTitle>
                                <CardDescription className="text-gray-400">
                                    Connect your Spotify account to display currently playing music
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {isConnected ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Badge className="bg-green-600">Connected</Badge>
                                            <span className="text-sm text-gray-400">
                                                Your Spotify account is connected
                                            </span>
                                        </div>
                                        <Button
                                            variant="destructive"
                                            onClick={handleDisconnectSpotify}
                                            className="w-full"
                                        >
                                            Disconnect Spotify
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="border-gray-600 text-gray-400">
                                                Not Connected
                                            </Badge>
                                            <span className="text-sm text-gray-400">
                                                Connect your Spotify account to get started
                                            </span>
                                        </div>
                                        <Button
                                            onClick={handleConnectSpotify}
                                            className="w-full bg-green-600 hover:bg-green-700"
                                            disabled={spotifyConnecting}
                                        >
                                            <IconBrandSpotify className="mr-2 h-5 w-5" />
                                            Connect Spotify
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="twitch" className="space-y-6">
                        <Card className="bg-gray-800 border-gray-700">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <IconBrandTwitch className="h-6 w-6 text-purple-500" />
                                    Twitch Chat Bot
                                </CardTitle>
                                <CardDescription className="text-gray-400">
                                    Configure your Twitch chat bot settings and commands
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label className="text-gray-300">Enable Chat Bot</Label>
                                            <p className="text-xs text-gray-400">
                                                Connect to your Twitch chat
                                            </p>
                                        </div>
                                        <Switch
                                            checked={twitchEnabled}
                                            onCheckedChange={setTwitchEnabled}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label className="text-gray-300">Auto Announce Songs</Label>
                                            <p className="text-xs text-gray-400">
                                                Automatically announce new songs in chat
                                            </p>
                                        </div>
                                        <Switch
                                            checked={twitchAutoAnnounce}
                                            onCheckedChange={setTwitchAutoAnnounce}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label className="text-gray-300">!song Command</Label>
                                            <p className="text-xs text-gray-400">
                                                Allow viewers to request current song info
                                            </p>
                                        </div>
                                        <Switch
                                            checked={twitchEnableSongCommand}
                                            onCheckedChange={setTwitchEnableSongCommand}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label className="text-gray-300">!queue Command</Label>
                                            <p className="text-xs text-gray-400">
                                                Allow viewers to see the upcoming queue
                                            </p>
                                        </div>
                                        <Switch
                                            checked={twitchEnableQueueCommand}
                                            onCheckedChange={setTwitchEnableQueueCommand}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label className="text-gray-300">!sr Command</Label>
                                            <p className="text-xs text-gray-400">
                                                Allow viewers to request songs (Spotify Premium required)
                                            </p>
                                        </div>
                                        <Switch
                                            checked={twitchEnableSrCommand}
                                            onCheckedChange={setTwitchEnableSrCommand}
                                        />
                                    </div>
                                </div>

                                <Button onClick={handleSaveTwitchSettings} className="w-full">
                                    Save Twitch Settings
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-6">
                        <Card className="bg-gray-800 border-gray-700">
                            <CardHeader>
                                <CardTitle className="text-white">Account Settings</CardTitle>
                                <CardDescription className="text-gray-400">
                                    Manage your account and preferences
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-gray-300">Name</Label>
                                    <Input
                                        value={user.name}
                                        readOnly
                                        className="bg-gray-900 border-gray-600 text-white"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
