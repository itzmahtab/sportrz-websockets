import { z } from 'zod';

// List matches query schema
export const listMatchesQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
});

// Match status constants
export const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  FINISHED: 'finished',
};

// Match ID parameter schema
export const matchIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// Helper function to validate ISO date string
const isoDateString=z.string().refine(
  (val) => !isNaN(Date.parse(val)),
  'Invalid ISO date string'
);

// Create match schema
export const createMatchSchema = z
  .object({
    sport: z.string().min(1, ),
    homeTeam: z.string().min(1, 'Home team is required'),
    awayTeam: z.string().min(1, 'Away team is required'),
    startTime: isoDateString,
    endTime: isoDateString,
    homeScore: z.coerce.number().int().nonnegative().optional(),
    awayScore: z.coerce.number().int().nonnegative().optional(),
  })
  .superRefine(({ startTime, endTime }, ctx) => {
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    if (endDate <= startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endTime'],
        message: 'endTime must be chronologically after startTime',
      });
    }
  });

// Update score schema
export const updateScoreSchema = z.object({
  homeScore: z.coerce.number().int().nonnegative(),
  awayScore: z.coerce.number().int().nonnegative(),
});
