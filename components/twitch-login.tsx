"use client";

import { Button } from "@/components/ui/button";
import { IconBrandTwitch } from "@tabler/icons-react";
import { signInWithTwitch } from "@/lib/auth-client";

export default function TwitchLogin() {
    return (
        <Button
            onClick={() => signInWithTwitch()}
            className="flex items-center justify-center gap-2 bg-purple-600 px-6 py-2 text-white hover:bg-purple-700"
        >
            <IconBrandTwitch className="h-5 w-5" />
            Sign in with Twitch
        </Button>
    );
}
