"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Check, ChevronDown } from "lucide-react";

interface StyleOption {
    value: string;
    label: string;
}

interface StyleSelectProps {
    value: string;
    onValueChange: (value: string) => void;
}

const styles: StyleOption[] = [
    { value: "default", label: "Default" },
    { value: "minimalBar", label: "Minimal Bar" },
    { value: "animated", label: "Animated" },
    { value: "fade", label: "Fade" },
    { value: "queue", label: "Queue" },
    { value: "dynamic", label: "Dynamic" },
    { value: "media-stack", label: "Media Stack" },
    { value: "ai", label: "AI" },
];

const stylePreviews: Record<string, string> = {
    default: "bg-emerald-500/20 border-emerald-500/40",
    minimalBar: "bg-blue-500/20 border-blue-500/40",
    animated: "bg-purple-500/20 border-purple-500/40",
    fade: "bg-pink-500/20 border-pink-500/40",
    queue: "bg-orange-500/20 border-orange-500/40",
    dynamic: "bg-cyan-500/20 border-cyan-500/40",
    "media-stack": "bg-indigo-500/20 border-indigo-500/40",
    ai: "bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border-violet-500/40",
};

export function StyleSelect({ value, onValueChange }: StyleSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = styles.find((opt) => opt.value === value);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-left text-sm text-white hover:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
                <div className="flex items-center gap-2">
                    <div className={cn("h-3 w-3 rounded border", stylePreviews[value] || "bg-gray-500/20 border-gray-500/40")} />
                    <span>{selectedOption?.label || "Select style"}</span>
                </div>
                <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-2 w-full rounded-lg border border-white/[0.08] bg-[#1a1d27] shadow-lg">
                    <div className="p-1">
                        {styles.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onValueChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-left hover:bg-white/[0.05]",
                                    value === option.value && "bg-white/[0.08]"
                                )}
                            >
                                <div className={cn("h-4 w-4 rounded border", stylePreviews[option.value] || "bg-gray-500/20 border-gray-500/40")} />
                                <span className="flex-1">{option.label}</span>
                                {value === option.value && <Check className="h-4 w-4 text-emerald-400" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
