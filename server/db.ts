import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// Préférer Supabase si configuré, sinon fallback sur la DB Replit
const databaseUrl = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("SUPABASE_DATABASE_URL ou DATABASE_URL doit être défini.");
}

export const pool = new Pool({
  connectionString: databaseUrl,
  ssl: process.env.SUPABASE_DATABASE_URL ? { rejectUnauthorized: false } : undefined,
});

export const db = drizzle(pool, { schema });
