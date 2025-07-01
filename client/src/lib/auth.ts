import { createAuthClient } from "better-auth/client";

/**
 * Better Auth Client Instance
 * 
 * Configured to work with the Better Auth server running on Cloudflare Workers.
 * Uses the VITE_SERVER_URL environment variable or falls back to local development URL.
 */
export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_SERVER_URL || "http://localhost:8787",
  basePath: "/api",
});

/**
 * Type definitions for Better Auth client
 */
export type AuthClient = typeof authClient;