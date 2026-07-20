"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, Search } from "lucide-react";
import { themes } from "@/components/overlays/theme";

interface ThemeSelectProps {
    value: string;
    onValueChange: (value: string) => void;
}

// Extract a representative color from each theme
const themeColors: Record<string, string> = {
    default: "bg-emerald-500",
    pink: "bg-pink-500",
    "neon-pink": "bg-gradient-to-r from-pink-500 to-fuchsia-500",
    "neon-blue": "bg-gradient-to-r from-blue-500 to-cyan-500",
    "neon-purple": "bg-gradient-to-r from-purple-500 to-violet-500",
    "neon-green": "bg-gradient-to-r from-green-500 to-emerald-500",
    "sunset-orange": "bg-gradient-to-r from-orange-400 to-red-600",
    "ocean-blue": "bg-gradient-to-r from-blue-400 to-blue-600",
    "pastel-purple": "bg-gradient-to-r from-purple-200 to-purple-400",
    "dark-matte": "bg-gray-800",
    "lime-light": "bg-gradient-to-r from-lime-300 to-lime-500",
    "cotton-candy": "bg-gradient-to-r from-pink-100 to-teal-200",
    "electric-yellow": "bg-gradient-to-r from-yellow-500 to-yellow-700",
    "dark-mint": "bg-gradient-to-r from-teal-700 to-teal-900",
    "neon-cyberpunk": "bg-black border border-cyan-400",
    "retro-sunset": "bg-gradient-to-r from-pink-500 to-yellow-500",
    "galaxy-dreams": "bg-gradient-to-r from-purple-600 to-indigo-900",
    "forest-vibes": "bg-gradient-to-r from-green-500 to-green-700",
    "midnight-black": "bg-black border border-gray-600",
    "pink-lemonade": "bg-gradient-to-r from-pink-300 to-yellow-400",
    "tropical-oasis": "bg-gradient-to-r from-teal-400 to-yellow-500",
    "electric-blue": "bg-gradient-to-r from-blue-600 to-blue-800",
    "violet-mist": "bg-gradient-to-r from-violet-300 to-violet-500",
    "burnt-amber": "bg-gradient-to-r from-amber-500 to-amber-700",
    "cosmic-void": "bg-gradient-to-r from-indigo-900 to-blue-900",
    "neon-holographic": "bg-gradient-to-r from-cyan-300 to-pink-500",
    "starlight-glow": "bg-gradient-to-br from-white to-blue-500",
    "nebula-radiance": "bg-gradient-to-r from-fuchsia-600 to-indigo-800",
    "quantum-flux": "bg-gradient-to-r from-teal-500 to-blue-700",
    "celestial-canopy": "bg-gradient-to-r from-indigo-900 to-gray-700",
    "pixel-pulse": "bg-gradient-to-r from-pink-500 to-yellow-500",
    "shadow-nexus": "bg-gradient-to-r from-black to-purple-800",
    "sunset-horizon": "bg-gradient-to-r from-orange-600 to-pink-500",
    "crimson-abyss": "bg-gradient-to-r from-red-900 to-black",
    "frozen-glow": "bg-gradient-to-r from-blue-700 to-white",
    "infernal-core": "bg-gradient-to-r from-black to-orange-600",
    "emerald-sanctuary": "bg-gradient-to-r from-teal-800 to-lime-600",
    "neon-stream": "bg-gradient-to-r from-purple-700 to-blue-500",
    "cyber-glitch": "bg-gradient-to-r from-cyan-500 to-pink-500",
    "dark-mode-pro": "bg-gradient-to-r from-black to-gray-700",
    "hyper-flare": "bg-gradient-to-r from-orange-600 to-purple-600",
    "gamer-energy": "bg-gradient-to-r from-green-700 to-yellow-500",
    "night-drive": "bg-gradient-to-r from-blue-900 to-black",
    "minimal-dark": "bg-gray-900",
    "classic-light": "bg-white border border-gray-300",
    woodland: "bg-green-900",
    sandstorm: "bg-yellow-200",
    stealth: "bg-black border border-gray-800",
    "desert-stone": "bg-orange-100",
    "royal-elegance": "bg-purple-900",
    industrial: "bg-gray-700",
    "forest-breeze": "bg-gradient-to-r from-green-600 to-green-800",
    "mountain-dawn": "bg-gradient-to-r from-blue-500 to-blue-600",
    "sunset-sands": "bg-gradient-to-r from-yellow-400 to-red-500",
    "wildflower-meadow": "bg-gradient-to-r from-lime-400 to-lime-600",
    "misty-forest": "bg-gradient-to-r from-gray-500 to-gray-700",
    "canyon-dusk": "bg-gradient-to-r from-red-600 to-yellow-700",
    "carbon-fiber": "bg-gradient-to-br from-gray-900 to-black",
    "arcade-glow": "bg-gradient-to-r from-fuchsia-600 to-indigo-600",
    "deep-space": "bg-gradient-to-br from-black to-indigo-950",
    "toxic-slime": "bg-gradient-to-r from-lime-500 to-emerald-600",
    ultraviolet: "bg-gradient-to-r from-violet-700 to-fuchsia-700",
    "lava-core": "bg-gradient-to-r from-red-700 to-yellow-600",
    "midnight-teal": "bg-gradient-to-r from-teal-900 to-black",
    "glitch-red": "bg-gradient-to-r from-red-600 via-black to-red-600",
    "midnight-synth": "bg-gradient-to-br from-black to-cyan-900",
};

export function ThemeSelect({ value, onValueChange }: ThemeSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");

    const themeEntries = useMemo(
        () => Object.entries(themes).sort(([a], [b]) => a.localeCompare(b)),
        []
    );

    const filteredEntries = useMemo(
        () =>
            themeEntries.filter(([name, theme]) => {
                const q = search.toLowerCase();
                return name.toLowerCase().includes(q) || theme.author.toLowerCase().includes(q);
            }),
        [themeEntries, search]
    );

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-left text-sm text-white hover:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
                <div className="flex items-center gap-2">
                    <div className={cn("h-3 w-3 rounded", themeColors[value] || "bg-gray-500")} />
                    <span>{value || "Select theme"}</span>
                </div>
                <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-2 w-full rounded-lg border border-white/[0.08] bg-[#1a1d27] shadow-lg">
                    <div className="flex items-center gap-2 border-b border-white/[0.08] px-3 py-2">
                        <Search className="h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search themes..."
                            className="w-full bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none"
                            autoFocus
                        />
                    </div>
                    <div className="max-h-[300px] overflow-y-auto p-1">
                        {filteredEntries.map(([themeName, theme]) => (
                            <button
                                key={themeName}
                                type="button"
                                onClick={() => {
                                    onValueChange(themeName);
                                    setIsOpen(false);
                                    setSearch("");
                                }}
                                className={cn(
                                    "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-left hover:bg-white/[0.05]",
                                    value === themeName && "bg-white/[0.08]"
                                )}
                            >
                                <div className={cn("h-4 w-4 rounded", themeColors[themeName] || "bg-gray-500")} />
                                <span className="flex-1">{themeName}</span>
                                <span className="text-xs text-gray-500">{theme.author}</span>
                                {value === themeName && <Check className="h-4 w-4 text-emerald-400" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
