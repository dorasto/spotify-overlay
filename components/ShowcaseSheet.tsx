"use client";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { ExpandIcon } from "lucide-react";
import ThemeShowcase from "./showcase";

export default function ShowcaseSheet() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button className="fixed right-0 top-10 bg-transparent text-transparent hover:text-foreground">
                    <ExpandIcon className="h-4 w-4" />
                    <span className="sr-only">Open Showcase</span>
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full overflow-y-auto p-0 sm:w-full sm:max-w-[100vw]">
                <SheetHeader className="sticky top-0 z-40 bg-background p-3">
                    <SheetTitle>Explore</SheetTitle>
                    <SheetDescription>
                        Explore other themes, and then update the URL inside OBS
                        with what you prefer
                    </SheetDescription>
                </SheetHeader>
                <ThemeShowcase dialog />
            </SheetContent>
        </Sheet>
    );
}
