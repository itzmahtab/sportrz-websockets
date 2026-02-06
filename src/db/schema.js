import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  pgEnum,
  foreignKey,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';

// Enums
export const matchStatusEnum = pgEnum('match_status', [
  'scheduled',
  'live',
  'finished',
]);

// Matches table
export const matches = pgTable(
  'matches',
  {
    id: serial('id').primaryKey(),
    sport: text('sport').notNull(),
    homeTeam: text('home_team').notNull(),
    awayTeam: text('away_team').notNull(),
    status: matchStatusEnum('status').default('scheduled').notNull(),
    startTime: timestamp('start_time').notNull(),
    endTime: timestamp('end_time'),
    homeScore: integer('home_score').default(0).notNull(),
    awayScore: integer('away_score').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    statusIdx: index('matches_status_idx').on(table.status),
    startTimeIdx: index('matches_start_time_idx').on(table.startTime),
  })
);

// Commentary table
export const commentary = pgTable(
  'commentary',
  {
    id: serial('id').primaryKey(),
    matchId: integer('match_id')
      .notNull()
      .references(() => matches.id, { onDelete: 'cascade' }),
    minute: integer('minute').notNull(),
    sequence: integer('sequence').notNull(),
    period: text('period').notNull(),
    eventType: text('event_type').notNull(),
    actor: text('actor').notNull(),
    team: text('team').notNull(),
    message: text('message').notNull(),
    metadata: jsonb('metadata'),
    tags: text('tags').array(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    matchIdIdx: index('commentary_match_id_idx').on(table.matchId),
    createdAtIdx: index('commentary_created_at_idx').on(table.createdAt),
  })
);

// Export types for type-safe queries
export const MatchStatus = matches.$inferSelect;
export const NewMatch = matches.$inferInsert;
export const Commentary = commentary.$inferSelect;
export const NewCommentary = commentary.$inferInsert;
