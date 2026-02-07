import { z } from 'zod';
import { createCommentarySchema } from './src/validation/commentary.js';

try {
    console.log('createCommentarySchema:', createCommentarySchema);
    const schema = createCommentarySchema;
    console.log('Schema defined successfully');

    const validData = {
        minute: 1,
        sequence: 1,
        period: '1H',
        eventType: 'Goal',
        actor: 'User',
        team: 'TeamA',
        message: 'Test',
        metadata: { key: 'value' },
        tags: ['tag1']
    };

    const result = schema.safeParse(validData);
    if (result.success) {
        console.log('Validation passed');
    } else {
        console.error('Validation failed:', JSON.stringify(result.error, null, 2));
    }
} catch (error) {
    console.error('CRASHED:', error);
    // console.error('Stack:', error.stack);
}
