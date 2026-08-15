"use client";

import { useState } from "react";
import { IconAlertTriangle, IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { authClient } from "@/lib/auth-client";

export function DeleteAccount() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);

        try {
            await authClient.deleteUser({
            });
            window.location.reload()
            setOpen(false);
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Unable to request account deletion",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                >
                    <IconTrash className="mr-2 h-4 w-4" />
                    Delete account
                </Button>
            </DialogTrigger>

            <DialogContent className="border-white/[0.08] bg-[#15171e] text-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <IconAlertTriangle className="h-5 w-5 text-red-400" />
                        Delete account?
                    </DialogTitle>

                    <DialogDescription className="text-gray-400">
                        Are you sure you want to delete your account? This will
                        permanently remove your account and associated data.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2 sm:gap-2">
                    <Button
                        variant="ghost"
                        onClick={() => setOpen(false)}
                        disabled={loading}
                        className="text-gray-400 hover:bg-white/5 hover:text-white"
                    >
                        Cancel
                    </Button>

                    <Button
                        onClick={handleDelete}
                        disabled={loading}
                        className="bg-red-600 text-white hover:bg-red-500"
                    >
                        {loading ? "Processing..." : "Yes, delete my account"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}