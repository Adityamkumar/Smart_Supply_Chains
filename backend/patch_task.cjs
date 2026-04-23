const fs = require('fs');

let content = fs.readFileSync('src/controllers/task.controller.ts', 'utf-8');

if (!content.includes('config/redis')) {
  content = content.replace(
    /import mongoose from "mongoose";/g,
    `import mongoose from "mongoose";\nimport { redis } from "../config/redis.js";\nimport { deleteByPattern } from "../utils/redis.utils.js";`
  );
}

// createTask
content = content.replace(
  /\]\}\);\s+return res\s+\.status\(201\)\s+\.json\(new ApiResponse\(201, task, "Task created successfully"\)\);\s+\}\);/,
  `]});\n\n  await deleteByPattern("tasks:*");\n\n  return res\n    .status(201)\n    .json(new ApiResponse(201, task, "Task created successfully"));\n});`
);

// deleteTask
content = content.replace(
  /await Assignment\.deleteMany\(\{ task: taskId \}\);\s+await task\.deleteOne\(\);\s+return res\.json\(new ApiResponse\(200, \{\}, "Task deleted successfully"\)\);/,
  `await Assignment.deleteMany({ task: taskId });\n    await task.deleteOne();\n\n    await deleteByPattern("tasks:*");\n    await deleteByPattern("assignments:*");\n\n    return res.json(new ApiResponse(200, {}, "Task deleted successfully"));`
);

// getAllTasks
content = content.replace(
  /export const getAllTasks = asyncHandler\(async \(req, res\) => \{\s+const tasks = await Task\.aggregate\(\[/,
  `export const getAllTasks = asyncHandler(async (req, res) => {\n  const cachedTasks = await redis.get("tasks:all");\n  if (cachedTasks) {\n    return res.json(new ApiResponse(200, JSON.parse(cachedTasks), "All tasks fetched from cache"));\n  }\n\n  const tasks = await Task.aggregate([`
);

content = content.replace(
  /\$sort: \{ createdAt: -1 \}\s+\}\s+\]\);\s+return res\.json\(new ApiResponse\(200, tasks, "All tasks fetched"\)\);/g,
  `$sort: { createdAt: -1 }\n    }\n  ]);\n\n  await redis.set("tasks:all", JSON.stringify(tasks), "EX", 60);\n\n  return res.json(new ApiResponse(200, tasks, "All tasks fetched"));`
);


// updateTaskStatus
content = content.replace(
  /task\.status = status;\s+await task\.save\(\);\s+return res\.json\(new ApiResponse\(200, task, "Task status updated"\)\);/,
  `task.status = status;\n  await task.save();\n\n  await deleteByPattern("tasks:*");\n\n  return res.json(new ApiResponse(200, task, "Task status updated"));`
);

// getNearbyTasks
content = content.replace(
  /if \(isNaN\(longitude\) \|\| isNaN\(latitude\)\) \{\s+throw new ApiError\(400, "Invalid numeric values"\);\s+\}\s+const tasks = await Task\.find\(\{/,
  `if (isNaN(longitude) || isNaN(latitude)) {\n    throw new ApiError(400, "Invalid numeric values");\n  }\n\n  const roundedLng = longitude.toFixed(2);\n  const roundedLat = latitude.toFixed(2);\n  const cacheKey = \`tasks:nearby:\${roundedLng}:\${roundedLat}\`;\n\n  const cachedTasks = await redis.get(cacheKey);\n  if (cachedTasks) {\n    return res.json(new ApiResponse(200, JSON.parse(cachedTasks), "Nearby tasks fetched from cache"));\n  }\n\n  const tasks = await Task.find({`
);

content = content.replace(
  /\},\s+\}\);\s+return res\.json\(\s+new ApiResponse\(200, tasks, "Nearby tasks fetched"\)\s+\);/,
  `},\n  });\n\n  await redis.set(cacheKey, JSON.stringify(tasks), "EX", 120);\n\n  return res.json(\n    new ApiResponse(200, tasks, "Nearby tasks fetched")\n  );`
);

fs.writeFileSync('src/controllers/task.controller.ts', content);
console.log('task.controller.ts patched successfully');
