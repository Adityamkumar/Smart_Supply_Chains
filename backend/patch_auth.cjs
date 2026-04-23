const fs = require('fs');

let authController = fs.readFileSync('src/controllers/auth.controller.ts', 'utf-8');

if (!authController.includes('config/redis')) {
  authController = authController.replace(
    /import \{ User \} from "\.\.\/models\/user\.model\.js";/,
    `import { User } from "../models/user.model.js";\nimport { redis } from "../config/redis.js";`
  );
}

// logoutUser
authController = authController.replace(
  /export const logoutUser = asyncHandler\(async \(req, res\) => \{/,
  `export const logoutUser = asyncHandler(async (req, res) => {\n  const token = req.cookies?.accessToken || req.header("authorization")?.replace("Bearer ", "");\n  if (token) {\n    try {\n      const decoded: any = jwt.decode(token);\n      if (decoded && decoded.exp) {\n        const currentTime = Math.floor(Date.now() / 1000);\n        const expiryTime = decoded.exp - currentTime;\n        if (expiryTime > 0) {\n          await redis.set(\`blacklist:\${token}\`, "1", "EX", expiryTime);\n        }\n      }\n    } catch (e) {}\n  }\n`
);

fs.writeFileSync('src/controllers/auth.controller.ts', authController);
console.log('auth.controller.ts patched successfully');

let authMiddleware = fs.readFileSync('src/middleware/auth.middleware.ts', 'utf-8');

if (!authMiddleware.includes('config/redis')) {
  authMiddleware = authMiddleware.replace(
    /import \{ User \} from "\.\.\/models\/user\.model\.js";/,
    `import { User } from "../models/user.model.js";\nimport { redis } from "../config/redis.js";`
  );
}

// verifyJwt
authMiddleware = authMiddleware.replace(
  /if \(!token\) \{\s+throw new ApiError\(401, "Unauthorized request"\);\s+\}/,
  `if (!token) {\n      throw new ApiError(401, "Unauthorized request");\n    }\n\n    const isBlacklisted = await redis.get(\`blacklist:\${token}\`);\n    if (isBlacklisted) {\n      throw new ApiError(401, "Token expired or invalid");\n    }`
);

fs.writeFileSync('src/middleware/auth.middleware.ts', authMiddleware);
console.log('auth.middleware.ts patched successfully');
