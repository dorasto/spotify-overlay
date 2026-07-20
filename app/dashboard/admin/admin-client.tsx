"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    IconUsers,
    IconBrandSpotify,
    IconBrandTwitch,
    IconArrowLeft,
    IconSearch,
    IconShield,
    IconChartBar,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Music } from "lucide-react";
import { cn } from "@/lib/utils";
import { themes } from "@/components/overlays/theme";

interface AdminUser {
    id: string;
    name: string;
    email: string;
    image: string | null;
    createdAt: string;
    hasSpotify: boolean;
    hasTwitch: boolean;
    overlayStyle: string | null;
    overlayTheme: string | null;
}

interface AdminStats {
    totalUsers: number;
    spotifyConnected: number;
    twitchEnabled: number;
}

interface AdminClientProps {
    user: {
        id: string;
        name: string;
        email: string;
        image?: string | null;
    };
}

export default function AdminClient({ user }: AdminClientProps) {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            const res = await fetch("/api/admin");
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setStats(data.stats);
            setUsers(data.users);
        } catch {
            setStats(null);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(
        (u) =>
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase()) ||
            u.id.includes(search)
    );

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#0f1117]">
                <div className="text-lg text-gray-400">Loading admin dashboard...</div>
            </div>
        );
    }

    const spotifyPct = stats?.totalUsers ? Math.round(((stats.spotifyConnected ?? 0) / stats.totalUsers) * 100) : 0;
    const twitchPct = stats?.totalUsers ? Math.round(((stats.twitchEnabled ?? 0) / stats.totalUsers) * 100) : 0;

    return (
        <div className="min-h-screen bg-[#0f1117]">
            {/* Header */}
            <header className="border-b border-white/[0.06] bg-[#0f1117]/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/5">
                                <IconArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20">
                                <IconShield className="h-4 w-4 text-red-400" />
                            </div>
                            <div>
                                <h1 className="text-sm font-semibold text-white leading-tight">Admin Dashboard</h1>
                                <p className="text-xs text-gray-500">{user.name}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-6 py-8 space-y-8">
                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <Card className="bg-white/[0.03] border-white/[0.06]">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total Users
                            </CardTitle>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                                <IconUsers className="h-4 w-4 text-blue-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white tabular-nums">
                                {stats?.totalUsers ?? 0}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/[0.03] border-white/[0.06]">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Spotify Connected
                            </CardTitle>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                                <IconBrandSpotify className="h-4 w-4 text-emerald-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white tabular-nums">
                                {stats?.spotifyConnected ?? 0}
                            </div>
                            <div className="mt-1 flex items-center gap-2">
                                <div className="h-1.5 flex-1 rounded-full bg-white/[0.06]">
                                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${spotifyPct}%` }} />
                                </div>
                                <span className="text-xs text-gray-500 tabular-nums">{spotifyPct}%</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/[0.03] border-white/[0.06]">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Twitch Enabled
                            </CardTitle>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
                                <IconBrandTwitch className="h-4 w-4 text-purple-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white tabular-nums">
                                {stats?.twitchEnabled ?? 0}
                            </div>
                            <div className="mt-1 flex items-center gap-2">
                                <div className="h-1.5 flex-1 rounded-full bg-white/[0.06]">
                                    <div className="h-full rounded-full bg-purple-500" style={{ width: `${twitchPct}%` }} />
                                </div>
                                <span className="text-xs text-gray-500 tabular-nums">{twitchPct}%</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Users Table */}
                <Card className="bg-white/[0.03] border-white/[0.06]">
                    <CardHeader>
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-white text-base flex items-center gap-2">
                                    <IconChartBar className="h-4 w-4 text-gray-400" />
                                    All Users
                                </CardTitle>
                            </div>
                            <div className="relative w-72">
                                <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
                                <Input
                                    placeholder="Search by name, email, or ID..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="bg-black/30 border-white/[0.08] text-gray-300 text-sm pl-9 rounded-lg placeholder:text-gray-600 focus-visible:ring-white/10"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-white/[0.06] hover:bg-transparent">
                                    <TableHead className="text-gray-500 text-xs font-medium uppercase tracking-wider">User</TableHead>
                                    <TableHead className="text-gray-500 text-xs font-medium uppercase tracking-wider">ID</TableHead>
                                    <TableHead className="text-gray-500 text-xs font-medium uppercase tracking-wider">Spotify</TableHead>
                                    <TableHead className="text-gray-500 text-xs font-medium uppercase tracking-wider">Twitch</TableHead>
                                    <TableHead className="text-gray-500 text-xs font-medium uppercase tracking-wider">Overlay</TableHead>
                                    <TableHead className="text-gray-500 text-xs font-medium uppercase tracking-wider">Theme</TableHead>
                                    <TableHead className="text-gray-500 text-xs font-medium uppercase tracking-wider text-right">Joined</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.length === 0 ? (
                                    <TableRow className="border-white/[0.06]">
                                        <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                                            No users found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredUsers.map((u) => (
                                        <TableRow key={u.id} className="border-white/[0.06] hover:bg-white/[0.02]">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={u.image || undefined} />
                                                        <AvatarFallback className="bg-gradient-to-br from-gray-700 to-gray-800 text-gray-300 text-xs">
                                                            {u.name?.[0] || "U"}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium text-white text-sm">{u.name}</div>
                                                        <div className="text-xs text-gray-500">{u.email}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <code className="rounded bg-black/30 px-2 py-0.5 text-xs text-gray-400 border border-white/[0.04]">
                                                    {u.id.slice(0, 8)}...
                                                </code>
                                            </TableCell>
                                            <TableCell>
                                                {u.hasSpotify ? (
                                                    <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 text-xs font-normal">
                                                        Connected
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="border-white/[0.06] text-gray-500 text-xs font-normal">
                                                        No
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {u.hasTwitch ? (
                                                    <Badge className="bg-purple-500/15 text-purple-400 border-purple-500/20 text-xs font-normal">
                                                        Enabled
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="border-white/[0.06] text-gray-500 text-xs font-normal">
                                                        No
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-gray-400">
                                                    {u.overlayStyle ?? "default"}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {(() => {
                                                    const themeName = (u.overlayTheme ?? "default") as keyof typeof themes;
                                                    const t = themes[themeName] ?? themes["default"];
                                                    return (
                                                        <div className="flex items-center gap-3">
                                                            <div className={cn("w-40 rounded-md border-0 p-2 shadow-md", t.card)}>
                                                                <div className="flex items-center gap-2">
                                                                    <div className={cn("h-8 w-8 flex-shrink-0 rounded", t.avatarFallback)}>
                                                                        <div className="flex h-full w-full items-center justify-center">
                                                                            <Music className="h-4 w-4 text-white/70" />
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex min-w-0 flex-1 flex-col">
                                                                        <div className={cn("text-xs font-bold truncate", t.text)}>Song Name</div>
                                                                        <div className={cn("text-[10px] truncate", t.text)}>Artist</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <span className="text-xs text-gray-500 whitespace-nowrap">{themeName}</span>
                                                        </div>
                                                    );
                                                })()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className="text-sm text-gray-500 tabular-nums">
                                                    {formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
