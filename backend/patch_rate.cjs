const fs = require('fs');

let content = fs.readFileSync('src/middleware/rateLimiter.middleware.ts', 'utf-8');

content = `import rateLimit from 'express-rate-limit';
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { redis } from "../config/redis.js";

// Custom Rate Limiter using Redis for /help-requests
export const helpRequestLimiter = asyncHandler(async (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || "unknown_ip";
    const key = \`rate:\${ip}\`;

    const count = await redis.incr(key);

    if (count === 1) {
      await redis.expire(key, 60);
    }

    if (count > 5) {
      throw new ApiError(429, "Too many requests");
    }

    next();
});

export const authLimiter = rateLimit({
    windowMs: 2 * 60 * 1000, 
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        success: false,
        message: "Multiple authentication attempts detected. Access blocked for 2 minutes to ensure account security."
    }
});
`;

fs.writeFileSync('src/middleware/rateLimiter.middleware.ts', content);
console.log('rateLimiter.middleware.ts patched successfully');
