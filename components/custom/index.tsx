"use client";
import ShowcaseSheet from "@/components/ShowcaseSheet";
import SpotifyOverlayMiddle from "@/components/spotify-overlay";
import Zoom from "@/components/zoom";
import { useLocalStorageJSON } from "@/hooks/useLocalStorage";
import { useEffect, useState } from "react";
import { parseAsBoolean, useQueryState } from "nuqs";
import { EditorCanvas } from "../editor/canvas";
import { SettingsSheet } from "../Settings";
interface MyItem {
    position: { x: number; y: number };
    size: { width: number; height: number };
    scale: number;
    zoomLevel: number;
}
export default function CustomOverlayEditor() {
    const [canvasWidthAndHeight, setCanvasWidthAndHeight] = useState({
        width: 1920,
        height: 1080,
    });
    const [edit] = useQueryState("edit", parseAsBoolean.withDefault(false));
    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
        setIsClient(true);
        setCanvasWidthAndHeight({
            width: window.innerWidth,
            height: window.innerHeight,
        });
    }, []);
    const [settings, setSettings] = useLocalStorageJSON<MyItem>(
        "music_overlay_custom_position",
        {
            position: { x: 0, y: 0 },
            size: { width: 384, height: 64 },
            scale: 0.9,
            zoomLevel: 1,
        }
    );

    const style =
        (isClient && {
            top: settings.position.y,
            left: settings.position.x,
            width: settings.size.width,
            height: settings.size.height,
            willChange: "transform",
            transform: `scale(${settings.scale})`,
        }) ||
        {};
    return (
        <div className="w-full">
            <Zoom />
            <SettingsSheet />
            <ShowcaseSheet />
            {isClient && settings && edit ? (
                <EditorCanvas
                    position={settings.position}
                    setPosition={(pos) => {
                        setSettings({
                            ...settings,
                            position: pos,
                        });
                    }}
                    canvasHeight={canvasWidthAndHeight.height}
                    canvasWidth={canvasWidthAndHeight.width}
                    size={settings.size}
                    scale={settings.scale}
                    setScale={(scale) => {
                        setSettings({
                            ...settings,
                            scale: scale,
                        });
                    }}
                    zoomLevel={1}
                />
            ) : (
                <div className="absolute" style={style}>
                    <SpotifyOverlayMiddle />
                </div>
            )}
        </div>
    );
}
