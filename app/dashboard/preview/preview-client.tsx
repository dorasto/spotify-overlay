"use client";

import { useUserConfig } from "@/hooks/use-user-config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { IconArrowLeft, IconCopy, IconCheck, IconLogout } from "@tabler/icons-react";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { signOut } from "@/lib/auth-client";
import { themes } from "@/components/overlays/theme";
import { positionClasses } from "@/components/overlays/positions";
import Link from "next/link";

interface PreviewClientProps {
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

export default function PreviewClient({ user }: PreviewClientProps) {
    const { config, loading, saveConfig } = useUserConfig();
    const [copied, setCopied] = useState(false);
    const [saving, setSaving] = useState(false);

    const [overlayStyle, setOverlayStyle] = useState("default");
    const [overlayTheme, setOverlayTheme] = useState("default");
    const [overlayPosition, setOverlayPosition] = useState("bottom-right");
    const [autoHide, setAutoHide] = useState(false);
    const [showTimestamp, setShowTimestamp] = useState(false);

    useEffect(() => {
        if (config?.overlay) {
            setOverlayStyle(config.overlay.style || "default");
            setOverlayTheme(config.overlay.theme || "default");
            setOverlayPosition(config.overlay.position || "bottom-right");
            setAutoHide(config.overlay.autoHide || false);
            setShowTimestamp(config.overlay.showTimestamp || false);
        }
    }, [config]);

    const broadcastSettings = useCallback(async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/config/broadcast", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    overlay: {
                        style: overlayStyle,
                        theme: overlayTheme,
                        position: overlayPosition,
                        autoHide,
                        showTimestamp,
                    },
                }),
            });
            if (res.ok) {
                toast.success("Settings saved & broadcasted");
            } else {
                toast.error("Failed to save settings");
            }
        } catch (error) {
            console.error("Error broadcasting settings:", error);
            toast.error("Failed to save settings");
        } finally {
            setSaving(false);
        }
    }, [overlayStyle, overlayTheme, overlayPosition, autoHide, showTimestamp]);

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

    return (
        <div className="flex h-screen bg-gray-900">
            {/* Left Panel - Settings */}
            <div className="w-[400px] border-r border-gray-700 bg-gray-800 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="border-b border-gray-700 p-4">
                    <div className="flex items-center justify-between mb-4">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="sm">
                                <IconArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user.image || undefined} />
                                <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                            </Avatar>
                            <Button variant="ghost" size="icon" onClick={handleSignOut}>
                                <IconLogout className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <h1 className="text-lg font-semibold text-white">Overlay Preview</h1>
                    <p className="text-sm text-gray-400">Customize and preview in real-time</p>
                </div>

                {/* Settings Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Overlay URL */}
                    <div className="space-y-2">
                        <Label className="text-gray-300">Overlay URL</Label>
                        <div className="flex gap-2">
                            <Input
                                value={overlayUrl}
                                readOnly
                                className="bg-gray-900 border-gray-600 text-white font-mono text-xs"
                            />
                            <Button onClick={copyOverlayUrl} variant="outline" size="icon">
                                {copied ? (
                                    <IconCheck className="h-4 w-4 text-green-500" />
                                ) : (
                                    <IconCopy className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>

                    <Separator className="bg-gray-700" />

                    {/* Style */}
                    <div className="space-y-2">
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

                    {/* Theme */}
                    <div className="space-y-2">
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

                    {/* Position */}
                    <div className="space-y-2">
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

                    <Separator className="bg-gray-700" />

                    {/* Auto Hide */}
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-gray-300">Auto Hide</Label>
                            <p className="text-xs text-gray-400">Hide when nothing is playing</p>
                        </div>
                        <Switch checked={autoHide} onCheckedChange={setAutoHide} />
                    </div>

                    {/* Show Timestamp */}
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-gray-300">Show Timestamp</Label>
                            <p className="text-xs text-gray-400">Display current time</p>
                        </div>
                        <Switch checked={showTimestamp} onCheckedChange={setShowTimestamp} />
                    </div>
                </div>

                {/* Save Button */}
                <div className="border-t border-gray-700 p-4">
                    <Button
                        onClick={broadcastSettings}
                        className="w-full"
                        disabled={saving}
                    >
                        {saving ? "Saving..." : "Save & Update Preview"}
                    </Button>
                </div>
            </div>

            {/* Right Panel - Preview */}
            <div className="flex-1 bg-gray-950 relative">
                {config?.overlayToken ? (
                    <iframe
                        src={`${overlayUrl}&preview=true`}
                        className="w-full h-full border-0"
                        title="Overlay Preview"
                        sandbox="allow-scripts allow-same-origin"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        <div className="text-center">
                            <p className="text-lg">No overlay token found</p>
                            <p className="text-sm">Sign in to get your overlay URL</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
