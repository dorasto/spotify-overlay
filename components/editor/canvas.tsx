"use client";

import type React from "react";

import { useState, useRef, useEffect, useCallback } from "react";
import SpotifyOverlay from "../overlays";

interface EditorCanvasProps {
    position: { x: number; y: number };
    setPosition: (position: { x: number; y: number }) => void;
    size: { width: number; height: number };
    colors: {
        background: string;
        text: string;
        border: string;
    };
    song: any;
    sidebarWidth?: number; // Optional sidebar width
    baseFontSize?: number; // Base font size for rem calculation
}

export function EditorCanvas({
    position,
    setPosition,
    size,
    colors,
    song,
    sidebarWidth = 300, // Default sidebar width if not provided
    baseFontSize = 16, // Default base font size (16px = 1rem typically)
}: EditorCanvasProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const canvasRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number | null>(null);
    const positionRef = useRef(position);
    const [showSidebar, setShowSidebar] = useState(true); // State to track if sidebar is shown
    const [isCopied, setIsCopied] = useState(false);

    // Function to convert pixels to rem
    const pxToRem = useCallback(
        (px: number) => {
            return (px / baseFontSize).toFixed(2);
        },
        [baseFontSize]
    );
    const pxToPercent = useCallback((px: number, referenceValue: number) => {
        return ((px / referenceValue) * 100).toFixed(2) + "%";
    }, []);

    // Update the ref when position changes
    useEffect(() => {
        positionRef.current = position;
    }, [position]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        setIsDragging(true);
        const targetRect = e.currentTarget.getBoundingClientRect();
        setDragOffset({
            x: e.clientX - targetRect.left,
            y: e.clientY - targetRect.top,
        });
        // Change cursor style on drag start
        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.cursor = "grabbing";
        }
    }, []);

    const updatePosition = useCallback(
        (clientX: number, clientY: number) => {
            if (!canvasRef.current) return;

            const canvasRect = canvasRef.current.getBoundingClientRect();
            const newX = clientX - canvasRect.left - dragOffset.x;
            const newY = clientY - canvasRect.top - dragOffset.y;

            // Constrain to canvas boundaries
            const maxX = canvasRect.width - size.width;
            const maxY = canvasRect.height - size.height;

            const nextPosition = {
                x: Math.max(0, Math.min(newX, maxX)),
                y: Math.max(0, Math.min(newY, maxY)),
            };

            // Only update if position has changed significantly
            if (
                Math.abs(nextPosition.x - positionRef.current.x) > 1 ||
                Math.abs(nextPosition.y - positionRef.current.y) > 1
            ) {
                setPosition(nextPosition);
            }
        },
        [dragOffset, setPosition, size.width, size.height]
    );

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isDragging) return;

            // Cancel any pending animation frame
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
            }

            // Schedule the position update in the next animation frame
            rafRef.current = requestAnimationFrame(() => {
                updatePosition(e.clientX, e.clientY);
            });
        },
        [isDragging, updatePosition]
    );

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        // Reset cursor style
        const element = document.querySelector('[style*="cursor: grabbing"]');
        if (element instanceof HTMLElement) {
            element.style.cursor = "grab";
        }
    }, []);

    // Toggle sidebar visibility
    const toggleSidebar = useCallback(() => {
        setShowSidebar((prev) => !prev);
    }, []);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        }

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
            // Clean up any pending animation frame on unmount
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    // Calculate adjusted position for display
    const displayPosition = {
        x: showSidebar ? position.x : position.x + sidebarWidth,
        y: position.y,
    };

    // Generate the style string in the requested format
    const styleString = `style="left: ${displayPosition.x}px;top: ${displayPosition.y}px;width: ${size.width}px;height: ${size.height}px;will-change: transform;margin: 16px;"`;

    // Copy style string to clipboard
    const copyToClipboard = () => {
        navigator.clipboard.writeText(styleString).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    return (
        <div
            ref={canvasRef}
            className="relative flex-1 overflow-hidden bg-background dark:bg-gray-900"
        >
            <div
                style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    width: `${size.width}px`,
                    height: `${size.height}px`,
                    userSelect: "none",
                    cursor: isDragging ? "grabbing" : "grab",
                    willChange: "transform", // Hint to browser for optimization
                    margin: "16px",
                }}
                onMouseDown={handleMouseDown}
                className="absolute"
            >
                <SpotifyOverlay
                    nowPlaying={song}
                    theme={"default"}
                    background=""
                    style={{
                        width: `${size.width}px`,
                        height: `${size.height}px`,
                        background: colors.background,
                    }}
                />
            </div>

            {/* Style string display */}
            <div className="absolute bottom-4 right-4 z-10 max-w-md rounded-md bg-black/70 px-3 py-2 font-mono text-sm text-white">
                <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs text-gray-400">CSS Style</span>
                    <button
                        onClick={copyToClipboard}
                        className="rounded bg-gray-700 px-2 py-1 text-xs transition-colors hover:bg-gray-600"
                    >
                        {isCopied ? "Copied!" : "Copy"}
                    </button>
                </div>
                <div className="overflow-x-auto rounded bg-gray-800 p-2 text-xs">
                    {styleString}
                </div>
                <div className="mt-2 flex justify-between">
                    <button
                        onClick={toggleSidebar}
                        className="rounded bg-gray-700 px-2 py-1 text-xs transition-colors hover:bg-gray-600"
                    >
                        {showSidebar ? "Hide Sidebar" : "Show Sidebar"}
                    </button>
                </div>
            </div>
        </div>
    );
}
