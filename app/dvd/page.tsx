"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

const COLORS = [
    "#ff0000",
    "#ff7700",
    "#ffff00",
    "#00ff00",
    "#00ffff",
    "#0000ff",
    "#8b00ff",
    "#ff00ff",
    "#ff0088",
    "#00ff88",
];

export default function DvdPage() {
    const searchParams = useSearchParams();
    const overlayToken = searchParams.get("overlayToken");
    const [customImage, setCustomImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const logoRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number>(0);
    const stateRef = useRef({
        x: 0,
        y: 0,
        dx: 2,
        dy: 2,
        colorIndex: 0,
    });

    useEffect(() => {
        if (!overlayToken) {
            setError("No overlay token provided. Add ?overlayToken=YOUR_TOKEN to the URL.");
            setLoading(false);
            return;
        }

        const fetchConfig = async () => {
            try {
                const res = await fetch(`/api/overlay/${overlayToken}`);
                if (!res.ok) {
                    throw new Error("Invalid overlay token");
                }
                const data = await res.json();
                setCustomImage(data.dvd)
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load config");
            } finally {
                setLoading(false);
            }
        };

        fetchConfig();
    }, [overlayToken]);


    useEffect(() => {
        const container = containerRef.current;
        const logo = logoRef.current;
        if (!container || !logo) return;

        const state = stateRef.current;
        if (state.x === 0 && state.y === 0) {
            state.x = Math.random() * (container.clientWidth - logo.clientWidth);
            state.y = Math.random() * (container.clientHeight - logo.clientHeight);
        }

        const animate = () => {
            const cw = container.clientWidth;
            const ch = container.clientHeight;
            const lw = logo.clientWidth;
            const lh = logo.clientHeight;

            state.x += state.dx;
            state.y += state.dy;

            let bounced = false;

            if (state.x <= 0) {
                state.x = 0;
                state.dx = Math.abs(state.dx);
                bounced = true;
            } else if (state.x + lw >= cw) {
                state.x = cw - lw;
                state.dx = -Math.abs(state.dx);
                bounced = true;
            }

            if (state.y <= 0) {
                state.y = 0;
                state.dy = Math.abs(state.dy);
                bounced = true;
            } else if (state.y + lh >= ch) {
                state.y = ch - lh;
                state.dy = -Math.abs(state.dy);
                bounced = true;
            }

            if (bounced) {
                state.colorIndex = (state.colorIndex + 1) % COLORS.length;
                logo.style.filter = `drop-shadow(0 0 12px ${COLORS[state.colorIndex]})`;
            }

            logo.style.transform = `translate(${state.x}px, ${state.y}px)`;
            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationRef.current);
    }, [customImage]);

    if (loading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-black">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-black">
                <div className="text-center text-white">
                    <div className="text-lg font-semibold">{error}</div>
                    <div className="mt-2 text-sm text-gray-400">
                        Add your overlay token to the URL, e.g.{" "}
                        <code className="rounded bg-white/10 px-1">
                            /dvd?overlayToken=YOUR_TOKEN
                        </code>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="relative h-screen w-screen overflow-hidden bg-black"
            onDragOver={(e) => e.preventDefault()}
        >
            <div ref={containerRef} className="h-full w-full">
                <div
                    ref={logoRef}
                    className="absolute top-0 left-0 will-change-transform"
                    style={{
                        filter: `drop-shadow(0 0 12px ${COLORS[stateRef.current.colorIndex]})`,
                    }}
                >
                    {customImage && (
                        <img
                            src={customImage}
                            alt="Custom DVD logo"
                            className="h-24 w-auto object-contain"
                            draggable={false}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
