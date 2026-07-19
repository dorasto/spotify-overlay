type Controller = ReadableStreamDefaultController;

const tokenSubscriptions = new Map<string, Set<Controller>>();
const encoder = new TextEncoder();

export const sseBroadcaster = {
    subscribe(token: string, ctrl: Controller) {
        if (!tokenSubscriptions.has(token)) {
            tokenSubscriptions.set(token, new Set());
        }
        tokenSubscriptions.get(token)!.add(ctrl);
    },
    unsubscribe(token: string, ctrl: Controller) {
        const subs = tokenSubscriptions.get(token);
        if (subs) {
            subs.delete(ctrl);
            if (subs.size === 0) {
                tokenSubscriptions.delete(token);
            }
        }
    },
    sendToToken(token: string, data: unknown) {
        const subs = tokenSubscriptions.get(token);
        if (!subs || subs.size === 0) return;
        const message = encoder.encode(`data: ${JSON.stringify(data)}\n\n`);
        for (const ctrl of subs) {
            ctrl.enqueue(message);
        }
    },
    sendToAll(data: unknown) {
        const message = encoder.encode(`data: ${JSON.stringify(data)}\n\n`);
        for (const subs of tokenSubscriptions.values()) {
            for (const ctrl of subs) {
                ctrl.enqueue(message);
            }
        }
    },
};
