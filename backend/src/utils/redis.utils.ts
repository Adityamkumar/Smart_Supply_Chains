import { redis } from "../config/redis.js";

export const deleteByPattern = async (pattern: string) => {
  const stream = redis.scanStream({
    match: pattern,
    count: 100,
  });

  for await (const keys of stream) {
    if (keys.length) {
      await redis.del(...keys);
    }
  }
};
