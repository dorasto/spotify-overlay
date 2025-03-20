"use client";
import type React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import SpotifyOverlayMiddle from "../spotify-overlay";
interface EditorCanvasProps {
    position: { x: number; y: number };
    setPosition: (position: { x: number; y: number }) => void;
    size: { width: number; height: number };
    canvasWidth: number;
    canvasHeight: number;
    zoomLevel: number;
    setScale: (scale: number) => void;
    scale: number;
}

export function EditorCanvas({
    position,
    setPosition,
    size,
    canvasWidth,
    canvasHeight,
    zoomLevel,
    setScale,
    scale,
}: EditorCanvasProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const canvasRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number | null>(null);
    const positionRef = useRef(position);
    const [isScaling, setIsScaling] = useState(false); // New state for scaling
    const [dragOffsetScale, setDragOffsetScale] = useState({ x: 0, y: 0 });

    // State to manage border style
    const [borderStyle, setBorderStyle] = useState("1px solid transparent");

    // Update border style based on size
    useEffect(() => {
        if (size.width > 400 || size.height > 200) {
            setBorderStyle("2px dashed red"); // Example: Thicker dashed red border
        } else {
            setBorderStyle("1px solid transparent"); // Default border
        }
    }, [size]);

    // Update the ref when position changes
    useEffect(() => {
        positionRef.current = position;
    }, [position]);

    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            if (e.ctrlKey) {
                // Ctrl Key is pressed. Starting scaling mode
                setIsScaling(true);
                setIsDragging(false);
                const adjustedClientX = e.clientX / zoomLevel;
                const adjustedClientY = e.clientY / zoomLevel;
                setDragOffsetScale({
                    x: adjustedClientX,
                    y: adjustedClientY,
                });
                // Change cursor style to indicate scaling
                if (e.currentTarget instanceof HTMLElement) {
                    e.currentTarget.style.cursor = "nesw-resize";
                }
            } else {
                // Standard Dragging
                setIsDragging(true);
                setIsScaling(false); // Ensure not in scaling mode
                // Adjust mouse coordinates by zoom level
                const adjustedClientX = e.clientX / zoomLevel;
                const adjustedClientY = e.clientY / zoomLevel;

                // Calculate drag offset relative to the element's internal position
                let baseOffsetX = adjustedClientX - position.x;
                let baseOffsetY = adjustedClientY - position.y;

                // *** Screen-side detection and offset adjustment ***
                if (canvasRef.current) {
                    const canvasRect =
                        canvasRef.current.getBoundingClientRect();
                    const elementCenterX = position.x + size.width / 2; // Approximate center
                    const screenCenterX = canvasRect.width / 2;

                    // Apply offset based on screen side
                    let offsetX = 0;
                    let offsetY = 0;

                    if (elementCenterX < screenCenterX) {
                        // On the left side: Apply a small positive X offset
                        offsetX = 2; // Adjust this value as needed
                    } else {
                        // On the right side: Apply a small negative X offset
                        offsetX = -2; // Adjust this value as needed
                    }

                    setDragOffset({
                        x: baseOffsetX + offsetX,
                        y: baseOffsetY + offsetY,
                    });
                } else {
                    // If canvasRef.current is null, just use the base offset
                    setDragOffset({
                        x: baseOffsetX,
                        y: baseOffsetY,
                    });
                }

                // Change cursor style on drag start
                if (e.currentTarget instanceof HTMLElement) {
                    e.currentTarget.style.cursor = "grabbing";
                }
            }
        },
        [zoomLevel, position.x, position.y, size.width]
    );

    const updatePosition = useCallback(
        (clientX: number, clientY: number) => {
            if (!canvasRef.current) return;

            // Adjust mouse coordinates by zoom level
            const adjustedClientX = clientX / zoomLevel;
            const adjustedClientY = clientY / zoomLevel;

            // Calculate the new position based on the adjusted mouse coordinates
            const newX = adjustedClientX - dragOffset.x;
            const newY = adjustedClientY - dragOffset.y;

            // Canvas size is fixed to canvasWidth and canvasHeight
            const maxX = canvasWidth - size.width;
            const maxY = canvasHeight - size.height;

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
        [
            dragOffset,
            setPosition,
            size.width,
            size.height,
            canvasWidth,
            canvasHeight,
            zoomLevel,
        ]
    );

    const updateScale = useCallback(
        (clientX: number, clientY: number) => {
            if (!isScaling) return;
            const adjustedClientX = clientX / zoomLevel;
            const adjustedClientY = clientY / zoomLevel;

            const deltaX = adjustedClientX - dragOffsetScale.x;
            const deltaY = adjustedClientY - dragOffsetScale.y;

            let newScale = 1 + deltaX / 100 + deltaY / 100;

            newScale = Math.max(0.5, Math.min(newScale, 5));
            setScale(newScale);
        },
        [isScaling, setScale, dragOffsetScale]
    );

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (isDragging) {
                // Call updatePosition is normal dragging
                if (rafRef.current !== null) {
                    cancelAnimationFrame(rafRef.current);
                }

                rafRef.current = requestAnimationFrame(() => {
                    updatePosition(e.clientX, e.clientY);
                });
            } else if (isScaling) {
                updateScale(e.clientX, e.clientY);
            }
        },
        [isDragging, updatePosition, isScaling, updateScale]
    );

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        setIsScaling(false);
        // Reset cursor style
        const element = document.querySelector('[style*="cursor: grabbing"]');
        if (element instanceof HTMLElement) {
            element.style.cursor = "grab";
        }
        // Reset cursor style
        const scalingElement = document.querySelector(
            '[style*="cursor: nesw-resize"]'
        );
        if (scalingElement instanceof HTMLElement) {
            scalingElement.style.cursor = "grab";
        }
    }, []);

    useEffect(() => {
        if (isDragging || isScaling) {
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
    }, [isDragging, isScaling, handleMouseMove, handleMouseUp]);
    return (
        <div
            ref={canvasRef}
            className="relative h-full w-full bg-background"
            style={{
                width: `${canvasWidth}px`,
                height: `${canvasHeight}px`,
            }}
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
                    position: "absolute",
                    transform: `scale(${scale})`,
                    border: borderStyle, // Dynamic border style
                    transformOrigin: "center",
                }}
                onMouseDown={handleMouseDown}
                className="absolute"
            >
                <SpotifyOverlayMiddle />
            </div>
        </div>
    );
}
