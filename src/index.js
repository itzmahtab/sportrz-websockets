import express from 'express';
import { eq } from 'drizzle-orm';
import { db, pool } from './db/db.js';
import { demoUsers } from './db/schema.js';

const app = express();
const PORT = 8000;

// JSON middleware
app.use(express.json());

// Root GET route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Express server!' });
});

// CRUD operations endpoint
app.post('/crud-demo', async (req, res) => {
  try {
    console.log('Performing CRUD operations...');

    // CREATE: Insert a new user
    const [newUser] = await db
      .insert(demoUsers)
      .values({ name: 'Admin User', email: 'admin@example.com' })
      .returning();

    if (!newUser) {
      throw new Error('Failed to create user');
    }
    
    console.log('✅ CREATE: New user created:', newUser);

    // READ: Select the user
    const foundUser = await db.select().from(demoUsers).where(eq(demoUsers.id, newUser.id));
    console.log('✅ READ: Found user:', foundUser[0]);

    // UPDATE: Change the user's name
    const [updatedUser] = await db
      .update(demoUsers)
      .set({ name: 'Super Admin' })
      .where(eq(demoUsers.id, newUser.id))
      .returning();
    
    if (!updatedUser) {
      throw new Error('Failed to update user');
    }
    
    console.log('✅ UPDATE: User updated:', updatedUser);

    // DELETE: Remove the user
    await db.delete(demoUsers).where(eq(demoUsers.id, newUser.id));
    console.log('✅ DELETE: User deleted.');

    res.json({
      message: 'CRUD operations completed successfully',
      operations: {
        created: newUser,
        updated: updatedUser,
      }
    });
  } catch (error) {
    console.error('❌ Error performing CRUD operations:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
