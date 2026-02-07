import WebSocket from 'ws';
import http from 'http';

const ws = new WebSocket('ws://localhost:8000/ws');
const MATCH_ID = 1;

ws.on('open', () => {
    console.log('Connected to WebSocket server');

    // Subscribe to match
    const subscribeMsg = { type: 'subscribe', matchId: MATCH_ID };
    ws.send(JSON.stringify(subscribeMsg));
    console.log(`Sent subscribe request for match ${MATCH_ID}`);
});

ws.on('message', (data) => {
    const message = JSON.parse(data);
    console.log('Received:', message);

    if (message.type === 'subscribed' && message.matchId === MATCH_ID) {
        console.log('Subscription confirmed!');

        // Trigger a commentary post to verify broadcast
        console.log('Triggering commentary creation...');
        const postData = JSON.stringify({
            minute: 10,
            sequence: 1,
            period: "First Half",
            eventType: "Goal",
            actor: "Player One",
            team: "Home Team",
            message: "Test commentary message"
        });

        const req = http.request({
            hostname: 'localhost',
            port: 8000,
            path: `/matches/${MATCH_ID}/commentary`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': postData.length
            }
        }, (res) => {
            console.log(`Commentary POST status: ${res.statusCode}`);
            res.on('data', (d) => {
                process.stdout.write(d);
            });
        });

        req.on('error', (e) => {
            console.error(`Problem with request: ${e.message}`);
        });

        req.write(postData);
        req.end();
    }

    if (message.type === 'commentary' && message.data.matchId === MATCH_ID) {
        console.log('SUCCESS: Received commentary broadcast!');
        ws.close();
    }
});

ws.on('error', (err) => {
    console.error('WebSocket error:', err);
});

ws.on('close', () => {
    console.log('Disconnected');
});
