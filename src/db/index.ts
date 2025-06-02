import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

let db: any;

// Use real database
try {
  const sql = neon<boolean, boolean>(process.env.DATABASE_URL!);
  db = drizzle(sql, { schema });
  console.log('Connected to real database');
} catch (error) {
  console.error('Failed to connect to database:', error);
  throw error;
}

export { db };
