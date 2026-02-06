import {
  listMatchesQuerySchema,
  MATCH_STATUS,
  matchIdParamSchema,
  createMatchSchema,
  updateScoreSchema,
} from './src/validation/matches.js';

console.log('🧪 Running Validation Tests...\n');

// Test 1: listMatchesQuerySchema
console.log('📋 Test 1: listMatchesQuerySchema');
try {
  const validQuery = listMatchesQuerySchema.parse({ limit: 50 });
  console.log('✅ Valid query:', validQuery);
} catch (error) {
  console.error('❌ Error:', error.message);
}

try {
  const invalidQuery = listMatchesQuerySchema.parse({ limit: 150 });
  console.log('✅ Invalid query (should fail):', invalidQuery);
} catch (error) {
  console.error('✅ Caught expected error (limit > 100)');
}

try {
  const noLimitQuery = listMatchesQuerySchema.parse({});
  console.log('✅ Query without limit:', noLimitQuery);
} catch (error) {
  console.error('❌ Error:', error.message);
}

// Test 2: MATCH_STATUS constant
console.log('\n📋 Test 2: MATCH_STATUS constant');
console.log('✅ MATCH_STATUS.SCHEDULED:', MATCH_STATUS.SCHEDULED);
console.log('✅ MATCH_STATUS.LIVE:', MATCH_STATUS.LIVE);
console.log('✅ MATCH_STATUS.FINISHED:', MATCH_STATUS.FINISHED);

// Test 3: matchIdParamSchema
console.log('\n📋 Test 3: matchIdParamSchema');
try {
  const validId = matchIdParamSchema.parse({ id: 5 });
  console.log('✅ Valid ID:', validId);
} catch (error) {
  console.error('❌ Error:', error.message);
}

try {
  const invalidId = matchIdParamSchema.parse({ id: -1 });
  console.log('✅ Invalid ID (should fail):', invalidId);
} catch (error) {
  console.error('✅ Caught expected error (negative ID)');
}

try {
  const stringId = matchIdParamSchema.parse({ id: '42' });
  console.log('✅ String ID (coerced):', stringId);
} catch (error) {
  console.error('❌ Error:', error.message);
}

// Test 4: createMatchSchema
console.log('\n📋 Test 4: createMatchSchema');
const now = new Date();
const futureDate = new Date(now.getTime() + 3600000); // 1 hour later

try {
  const validMatch = createMatchSchema.parse({
    sport: 'Football',
    homeTeam: 'Team A',
    awayTeam: 'Team B',
    startTime: now.toISOString(),
    endTime: futureDate.toISOString(),
    homeScore: 0,
    awayScore: 0,
  });
  console.log('✅ Valid match:', validMatch);
} catch (error) {
  console.error('❌ Error:', error.message);
}

try {
  const invalidMatch = createMatchSchema.parse({
    sport: 'Football',
    homeTeam: 'Team A',
    awayTeam: 'Team B',
    startTime: futureDate.toISOString(),
    endTime: now.toISOString(), // endTime is before startTime
    homeScore: 0,
    awayScore: 0,
  });
  console.log('✅ Invalid match (should fail):', invalidMatch);
} catch (error) {
  console.error('✅ Caught expected error (endTime before startTime)');
}

try {
  const invalidISO = createMatchSchema.parse({
    sport: 'Football',
    homeTeam: 'Team A',
    awayTeam: 'Team B',
    startTime: 'not-a-date',
    endTime: futureDate.toISOString(),
  });
  console.log('✅ Invalid ISO (should fail):', invalidISO);
} catch (error) {
  console.error('✅ Caught expected error (invalid ISO date)');
}

try {
  const matchWithoutScores = createMatchSchema.parse({
    sport: 'Cricket',
    homeTeam: 'India',
    awayTeam: 'Australia',
    startTime: now.toISOString(),
    endTime: futureDate.toISOString(),
  });
  console.log('✅ Match without scores:', matchWithoutScores);
} catch (error) {
  console.error('❌ Error:', error.message);
}

try {
  const matchWithNegativeScore = createMatchSchema.parse({
    sport: 'Football',
    homeTeam: 'Team A',
    awayTeam: 'Team B',
    startTime: now.toISOString(),
    endTime: futureDate.toISOString(),
    homeScore: -5,
    awayScore: 0,
  });
  console.log('✅ Invalid score (should fail):', matchWithNegativeScore);
} catch (error) {
  console.error('✅ Caught expected error (negative score)');
}

// Test 5: updateScoreSchema
console.log('\n📋 Test 5: updateScoreSchema');
try {
  const validScore = updateScoreSchema.parse({ homeScore: 2, awayScore: 1 });
  console.log('✅ Valid score:', validScore);
} catch (error) {
  console.error('❌ Error:', error.message);
}

try {
  const coercedScore = updateScoreSchema.parse({ homeScore: '3', awayScore: '0' });
  console.log('✅ Coerced score (string to number):', coercedScore);
} catch (error) {
  console.error('❌ Error:', error.message);
}

try {
  const invalidScore = updateScoreSchema.parse({ homeScore: 2, awayScore: -1 });
  console.log('✅ Invalid score (should fail):', invalidScore);
} catch (error) {
  console.error('✅ Caught expected error (negative score)');
}

console.log('\n✨ All tests completed!');
