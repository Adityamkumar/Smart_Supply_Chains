import { Redis } from "ioredis";

export const redis = new Redis(process.env.REDIS_URL as string, {
  maxRetriesPerRequest: 3,
});

redis.on("error", (err: any) => {
  console.error("Redis Error:", err);
});
