import arcjet, { shield, detectBot, slidingWindow } from "@arcjet/node";

const arcjetKey = process.env.ARCJET_KEY;
const arcjetMode = process.env.ARCJET_MODE === 'DRY_RUN' ? 'DRY_RUN' : 'LIVE';

// Allow arcjetKey to be falsy so module gracefully degrades in non-instrumented environments
export const httpArcjet = arcjetKey
  ? arcjet({
    key: arcjetKey,
    rules: [
      shield({ mode: arcjetMode }),
      detectBot({
        mode: arcjetMode,
        allow: [
          'CATEGORY:SEARCH_ENGINE',
          'CATEGORY:PREVIEW',
          'POSTMAN', // Allow Postman for testing
          'CURL', // Allow Curl for testing
        ],
      }),
      slidingWindow({
        mode: arcjetMode,
        interval: '10s',
        max: 50,
      }),
    ],
  })
  : null;

export const wsArcjet = arcjetKey
  ? arcjet({
    key: arcjetKey,
    rules: [
      shield({ mode: arcjetMode }),
      detectBot({
        mode: arcjetMode,
        allow: [
          'CATEGORY:SEARCH_ENGINE',
          'CATEGORY:PREVIEW',
          'POSTMAN',
          'CURL',
        ],
      }),
      slidingWindow({
        mode: arcjetMode,
        interval: '2s',
        max: 5,
      }),
    ],
  })
  : null;

// Single middleware to integrate Arcjet protection for HTTP requests
export async function securityMiddleware(req, res, next) {
  if (!httpArcjet) return next();

  try {
    const result = await httpArcjet.protect(req);

    if (result && result.isDenied()) {
      console.warn('Arcjet block reason:', {
        reason: result.reason,
        ip: result.ip,
      });

      if (result.reason.isRateLimit()) {
        return res.status(429).json({ error: 'Too many requests' });
      } else if (result.reason.isBot()) {
        return res.status(403).json({ error: 'Bot detected' });
      } else {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    return next();
  } catch (error) {
    console.error('Arcjet error details:', {
      message: error.message,
      stack: error.stack,
    });
    return res.status(503).json({
      error: 'Internal server error (Security Layer)',
      details: error.message
    });
  }
}