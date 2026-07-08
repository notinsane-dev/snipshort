import Redis from "ioredis";

/**
 * Redis singleton for the Node.js runtime.
 *
 * Supports SETEX, GET, and DEL out of the box via ioredis.
 *
 * REDIS_URL format:  redis://[:password@]host[:port][/db-number]
 * For TLS (e.g. Upstash):  rediss://...
 *
 * The singleton pattern prevents creating multiple connections in
 * Next.js development (which hot-reloads modules frequently).
 */

declare global {
  // Allow the global to persist across hot reloads in development.
  // eslint-disable-next-line no-var
  var _redis: Redis | undefined;
}

function createRedisClient(): Redis {
  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error("REDIS_URL environment variable is not set.");
  }

  const client = new Redis(url, {
    // Disable automatic reconnect retries on startup so missing config
    // surfaces as a clear error rather than a silent hang.
    maxRetriesPerRequest: 3,
    lazyConnect: false,
  });

  client.on("error", (err) => {
    console.error("[Redis] connection error:", err);
  });

  return client;
}

export const redis: Redis =
  globalThis._redis ?? (globalThis._redis = createRedisClient());
