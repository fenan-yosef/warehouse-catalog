import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
import { pgConnectionString } from "./src/db/url";

config({ path: ".env.local" });

// Migrations use the direct (non-pooled) connection.
const url = pgConnectionString(process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL);
if (!url) throw new Error("DATABASE_URL_UNPOOLED or DATABASE_URL must be set");

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
});
