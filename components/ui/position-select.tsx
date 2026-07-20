"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface PositionSelectProps {
    value: string;
    onValueChange: (value: string) => void;
}

const positions = [
    { value: "top-left", label: "Top Left", row: 0, col: 0 },
    { value: "top-center", label: "Top Center", row: 0, col: 1 },
    { value: "top-right", label: "Top Right", row: 0, col: 2 },
    { value: "middle-left", label: "Middle Left", row: 1, col: 0 },
    { value: "center", label: "Center", row: 1, col: 1 },
    { value: "middle-right", label: "Middle Right", row: 1, col: 2 },
    { value: "bottom-left", label: "Bottom Left", row: 2, col: 0 },
    { value: "bottom-center", label: "Bottom Center", row: 2, col: 1 },
    { value: "bottom-right", label: "Bottom Right", row: 2, col: 2 },
];

export function PositionSelect({ value, onValueChange }: PositionSelectProps) {
    const [isOpen, setIsOpen] = useState(false);

    const selectedPosition = positions.find((pos) => pos.value === value);

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-left text-sm text-white hover:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
                <div className="flex items-center gap-2">
                    <div className="grid h-4 w-4 grid-cols-3 gap-[1px]">
                        {positions.map((pos) => (
                            <div
                                key={pos.value}
                                className={cn(
                                    "rounded-[1px]",
                                    pos.value === value ? "bg-emerald-400" : "bg-white/20"
                                )}
                            />
                        ))}
                    </div>
                    <span>{selectedPosition?.label || "Select position"}</span>
                </div>
                <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-2 w-full rounded-lg border border-white/[0.08] bg-[#1a1d27] shadow-lg p-3">
                    <div className="grid grid-cols-3 gap-2">
                        {positions.map((pos) => (
                            <button
                                key={pos.value}
                                type="button"
                                onClick={() => {
                                    onValueChange(pos.value);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "flex h-16 items-center justify-center rounded-lg border text-xs font-medium transition-colors",
                                    value === pos.value
                                        ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                                        : "border-white/[0.08] bg-white/[0.03] text-gray-400 hover:bg-white/[0.08] hover:text-white"
                                )}
                            >
                                {pos.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
