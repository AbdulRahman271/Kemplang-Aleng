import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import dotenv from "dotenv";
import * as schema from "../db/schema";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  // During build/migrations, we can fallback or raise a descriptive error
  console.warn("Warning: DATABASE_URL environment variable is not defined.");
}

export const pool = new pg.Pool({
  connectionString: connectionString || "postgresql://postgres:postgres@localhost:5432/kemplang_aleng",
});

export const db = drizzle(pool, { schema });
export type Database = typeof db;
