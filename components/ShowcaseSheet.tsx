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
                <Button className="fixed right-0 top-0 bg-transparent text-transparent hover:text-foreground">
                    <ExpandIcon />
                </Button>
            </SheetTrigger>
            <SheetContent className="w-1/3 overflow-y-scroll sm:w-1/3 sm:max-w-[33vw]">
                <SheetHeader>
                    <SheetTitle>Explore</SheetTitle>
                    <SheetDescription>
                        Explore other themes, and then update the URL inside OBS
                        with what you prefer
                    </SheetDescription>
                    <div className="">
                        <ThemeShowcase dialog />
                    </div>
                </SheetHeader>
            </SheetContent>
        </Sheet>
    );
}
