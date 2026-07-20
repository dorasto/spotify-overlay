import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IconBrandTwitch, IconDashboard, IconMusic, IconMessageCircle, IconPalette } from "@tabler/icons-react";
import TwitchLogin from "@/components/twitch-login";

export default async function Page() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    return (
        <main className="min-h-screen bg-[#0f1117]">
            {/* Hero Section */}
            <div className="relative overflow-hidden border-b border-white/[0.06]">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-purple-500/5" />
                <div className="relative mx-auto max-w-7xl px-6 py-24">
                    <div className="flex flex-col items-center text-center">
                        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/20">
                            <IconMusic className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">
                            Stream Music Overlay
                        </h1>
                        <p className="mb-8 max-w-2xl text-lg text-gray-400">
                            Display your currently playing music on your Twitch stream.
                            Customize themes, positions, and chat commands.
                        </p>

                        <div className="flex items-center gap-4">
                            {session?.user ? (
                                <Link href="/dashboard">
                                    <Button className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg">
                                        <IconDashboard className="mr-2 h-5 w-5" />
                                        Dashboard
                                    </Button>
                                </Link>
                            ) : (
                                <TwitchLogin />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="mx-auto max-w-7xl px-6 py-20">
                <div className="grid gap-8 md:grid-cols-3">
                    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
                            <IconMusic className="h-6 w-6 text-emerald-400" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-white">Now Playing Display</h3>
                        <p className="text-sm text-gray-400">
                            Show your current track with customizable themes and styles
                        </p>
                    </div>

                    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
                            <IconMessageCircle className="h-6 w-6 text-purple-400" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-white">Chat Commands</h3>
                        <p className="text-sm text-gray-400">
                            Let viewers interact with !song, !queue, and !sr commands
                        </p>
                    </div>

                    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                            <IconPalette className="h-6 w-6 text-blue-400" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-white">Customizable</h3>
                        <p className="text-sm text-gray-400">
                            Choose from 60+ themes, multiple styles, and custom positioning
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
