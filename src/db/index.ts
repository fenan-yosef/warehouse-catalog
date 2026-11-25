import "server-only";
import { Pool } from "pg";
import { attachDatabasePool } from "@vercel/functions";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import { pgConnectionString } from "./url";

// Pooled Neon URL for app traffic. On Vercel Fluid compute, attachDatabasePool
// lets idle connections close cleanly before the instance suspends.
const pool = new Pool({ connectionString: pgConnectionString(process.env.DATABASE_URL), max: 5 });
attachDatabasePool(pool);

export const db = drizzle({ client: pool, schema });
export { schema };
