"use client";

import Link from "next/link";

export default function NotFound() {
    return (
        <main className="flex h-screen flex-col items-center justify-center bg-black text-gray-100">
            <div className="text-center">
                <h1 className="text-[5rem] font-bold text-white">404</h1>
                <p className="mt-4 text-lg text-gray-400">
                    Oops, this page does not exist
                </p>

                <div className="mt-8 flex items-center justify-center gap-4">
                    <Link
                        href="/"
                        className="rounded-md bg-white px-4 py-2 text-black transition-all hover:bg-gray-300"
                    >
                        Go Home
                    </Link>
                </div>

                <p className="mt-10 text-xs text-gray-600">
                    Powered by doras.to
                </p>
            </div>
        </main>
    );
}