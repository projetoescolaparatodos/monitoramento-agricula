import { defineConfig } from "drizzle-kit";

// Make database URL check less strict for Vercel environment
const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
if (process.env.NODE_ENV === "production" && !DATABASE_URL) {
  console.warn("DATABASE_URL not set, database operations may fail");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
