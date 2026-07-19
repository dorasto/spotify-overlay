import { NextRequest } from "next/server";
import { sseBroadcaster } from "./helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
        return new Response("Missing token parameter", { status: 400 });
    }

    const encoder = new TextEncoder();
    let controller: ReadableStreamDefaultController;

    const stream = new ReadableStream({
        start(ctrl) {
            controller = ctrl;
            sseBroadcaster.subscribe(token, ctrl);
            ctrl.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: "connected", token })}\n\n`)
            );
        },
        cancel() {
            sseBroadcaster.unsubscribe(token, controller);
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            Connection: "keep-alive",
            "Cache-Control": "no-cache, no-transform",
        },
    });
}
