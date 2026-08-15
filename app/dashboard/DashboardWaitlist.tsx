"use client";

import Link from "next/link";
import { IconLogout, IconMusic } from "@tabler/icons-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { signOut } from "@/lib/auth-client";
import { DeleteAccount } from "./deleteAccount";

interface DashboardWaitlistProps {
    user: {
        name: string;
        email: string;
        image?: string | null;
    };
}

export default function DashboardWaitlist({
    user,
}: DashboardWaitlistProps) {
    const handleSignOut = async () => {
        await signOut();
        window.location.href = "/";
    };

    return (
        <div className="min-h-screen bg-[#0f1117]">
            <header className="border-b border-white/[0.06] bg-[#0f1117]/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 ring-2 ring-white/10">
                            <AvatarImage src={user.image || undefined} />
                            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-semibold">
                                {user.name?.[0] || "U"}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-sm font-semibold text-white leading-tight">{user.name}</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-gray-400 hover:text-white hover:bg-white/5">
                            <IconLogout className="mr-1.5 h-4 w-4" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-12">
                <Card className="w-full max-w-md border-white/[0.06] bg-white/[0.03]">
                    <CardContent className="p-8 text-center">
                        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                            <IconMusic className="h-6 w-6 text-emerald-400" />
                        </div>

                        <h1 className="text-2xl font-semibold text-white">
                            We’re currently in beta
                        </h1>

                        <p className="mt-3 text-sm leading-6 text-gray-400">
                            Access is currently limited to a small group of beta users, so we’re not
                            accepting new accounts at the moment.
                        </p>

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                            <Link href="/">
                                <Button
                                    variant="outline"
                                    className="w-full border-white/[0.08] bg-white/[0.03] text-gray-300 hover:bg-white/[0.06] hover:text-white sm:w-auto"
                                >
                                    Return home
                                </Button>
                            </Link>

                            <Button
                                onClick={handleSignOut}
                                className="w-full bg-emerald-600 text-white hover:bg-emerald-500 sm:w-auto"
                            >
                                Sign out
                            </Button>
                            <DeleteAccount />
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}