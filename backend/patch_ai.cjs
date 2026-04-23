const fs = require('fs');

let content = fs.readFileSync('src/controllers/ai.controller.ts', 'utf-8');

if (!content.includes('config/redis')) {
  content = content.replace(
    /import \{ calculateDistance \} from "\.\.\/utils\/calculateDistance\.js";/,
    `import { calculateDistance } from "../utils/calculateDistance.js";\nimport { redis } from "../config/redis.js";`
  );
}

// autoAssignVolunteers
content = content.replace(
  /const aiResult = await getAIScore\(task, volunteer, distance\);/,
  `const cacheKey = \`ai:\${task._id}:\${volunteer._id}\`;\n    let aiResult;\n    const cachedAi = await redis.get(cacheKey);\n    if (cachedAi) {\n      aiResult = JSON.parse(cachedAi);\n    } else {\n      aiResult = await getAIScore(task, volunteer, distance);\n      await redis.set(cacheKey, JSON.stringify(aiResult), "EX", 900);\n    }`
);

fs.writeFileSync('src/controllers/ai.controller.ts', content);
console.log('ai.controller.ts patched successfully');
