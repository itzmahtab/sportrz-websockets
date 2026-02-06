import express from 'express';
import { matchesRouter } from './routes/matches.js';
import http from 'http';
import dotenv from 'dotenv';
import { attachWebsocket } from './ws/server.js';
import { securtiyMiddleware } from './arcjet.js';

dotenv.config();

const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || '0.0.0.0';

const app = express();
const server = http.createServer(app);

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Express server!' });
});
app.use(securtiyMiddleware);

app.use('/matches', matchesRouter);

const { broadcastMatchCreated } = attachWebsocket(server);
app.locals.broadcastMatchCreated = broadcastMatchCreated;

// START THE HTTP SERVER (NOT EXPRESS)
server.listen(PORT, HOST, () => {
  const baseURL =
    HOST === '0.0.0.0'
      ? `http://localhost:${PORT}`
      : `http://${HOST}:${PORT}`;

  console.log(`Server is running at ${baseURL}`);
  console.log(`WebSocket endpoint available at ws://localhost:${PORT}/ws`);
});
