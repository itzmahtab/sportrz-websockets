import WebSocket, { WebSocketServer } from "ws";
import { wsArcjet } from "../arcjet.js";

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

    wss.on("connection", async (socket,req) => {
        if(wsArcjet){
            try {
                const result =  await wsArcjet.protect(req);
                if(result.isDenied()) {
                    const code = result.isRateLimited() ? 1013 : 1008;
                    const reason = result.isRateLimited() ? 'Too many requests' : 'Forbidden - suspected bot activity';
                    socket.close(code, reason);
                    return;
                }
                
            } catch (error) {
                console.error('Arcjet WebSocket error:',error);
                socket.close(1011, 'Internal server security error');
                return;
            }
        }
        sendJson(socket, { message: "Welcome to the WebSocket server!" });
        socket.on("error", console.error);
    });

    function broadcastMatchCreated(match) {
        broadcast(wss, { type: "match_created", match });
    }

    return { broadcastMatchCreated };
}
