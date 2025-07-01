import { auth } from "@server/lib/better-auth";
import { Hono } from "hono";
import { cors } from "hono/cors";
import type { ApiResponse } from "shared/dist";

export const app = new Hono()

  .use(cors())

  .get("/", (c) => {
    return c.text("Hello Hono!");
  })

  .on(["GET", "POST"], "/api/*", (c) => {
    return auth(c.env as CloudflareBindings).handler(c.req.raw);
  })

  .get("/hello", async (c) => {
    const data: ApiResponse = {
      message: "Hello BHVR!",
      success: true,
    };

    return c.json(data, { status: 200 });
  });

export default app;
