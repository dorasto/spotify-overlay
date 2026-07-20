"use client";

import { useUserConfig } from "@/hooks/use-user-config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { IconBrandSpotify, IconBrandTwitch, IconCopy, IconCheck, IconLogout, IconLink, IconEye, IconShield, IconSettings, IconPalette, IconPlayerPlay } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { signOut } from "@/lib/auth-client";
import { themes } from "@/components/overlays/theme";
import { positionClasses } from "@/components/overlays/positions";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import SpotifyOverlay from "@/components/overlays";
import AnimatedOverlay from "@/components/overlays/Animated";
import MinimalBarOverlay from "@/components/overlays/MinimalBar";
import SpotifyOverlayFade from "@/components/overlays/Fade";
import SpotifyOverlayDynamic from "@/components/overlays/Dynamic";
import SpotifyOverlayMediaStack from "@/components/overlays/MediaStack";
import SpotifyOverlayAI from "@/components/overlays/Ai";
import { StyleSelect } from "@/components/ui/style-select";
import { ThemeSelect } from "@/components/ui/theme-select";
import { PositionSelect } from "@/components/ui/position-select";

interface DashboardClientProps {
    user: {
        id: string;
        name: string;
        email: string;
        image?: string | null;
    };
    isAdmin?: boolean;
}

const dummySong: any = {
    is_playing: true,
    item: {
        album: {
            images: [{ url: "/favicon.ico" }], // Placeholder image
            name: "Doras.to",
        },
        artists: [{ name: "Doras.to" }],
        name: "Doras",
        duration_ms: "3:50",
        raw_duration_ms: 390000,
    },
    progress_ms: "1:00",
    raw_progress_ms: 120000,
};

function OverlayPreview({ style, theme, showTimestamp }: {
    style: string;
    theme: string;
    showTimestamp: boolean;
}) {
    const themeKey = (theme in themes ? theme : "default") as keyof typeof themes;

    switch (style) {
        case "minimalBar":
            return <MinimalBarOverlay nowPlaying={dummySong} showTimestamp={showTimestamp} theme={themeKey} showCase />;
        case "animated":
            return <AnimatedOverlay nowPlaying={dummySong} showTimestamp={showTimestamp} theme={themeKey} showCase />;
        case "fade":
            return <SpotifyOverlayFade nowPlaying={dummySong} showTimestamp={showTimestamp} theme={themeKey} showCase />;
        case "dynamic":
            return <SpotifyOverlayDynamic nowPlaying={dummySong} showTimestamp={showTimestamp} theme={themeKey} showCase />;
        case "media-stack":
            return <SpotifyOverlayMediaStack nowPlaying={dummySong} showTimestamp={showTimestamp} theme={themeKey} showCase />;
        case "ai":
            return <SpotifyOverlayAI nowPlaying={dummySong} showTimestamp={showTimestamp} theme={themeKey} showCase />;
        default:
            return <SpotifyOverlay nowPlaying={dummySong} showTimestamp={showTimestamp} theme={themeKey} showCase />;
    }
}

