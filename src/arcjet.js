import arcjet, { shield, detectBot, slidingWindow } from "@arcjet/node";

const arcjetKey = process.env.ARCJET_KEY;
const arcjetMode = process.env.ARCJET_MODE === 'DRY_RUN' ? 'DRY_RUN' : 'LIVE';

// Allow arcjetKey to be falsy so module gracefully degrades in non-instrumented environments
export const httpArcjet = arcjetKey
  ? arcjet({
      key: arcjetKey,
      rules: [
        shield({ mode: arcjetMode }),
        detectBot({ mode: arcjetMode, allow: ['CATEGORY:SEARCH_ENGINE', 'CATEGORY:PREVIEW'] }),
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
        detectBot({ mode: arcjetMode, allow: ['CATEGORY:SEARCH_ENGINE', 'CATEGORY:PREVIEW'] }),
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

    if (result && typeof result.isDenied === 'function' && result.isDenied()) {
      return res.status(429).json({ error: 'Too many requests' });
    }

    return next();
  } catch (error) {
    console.error('Arcjet error:', error);
    return res.status(503).json({ error: 'Internal server error' });
  }
}
