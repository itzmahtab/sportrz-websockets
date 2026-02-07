import "./instrument.js";
import express from 'express';
import { matchesRouter } from './routes/matches.js';
import http from 'http';
import dotenv from 'dotenv';
import { attachWebsocket } from './ws/server.js';
import { securityMiddleware } from './arcjet.js';
import { commentaryRouter } from './routes/commentary.js';
import * as Sentry from "@sentry/node";

dotenv.config();

const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || '0.0.0.0';

const app = express();
const server = http.createServer(app);

app.use(express.json());

// Security middleware should run before route handlers
app.use(securityMiddleware);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Express server!' });
});

app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});

app.use('/matches', matchesRouter);
app.use('/matches/:id/commentary', commentaryRouter);

const { broadcastMatchCreated, broadcastCommentary } = attachWebsocket(server);
app.locals.broadcastMatchCreated = broadcastMatchCreated;
app.locals.broadcastCommentary = broadcastCommentary;

Sentry.setupExpressErrorHandler(app);

// START THE HTTP SERVER (NOT EXPRESS)
server.listen(PORT, HOST, () => {
  const baseURL =
    HOST === '0.0.0.0'
      ? `http://localhost:${PORT}`
      : `http://${HOST}:${PORT}`;

  console.log(`Server is running at ${baseURL}`);
  console.log(`WebSocket endpoint available at ws://localhost:${PORT}/ws`);
});
