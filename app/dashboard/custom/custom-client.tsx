"use client";

import { useUserConfig } from "@/hooks/use-user-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IconArrowLeft, IconCopy, IconCheck, IconLogout, IconGripVertical, IconZoomIn, IconZoomOut } from "@tabler/icons-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { signOut } from "@/lib/auth-client";
import Link from "next/link";
import SpotifyOverlayMiddle from "@/components/spotify-overlay";
import { StyleSelect } from "@/components/ui/style-select";
import { ThemeSelect } from "@/components/ui/theme-select";
import { PositionSelect } from "@/components/ui/position-select";

interface CustomClientProps {
    user: {
        id: string;
        name: string;
        email: string;
        image?: string | null;
    };
}

const dummyNowPlaying: any = {
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

export default function CustomClient({ user }: CustomClientProps) {
    const { config, loading, saveConfig } = useUserConfig();
    const [copied, setCopied] = useState(false);
    const [overlayStyle, setOverlayStyle] = useState("default");
    const [overlayTheme, setOverlayTheme] = useState("default");
    const [overlayPosition, setOverlayPosition] = useState("bottom-right");
    const [autoHide, setAutoHide] = useState(false);
    const [showTimestamp, setShowTimestamp] = useState(false);

    const [customPos, setCustomPos] = useState({ x: 0, y: 0 });
    const [customScale, setCustomScale] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [isScaling, setIsScaling] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });
    const scaleOffset = useRef({ x: 0, y: 0 });
    const canvasRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number | null>(null);

    const CANVAS_W = 1920;
    const CANVAS_H = 1080;

    const [viewportScale, setViewportScale] = useState(1);

    useEffect(() => {
        const updateScale = () => {
            if (!canvasRef.current) return;
            const parent = canvasRef.current.parentElement;
            if (!parent) return;
            const parentRect = parent.getBoundingClientRect();
            const padding = 32;
            const availW = parentRect.width - padding;
            const availH = parentRect.height - padding;
            const scale = Math.min(availW / CANVAS_W, availH / CANVAS_H, 1);
            setViewportScale(scale);
        };
        updateScale();
        const ro = new ResizeObserver(updateScale);
        if (canvasRef.current?.parentElement) ro.observe(canvasRef.current.parentElement);
        window.addEventListener("resize", updateScale);
        return () => { ro.disconnect(); window.removeEventListener("resize", updateScale); };
    }, []);

    const screenToCanvas = useCallback((clientX: number, clientY: number) => {
        if (!canvasRef.current) return { x: 0, y: 0 };
        const rect = canvasRef.current.getBoundingClientRect();
        return {
            x: (clientX - rect.left) / viewportScale,
            y: (clientY - rect.top) / viewportScale,
        };
    }, [viewportScale]);

    useEffect(() => {
        if (config?.overlay) {
            setOverlayStyle(config.overlay.style || "default");
            setOverlayTheme(config.overlay.theme || "default");
            setOverlayPosition(config.overlay.position || "bottom-right");
            setAutoHide(config.overlay.autoHide || false);
            setShowTimestamp(config.overlay.showTimestamp || false);
        }
        if (config?.customPosition) {
            setCustomPos({
                x: config.customPosition.x ?? 0,
                y: config.customPosition.y ?? 0,
            });
            setCustomScale(config.customPosition.scale ?? 1);
        } else {
            setCustomPos({ x: 0, y: 0 });
            setCustomScale(1);
        }
    }, [config]);

    const handleSave = async () => {
        await saveConfig({
            overlay: {
                style: overlayStyle,
                theme: overlayTheme,
                position: overlayPosition,
                autoHide,
                showTimestamp,
            },
            customPosition: {
                x: Math.round(customPos.x),
                y: Math.round(customPos.y),
                scale: customScale,
            },
        });
        toast.success("Custom settings saved");
    };

    const copyOverlayUrl = async () => {
        if (!config?.overlayToken) {
            toast.error("No overlay token available");
            return;
        }
        const url = `${window.location.origin}/overlay/custom?overlayToken=${config.overlayToken}`;
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

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (e.ctrlKey || e.metaKey) {
            setIsScaling(true);
            setIsDragging(false);
            scaleOffset.current = { x: e.clientX, y: e.clientY };
        } else {
            setIsDragging(true);
            setIsScaling(false);
            const canvasPoint = screenToCanvas(e.clientX, e.clientY);
            dragOffset.current = {
                x: canvasPoint.x - customPos.x,
                y: canvasPoint.y - customPos.y,
            };
        }
    }, [customPos, screenToCanvas]);

    useEffect(() => {
        if (!isDragging && !isScaling) return;

        const handleMouseMove = (e: MouseEvent) => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = requestAnimationFrame(() => {
                if (isDragging) {
                    const canvasPoint = screenToCanvas(e.clientX, e.clientY);
                    setCustomPos({
                        x: Math.round(canvasPoint.x - dragOffset.current.x),
                        y: Math.round(canvasPoint.y - dragOffset.current.y),
                    });
                } else if (isScaling) {
                    const dx = e.clientX - scaleOffset.current.x;
                    const dy = e.clientY - scaleOffset.current.y;
                    const delta = (dx + dy) / 200;
                    setCustomScale((s) => Math.max(0.3, Math.min(3, s + delta)));
                    scaleOffset.current = { x: e.clientX, y: e.clientY };
                }
            });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            setIsScaling(false);
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [isDragging, isScaling, screenToCanvas]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#0f1117]">
                <div className="text-lg text-gray-400">Loading...</div>
            </div>
        );
    }

    const overlayUrl = config?.overlayToken
        ? `${window.location.origin}/overlay/custom?overlayToken=${config.overlayToken}`
        : "";

    const serverConfig = {
        user: { id: user.id, overlayToken: config?.overlayToken || null },
        config: {
            style: overlayStyle,
            theme: overlayTheme,
            position: "bottom-right",
            autoHide,
            showTimestamp,
        },
        spotify: config?.spotify || null,
    };

    return (
        <div className="flex h-screen bg-[#0f1117] overflow-hidden">
            {/* Left Sidebar */}
            <div className="w-[380px] flex-shrink-0 border-r border-white/[0.06] bg-[#12141c] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="border-b border-white/[0.06] px-5 py-4">
                    <div className="flex items-center justify-between mb-3">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/5">
                                <IconArrowLeft className="h-4 w-4 mr-1.5" />
                                Back
                            </Button>
                        </Link>
                        <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                                <AvatarImage src={user.image || undefined} />
                                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white text-xs font-semibold">
                                    {user.name?.[0] || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-gray-400 hover:text-white hover:bg-white/5 h-7 w-7">
                                <IconLogout className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                    <h1 className="text-base font-semibold text-white">Custom Editor</h1>
                    <p className="text-xs text-gray-500 mt-0.5">Drag to move, Ctrl+drag to scale</p>
                </div>

                {/* Settings */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                    {/* URL */}
                    <div className="space-y-2">
                        <Label className="text-gray-400 text-[11px] font-medium uppercase tracking-wider">Overlay URL</Label>
                        <div className="flex gap-2">
                            <Input
                                value={overlayUrl}
                                readOnly
                                className="bg-black/30 border-white/[0.08] text-gray-300 font-mono text-xs rounded-lg"
                            />
                            <Button onClick={copyOverlayUrl} variant="outline" size="icon" className="bg-white/[0.05] border-white/[0.08] hover:bg-white/10 flex-shrink-0">
                                {copied ? (
                                    <IconCheck className="h-3.5 w-3.5 text-emerald-400" />
                                ) : (
                                    <IconCopy className="h-3.5 w-3.5 text-gray-400" />
                                )}
                            </Button>
                        </div>
                    </div>

                    <Separator className="bg-white/[0.06]" />

                    {/* Style */}
                    <div className="space-y-2">
                        <Label className="text-gray-400 text-[11px] font-medium uppercase tracking-wider">Style</Label>
                        <StyleSelect value={overlayStyle} onValueChange={setOverlayStyle} />
                    </div>

                    {/* Theme */}
                    <div className="space-y-2">
                        <Label className="text-gray-400 text-[11px] font-medium uppercase tracking-wider">Theme</Label>
                        <ThemeSelect value={overlayTheme} onValueChange={setOverlayTheme} />
                    </div>
                    <Separator className="bg-white/[0.06]" />
                    {/* Toggles */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-gray-300 text-sm">Auto Hide</Label>
                                <p className="text-xs text-gray-500">Hide when nothing is playing</p>
                            </div>
                            <Switch checked={autoHide} onCheckedChange={setAutoHide} className="data-[state=checked]:bg-emerald-500" />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-gray-300 text-sm">Show Timestamp</Label>
                                <p className="text-xs text-gray-500">Display current time</p>
                            </div>
                            <Switch checked={showTimestamp} onCheckedChange={setShowTimestamp} className="data-[state=checked]:bg-emerald-500" />
                        </div>
                    </div>
                    <Separator className="bg-white/[0.06]" />
                </div>

                {/* Save Buttons */}
                <div className="border-t border-white/[0.06] p-4 space-y-2">
                    <Button onClick={handleSave} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-sm">
                        Save Settings
                    </Button>
                </div>
            </div>

            {/* Preview Canvas */}
            <div className="flex-1 relative bg-[#0a0c10] overflow-hidden flex items-center justify-center">
                {/* Stream background */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-[#0a0c10] to-gray-900 pointer-events-none">
                    <div className="absolute inset-0 opacity-20" style={{
                        backgroundImage: `radial-gradient(circle at 20% 50%, rgba(16,185,129,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(59,130,246,0.1) 0%, transparent 50%)`,
                    }} />
                </div>

                {/* 1920x1080 Canvas scaled to fit */}
                <div
                    ref={canvasRef}
                    className="relative border-2 border-white/10 shadow-2xl"
                    style={{
                        width: CANVAS_W,
                        height: CANVAS_H,
                        transform: `scale(${viewportScale})`,
                        transformOrigin: "center",
                        flexShrink: 0,
                        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
                    }}
                >
                    <div className="absolute top-4 left-4 flex items-center gap-2 z-1 pointer-events-none">
                        <div className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Live</span>
                    </div>
                    <div className="absolute top-4 right-4 flex items-center gap-2 z-1 pointer-events-none">
                        <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center">
                            <div className="h-3 w-3 rounded-full bg-gray-600" />
                        </div>
                        <span className="text-[11px] text-gray-500">1.2k viewers</span>
                    </div>

                    {/* Center "STREAM" text */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                        <div className="text-center opacity-[0.08]">
                            <div className="text-6xl font-black text-white tracking-wider">STREAM</div>
                            <div className="text-lg text-gray-400 mt-2">Game content here</div>
                        </div>
                    </div>

                    {/* Overlay - draggable */}
                    <div
                        className="absolute inset-0"
                        style={{ cursor: isDragging ? "grabbing" : isScaling ? "nesw-resize" : "grab" }}
                        onMouseDown={handleMouseDown}
                    >
                        <div
                            style={{
                                position: "absolute",
                                left: customPos.x,
                                top: customPos.y,
                                transform: `scale(${customScale})`,
                                transformOrigin: "top left",
                            }}
                        >
                            <SpotifyOverlayMiddle
                                serverConfig={serverConfig}
                                mockData={{ nowPlaying: dummyNowPlaying }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
