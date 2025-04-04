import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Stream Music Overlay: Spotify & Twitch Integration",
    description:
        "Enhance your Twitch and OBS streams with Spotify and Twitch integration! Display your currently playing song, enable the !song command, and engage viewers with real-time music updates.",
    authors: [{ name: "Trent", url: "https://doras.to/trent" }],
    creator: "Trent",
    keywords: [
        "stream music overlay",
        "spotify overlay",
        "twitch overlay",
        "obs overlay",
        "spotify twitch integration",
        "twitch spotify integration",
        "music integration",
        "live stream music",
        "!song command",
        "twitch chat command",
    ],
    openGraph: {
        title: "Stream Music Overlay: Spotify & Twitch Integration",
        description:
            "Enhance your Twitch and OBS streams with Spotify and Twitch integration! Display your currently playing song, enable the !song command, and engage viewers with real-time music updates.",
        url: "https://music-overlay.doras.to/",
        siteName: "Music Overlay",
        images: [
            {
                url: "https://music-overlay.doras.to/logo.webp",
                width: 1024,
                height: 1024,
            },
        ],
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Stream Music Overlay: Spotify & Twitch Integration",
        description:
            "Enhance your Twitch and OBS streams with Spotify and Twitch integration! Display your currently playing song, enable the !song command, and engage viewers with real-time music updates.",
        images: ["https://music-overlay.doras.to/logo.webp"],
        creator: "@doras_to",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <NuqsAdapter>{children}</NuqsAdapter>
                <Toaster />
            </body>
        </html>
    );
}
