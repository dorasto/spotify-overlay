"use client";

import { Button } from "@/components/ui/button";
import { IconBrandTwitch } from "@tabler/icons-react";
import { signInWithTwitch } from "@/lib/auth-client";

export default function TwitchLogin() {
    return (
        <Button onClick={signInWithTwitch} className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-lg">
            <IconBrandTwitch className="mr-2 h-5 w-5" />
            Sign in with Twitch
        </Button>
    );
}
