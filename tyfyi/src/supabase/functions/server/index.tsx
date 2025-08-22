import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-933591b2/health", (c) => {
  return c.json({ status: "ok" });
});

// Demo endpoint that returns static data for now
app.post("/make-server-933591b2/init-demo-data", (c) => {
  return c.json({ message: "Demo data initialized successfully (mock)" });
});

app.post("/make-server-933591b2/auth/login", (c) => {
  return c.json({ error: "Server authentication not available in demo mode" }, 503);
});

app.post("/make-server-933591b2/auth/register", (c) => {
  return c.json({ error: "Server registration not available in demo mode" }, 503);
});

app.get("/make-server-933591b2/subscribers/:companyId", (c) => {
  return c.json({ subscribers: [] });
});

app.get("/make-server-933591b2/talent-pools/:companyId", (c) => {
  return c.json({ talentPools: [] });
});

Deno.serve(app.fetch);