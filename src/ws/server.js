import WebSocket, { WebSocketServer } from "ws";

function sendJson(socket, payload) {
    if (socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify(payload));
}

function broadcast(wss, payload) {
    for (const client of wss.clients) {
        if (client.readyState !== WebSocket.OPEN) continue;
        sendJson(client, payload);
    }
}

export function attachWebsocket(server) {
    const wss = new WebSocketServer({
        server,
        path: "/ws",
        maxPayload: 1024 * 1024,
    });

    wss.on("connection", (socket) => {
        sendJson(socket, { message: "Welcome to the WebSocket server!" });
        socket.on("error", console.error);
    });

    function broadcastMatchCreated(match) {
        broadcast(wss, { type: "match_created", match });
    }

    return { broadcastMatchCreated };
}
