"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { EditorCanvas } from "./canvas";

export default function EditorComp() {
    const [position, setPosition] = useState({ x: 100, y: 100 });
    const [size, setSize] = useState({ width: 384, height: 64 });
    const [colors, setColors] = useState({
        background: "#3b82f6", // blue-500
        text: "#ffffff",
        border: "#1d4ed8", // blue-700
    });
    const [song, setSong] = useState({
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
    });

    return (
        <div className="flex h-screen w-full overflow-hidden">
            <EditorCanvas
                position={position}
                setPosition={setPosition}
                size={size}
                colors={colors}
                song={song}
            />
            <Sidebar
                position={position}
                setPosition={setPosition}
                size={size}
                colors={colors}
                setColors={setColors}
                setSize={setSize}
            />
        </div>
    );
}
