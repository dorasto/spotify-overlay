"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export function useSSE<T = unknown>(url: string) {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<Event | null>(null);
    const [status, setStatus] = useState<"connecting" | "connected" | "closed">("connecting");
    const eventSourceRef = useRef<EventSource | null>(null);

    const close = useCallback(() => {
        eventSourceRef.current?.close();
        eventSourceRef.current = null;
        setStatus("closed");
    }, []);

    useEffect(() => {
        const es = new EventSource(url);
        eventSourceRef.current = es;

        es.onopen = () => setStatus("connected");

        es.onmessage = (event) => {
            try {
                setData(JSON.parse(event.data) as T);
            } catch {
                setData(event.data as unknown as T);
            }
        };

        es.onerror = (e) => {
            setError(e);
            setStatus("connecting");
        };

        return () => {
            es.close();
            eventSourceRef.current = null;
        };
    }, [url]);

    return { data, error, status, close };
}
