"use client";

import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "../ui/button";

interface SidebarProps {
    position: { x: number; y: number };
    setPosition: (position: { x: number; y: number }) => void;
    colors: {
        background: string;
        text: string;
        border: string;
    };
    setColors: (colors: {
        background: string;
        text: string;
        border: string;
    }) => void;
    size: { width: number; height: number };
    setSize: (size: { width: number; height: number }) => void;
}

export function Sidebar({
    position,
    setPosition,
    colors,
    setColors,
    size,
    setSize,
}: SidebarProps) {
    return (
        <div className="w-80 overflow-y-auto border-l border-border bg-card p-4">
            <h2 className="mb-4 text-xl font-bold">Editor Controls</h2>
            <Button
                onClick={() => {
                    setPosition({ x: 0, y: 0 });
                }}
            >
                Reset
            </Button>
            <Tabs defaultValue="appearance">
                <TabsList className="mb-4 grid w-full grid-cols-2">
                    <TabsTrigger value="appearance">Appearance</TabsTrigger>
                    <TabsTrigger value="dimensions">Dimensions</TabsTrigger>
                </TabsList>

                <TabsContent value="appearance" className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="background-color">
                            Background Color
                        </Label>
                        <div className="flex items-center gap-2">
                            <div
                                className="h-6 w-6 rounded border border-border"
                                style={{ backgroundColor: colors.background }}
                            />
                            <Input
                                id="background-color"
                                type="text"
                                value={colors.background}
                                onChange={(e) =>
                                    setColors({
                                        ...colors,
                                        background: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="text-color">Text Color</Label>
                        <div className="flex items-center gap-2">
                            <div
                                className="h-6 w-6 rounded border border-border"
                                style={{ backgroundColor: colors.text }}
                            />
                            <Input
                                id="text-color"
                                type="text"
                                value={colors.text}
                                onChange={(e) =>
                                    setColors({
                                        ...colors,
                                        text: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="dimensions" className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="width">Width: {size.width}px</Label>
                        <Slider
                            id="width"
                            min={50}
                            max={500}
                            step={1}
                            value={[size.width]}
                            onValueChange={(value) =>
                                setSize({ ...size, width: value[0] })
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="height">Height: {size.height}px</Label>
                        <Slider
                            id="height"
                            min={50}
                            max={500}
                            step={1}
                            value={[size.height]}
                            onValueChange={(value) =>
                                setSize({ ...size, height: value[0] })
                            }
                        />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="x-position">X Position</Label>
                            <Input
                                id="x-position"
                                type="number"
                                value={size.width}
                                onChange={(e) =>
                                    setSize({
                                        ...size,
                                        width:
                                            Number.parseInt(e.target.value) ||
                                            0,
                                    })
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="y-position">Y Position</Label>
                            <Input
                                id="y-position"
                                type="number"
                                value={size.height}
                                onChange={(e) =>
                                    setSize({
                                        ...size,
                                        height:
                                            Number.parseInt(e.target.value) ||
                                            0,
                                    })
                                }
                            />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            <div className="mt-6 text-xs text-muted-foreground">
                <p>Drag the element on the canvas to reposition it.</p>
                <p className="mt-1">
                    Use the controls above to customize its appearance.
                </p>
            </div>
        </div>
    );
}
