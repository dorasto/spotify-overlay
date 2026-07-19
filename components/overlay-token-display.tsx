"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserConfig } from "@/hooks/use-user-config";
import { toast } from "sonner";
import { IconCopy, IconCheck } from "@tabler/icons-react";

export default function OverlayTokenDisplay() {
    const { config, loading } = useUserConfig();
    const [copied, setCopied] = useState(false);

    if (loading) {
        return <div className="text-sm text-gray-400">Loading...</div>;
    }

    if (!config?.overlayToken) {
        return (
            <div className="text-sm text-gray-400">
                No overlay token found. Sign in to get your overlay URL.
            </div>
        );
    }

    const overlayUrl = `${window.location.origin}/overlay?overlayToken=${config.overlayToken}`;

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(overlayUrl);
            setCopied(true);
            toast.success("Overlay URL copied to clipboard");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Failed to copy");
        }
    };

    return (
        <div className="space-y-3">
            <div>
                <label className="text-sm font-medium text-gray-300">
                    Your Overlay URL
                </label>
                <div className="mt-1 flex gap-2">
                    <Input
                        value={overlayUrl}
                        readOnly
                        className="flex-1 font-mono text-xs"
                    />
                    <Button
                        onClick={copyToClipboard}
                        variant="outline"
                        size="icon"
                    >
                        {copied ? (
                            <IconCheck className="h-4 w-4 text-green-500" />
                        ) : (
                            <IconCopy className="h-4 w-4" />
                        )}
                    </Button>
                </div>
                <p className="mt-2 text-xs text-gray-400">
                    Add this URL as a Browser Source in OBS to display your
                    Spotify overlay.
                </p>
            </div>
        </div>
    );
}