export default function DashboardClient({ user, isAdmin = false }: DashboardClientProps) {
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
            <div className="flex min-h-screen items-center justify-center bg-[#0f1117]">
                <div className="text-center">
                    <div className="mb-4 text-lg text-gray-300">Loading...</div>
                </div>
            </div>
        );
    }

    const overlayUrl = config?.overlayToken
        ? `${window.location.origin}/overlay?overlayToken=${config.overlayToken}`
        : "";
    const maskedOverlayUrl = config?.overlayToken
        ? `${window.location.origin}/overlay?overlayToken=ovl_****`
        : "";

    const isConnected = config?.spotify?.accessToken;

    return (
        <div className="min-h-screen bg-[#0f1117]">
            {/* Header */}
            <header className="border-b border-white/[0.06] bg-[#0f1117]/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 ring-2 ring-white/10">
                            <AvatarImage src={user.image || undefined} />
                            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-semibold">
                                {user.name?.[0] || "U"}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-sm font-semibold text-white leading-tight">{user.name}</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isAdmin && (
                            <Link href="/dashboard/admin">
                                <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                                    <IconShield className="mr-1.5 h-4 w-4" />
                                    Admin
                                </Button>
                            </Link>
                        )}
                        <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-gray-400 hover:text-white hover:bg-white/5">
                            <IconLogout className="mr-1.5 h-4 w-4" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-6 py-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                    <TabsList className="h-11 w-full grid grid-cols-4 bg-white/[0.03] border border-white/[0.06] p-1 rounded-xl">
                        <TabsTrigger value="overlay" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400">
                            <IconPalette className="mr-2 h-4 w-4" />
                            Overlay
                        </TabsTrigger>
                        <TabsTrigger value="spotify" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400">
                            <IconBrandSpotify className="mr-2 h-4 w-4" />
                            Spotify
                        </TabsTrigger>
                        <TabsTrigger value="twitch" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400">
                            <IconBrandTwitch className="mr-2 h-4 w-4" />
                            Twitch
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400">
                            <IconSettings className="mr-2 h-4 w-4" />
                            Settings
                        </TabsTrigger>
                    </TabsList>

                    {/* Overlay Tab */}
                    <TabsContent value="overlay" className="space-y-6">
                        {/* URL Card */}
                        <Card className="bg-white/[0.03] border-white/[0.06]">
                            <CardContent className="flex items-center justify-between py-4">
                                <div>
                                    <CardTitle className="text-white text-sm font-medium">Your Overlay URL</CardTitle>
                                    <CardDescription className="text-gray-500 text-xs mt-0.5">
                                        Add this URL as a Browser Source in OBS
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link href="/dashboard/custom">
                                        <Button variant="outline" size="sm" className="bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] text-gray-300 text-xs">
                                            <IconEye className="mr-1.5 h-3.5 w-3.5" />
                                            Custom Editor
                                        </Button>
                                    </Link>
                                    <Button onClick={copyOverlayUrl} size="sm" className="bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/25 text-xs">
                                        {copied ? (
                                            <>
                                                <IconCheck className="mr-1.5 h-3.5 w-3.5" />
                                                Copied
                                            </>
                                        ) : (
                                            <>
                                                <IconCopy className="mr-1.5 h-3.5 w-3.5" />
                                                Copy URL
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Style + Preview */}
                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Controls */}
                            <Card className="bg-white/[0.03] border-white/[0.06]">
                                <CardHeader>
                                    <CardTitle className="text-white text-base flex items-center gap-2">
                                        <IconPalette className="h-4 w-4 text-gray-400" />
                                        Overlay Style
                                    </CardTitle>
                                    <CardDescription className="text-gray-500 text-sm">
                                        Choose how your overlay looks
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    <div className="space-y-4">
                                        <div>
                                            <Label className="text-gray-400 text-xs font-medium uppercase tracking-wider">Style</Label>
                                            <div className="mt-1.5">
                                                <StyleSelect value={overlayStyle} onValueChange={setOverlayStyle} />
                                            </div>
                                        </div>

                                        <div>
                                            <Label className="text-gray-400 text-xs font-medium uppercase tracking-wider">Theme</Label>
                                            <div className="mt-1.5">
                                                <ThemeSelect value={overlayTheme} onValueChange={setOverlayTheme} />
                                            </div>
                                        </div>

                                        <div>
                                            <Label className="text-gray-400 text-xs font-medium uppercase tracking-wider">Position</Label>
                                            <div className="mt-1.5">
                                                <PositionSelect value={overlayPosition} onValueChange={setOverlayPosition} />
                                            </div>
                                        </div>
                                    </div>

                                    <Separator className="bg-white/[0.06]" />

                                    <div className="space-y-4">

                                        {overlayStyle === "animated" && (
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <Label className="text-gray-300 text-sm">Auto Hide</Label>
                                                    <p className="text-xs text-gray-500">Hide overlay when nothing is playing</p>
                                                </div>
                                                <Switch checked={autoHide} onCheckedChange={setAutoHide} className="data-[state=checked]:bg-emerald-500" />
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label className="text-gray-300 text-sm">Show Timestamp</Label>
                                                <p className="text-xs text-gray-500">Display current time in overlay</p>
                                            </div>
                                            <Switch checked={showTimestamp} onCheckedChange={setShowTimestamp} className="data-[state=checked]:bg-emerald-500" />
                                        </div>
                                    </div>

                                    <Button onClick={handleSaveOverlaySettings} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg">
                                        Save Overlay Settings
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Live Preview */}
                            <Card className="bg-white/[0.03] border-white/[0.06] overflow-hidden">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-white text-base flex items-center gap-2">
                                        <IconPlayerPlay className="h-4 w-4 text-emerald-400" />
                                        Live Preview
                                    </CardTitle>
                                    <CardDescription className="text-gray-500 text-sm">
                                        Preview of your current overlay settings
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="relative h-[320px] bg-[#0a0c10] overflow-hidden rounded-b-xl">
                                        {/* Simulated stream background */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-[#0a0c10] to-gray-900">
                                            <div className="absolute inset-0 opacity-20" style={{
                                                backgroundImage: `radial-gradient(circle at 20% 50%, rgba(16,185,129,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(59,130,246,0.1) 0%, transparent 50%)`,
                                            }} />
                                        </div>

                                        {/* Fake stream UI elements */}
                                        <div className="absolute top-3 left-3 flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                                            <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Live</span>
                                        </div>
                                        <div className="absolute top-3 right-3 flex items-center gap-1.5">
                                            <div className="h-5 w-5 rounded-full bg-white/10" />
                                            <span className="text-[10px] text-gray-500">1.2k viewers</span>
                                        </div>

                                        {/* Fake game area */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="text-center opacity-20">
                                                <div className="text-4xl font-bold text-gray-600">STREAM</div>
                                                <div className="text-sm text-gray-700 mt-1">Game content here</div>
                                            </div>
                                        </div>

                                        {/* Overlay preview positioned */}
                                        <div className="absolute inset-0">
                                            <div className={`absolute ${positionClasses[overlayPosition as keyof typeof positionClasses] || positionClasses["bottom-right"]}`}>
                                                <OverlayPreview
                                                    style={overlayStyle}
                                                    theme={overlayTheme}
                                                    showTimestamp={showTimestamp}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Spotify Tab */}
                    <TabsContent value="spotify" className="space-y-6">
                        <Card className="bg-white/[0.03] border-white/[0.06]">
                            <CardHeader>
                                <CardTitle className="text-white text-base flex items-center gap-2">
                                    <IconBrandSpotify className="h-5 w-5 text-emerald-400" />
                                    Spotify Connection
                                </CardTitle>
                                <CardDescription className="text-gray-500 text-sm">
                                    Connect your Spotify account to display currently playing music
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {isConnected ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-500/30">Connected</Badge>
                                            <span className="text-sm text-gray-400">Your Spotify account is connected</span>
                                        </div>
                                        <Button
                                            variant="destructive"
                                            onClick={handleDisconnectSpotify}
                                            className="w-full bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                                        >
                                            Disconnect Spotify
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="border-white/[0.08] text-gray-400">
                                                Not Connected
                                            </Badge>
                                            <span className="text-sm text-gray-500">Connect your Spotify account to get started</span>
                                        </div>
                                        <Button
                                            onClick={handleConnectSpotify}
                                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
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

                    {/* Twitch Tab */}
                    <TabsContent value="twitch" className="space-y-6">
                        <Card className="bg-white/[0.03] border-white/[0.06]">
                            <CardHeader>
                                <CardTitle className="text-white text-base flex items-center gap-2">
                                    <IconBrandTwitch className="h-5 w-5 text-purple-400" />
                                    Twitch Chat Bot
                                </CardTitle>
                                <CardDescription className="text-gray-500 text-sm">
                                    Configure your Twitch chat bot settings and commands
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-5">
                                    {[
                                        { label: "Enable Chat Bot", desc: "Connect to your Twitch chat", value: twitchEnabled, setter: setTwitchEnabled },
                                        { label: "Auto Announce Songs", desc: "Automatically announce new songs in chat", value: twitchAutoAnnounce, setter: setTwitchAutoAnnounce },
                                        { label: "!song Command", desc: "Allow viewers to request current song info", value: twitchEnableSongCommand, setter: setTwitchEnableSongCommand },
                                        { label: "!queue Command", desc: "Allow viewers to see the upcoming queue", value: twitchEnableQueueCommand, setter: setTwitchEnableQueueCommand },
                                        { label: "!sr Command", desc: "Allow viewers to request songs (Spotify Premium required)", value: twitchEnableSrCommand, setter: setTwitchEnableSrCommand },
                                    ].map(({ label, desc, value, setter }) => (
                                        <div key={label} className="flex items-center justify-between">
                                            <div>
                                                <Label className="text-gray-300 text-sm">{label}</Label>
                                                <p className="text-xs text-gray-500">{desc}</p>
                                            </div>
                                            <Switch checked={value} onCheckedChange={setter} className="data-[state=checked]:bg-purple-500" />
                                        </div>
                                    ))}
                                </div>

                                <Button onClick={handleSaveTwitchSettings} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium">
                                    Save Twitch Settings
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Settings Tab */}
                    <TabsContent value="settings" className="space-y-6">
                        <Card className="bg-white/[0.03] border-white/[0.06]">
                            <CardHeader>
                                <CardTitle className="text-white text-base">Account Settings</CardTitle>
                                <CardDescription className="text-gray-500 text-sm">
                                    Manage your account and preferences
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-gray-400 text-xs font-medium uppercase tracking-wider">Name</Label>
                                    <Input
                                        value={user.name}
                                        readOnly
                                        className="mt-1.5 bg-black/30 border-white/[0.08] text-gray-300"
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
