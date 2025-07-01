/**
 * Better Auth CLI configuration file
 *
 * Docs: https://www.better-auth.com/docs/concepts/cli
 */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth";
import { betterAuthOptions } from "./src/lib/better-auth/options";

// This config is only used for CLI schema generation
const DATABASE_URL = process.env.DATABASE_URL;
const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL;  
const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET;

const sql = neon(DATABASE_URL!);
const db = drizzle(sql);

export const auth: ReturnType<typeof betterAuth> = betterAuth({
  ...betterAuthOptions,
  database: drizzleAdapter(db, { provider: "pg" }),
  baseURL: BETTER_AUTH_URL,
  secret: BETTER_AUTH_SECRET,
});
