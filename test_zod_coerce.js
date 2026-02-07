import { z } from 'zod';

console.log('Testing Zod features');
console.log('z.coerce exists?', !!z.coerce);

try {
    console.log('Trying z.coerce.number()');
    const s = z.coerce.number();
    console.log('Success: z.coerce.number()');
} catch (e) {
    console.log('Failed: z.coerce.number()', e.message);
}
