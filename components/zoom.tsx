"use client";

import { parseAsString, useQueryState } from "nuqs";

export default function Zoom() {
    const [zoom] = useQueryState<any>(
        "zoom",
        parseAsString.withDefault("100%")
    );
    return (
        <style>
            {`
            :root {
                    zoom: ${zoom};
                }
            `}
        </style>
    );
}
