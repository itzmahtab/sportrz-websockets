import { z } from 'zod';
import util from 'util';

console.log('Testing Zod Record behavior');

try {
    console.log('Trying z.record(z.string(), z.any())');
    const schema2 = z.record(z.string(), z.any());
    console.log('Success: z.record(z.string(), z.any())');
    console.log('Parsing with schema2:', schema2.safeParse({ a: 1 }));
} catch (e) {
    console.log('Failed: z.record(z.string(), z.any())', e.message);
}

try {
    console.log('Trying z.record(z.any())');
    const schema1 = z.record(z.any());
    console.log('Success: z.record(z.any())');
    console.log('Parsing with schema1:', schema1.safeParse({ a: 1 }));
} catch (e) {
    console.log('Failed: z.record(z.any())', e.message);
}
