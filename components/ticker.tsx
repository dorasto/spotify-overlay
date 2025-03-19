import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Ticker({
    text,
    className,
    duration = 10,
    endPadding = 10,
    fadeEdges = true,
}: {
    duration?: number;
    text: string;
    className?: string;
    endPadding?: number;
    fadeEdges?: boolean;
}) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const textRef = useRef<HTMLDivElement | null>(null);
    const [scroll, setScroll] = useState(false);
    const [textWidth, setTextWidth] = useState(0);
    const [containerWidth, setContainerWidth] = useState(0);

    useEffect(() => {
        if (containerRef.current && textRef.current) {
            const textWidth = textRef.current.scrollWidth;
            const containerWidth = containerRef.current.clientWidth;
            setTextWidth(textWidth);
            setContainerWidth(containerWidth);
            setScroll(textWidth > containerWidth);
        }
    }, [text]);

    return (
        <div
            ref={containerRef}
            className={cn(
                "relative w-full overflow-hidden whitespace-nowrap",
                className,
                {
                    "mask-gradient": fadeEdges,
                }
            )}
            style={
                fadeEdges && scroll
                    ? {
                          maskImage:
                              "linear-gradient(to right, rgba(0,0,0,0), rgba(0,0,0,1) 1%, rgba(0,0,0,1) 90%, rgba(0,0,0,0))",
                      }
                    : {}
            }
        >
            <motion.div
                ref={textRef}
                className={cn("flex", className)}
                animate={
                    scroll
                        ? {
                              x: [
                                  0,
                                  0,
                                  -(textWidth - containerWidth + endPadding),
                                  0,
                              ],
                          }
                        : { x: 0 }
                }
                transition={
                    scroll
                        ? {
                              repeat: Infinity,
                              duration: duration,
                              times: [0, 0.1, 1],
                          }
                        : {}
                }
                style={{
                    display: "flex",
                    whiteSpace: "nowrap",
                }}
            >
                <span>{text}</span>
                <span style={{ width: `${endPadding}px` }}></span>
            </motion.div>
        </div>
    );
}
export function VerticalTicker({
    texts,
    className,
    duration = 10,
    endPadding = 10,
    fadeEdges = true,
    number,
}: {
    duration?: number;
    texts: string[]; // Array of text strings
    className?: string;
    endPadding?: number;
    fadeEdges?: boolean;
    number?: boolean;
}) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const textRef = useRef<HTMLDivElement | null>(null);
    const [scroll, setScroll] = useState(true);
    const [textHeight, setTextHeight] = useState(0);
    const [containerHeight, setContainerHeight] = useState(0);

    useEffect(() => {
        if (containerRef.current && textRef.current) {
            const textHeight = textRef.current.scrollHeight;
            const containerHeight = containerRef.current.clientHeight;
            setTextHeight(textHeight);
            setContainerHeight(containerHeight);
            setScroll(textHeight > containerHeight);
        }
    }, [texts]);

    return (
        <div
            ref={containerRef}
            className={cn("relative h-4 w-full overflow-hidden", className, {
                "mask-gradient": fadeEdges,
            })}
            style={
                fadeEdges && scroll
                    ? {
                          maskImage:
                              "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,1) 1%, rgba(0,0,0,1) 90%, rgba(0,0,0,0))",
                      }
                    : {}
            }
        >
            <motion.div
                ref={textRef}
                className={cn("flex flex-col", className)}
                animate={
                    scroll
                        ? {
                              y: [
                                  0,
                                  0,
                                  -(textHeight - containerHeight + endPadding),
                                  0,
                              ],
                          }
                        : { y: 0 }
                }
                transition={
                    scroll
                        ? {
                              repeat: Infinity,
                              duration: duration,
                              times: [0, 0.1, 1],
                          }
                        : {}
                }
                style={{
                    display: "flex",
                    flexDirection: "column", // Stack vertically
                    whiteSpace: "nowrap",
                }}
            >
                {texts.map((text, index) => (
                    <span key={index}>
                        {number && <span>{index + 1}.</span>}
                        {text}
                    </span>
                ))}
                <span style={{ height: `${endPadding}px` }}></span>
            </motion.div>
        </div>
    );
}
