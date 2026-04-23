const fs = require('fs');

let content = fs.readFileSync('src/controllers/assignTask.controller.ts', 'utf-8');

if (!content.includes('config/redis')) {
  content = content.replace(
    /import \{ Assignment \} from "\.\.\/models\/assignment\.model\.js";/,
    `import { Assignment } from "../models/assignment.model.js";\nimport { redis } from "../config/redis.js";\nimport { deleteByPattern } from "../utils/redis.utils.js";`
  );
}

// assignVolunteer
content = content.replace(
  /task\.assignedCount \+= 1;\s+if \(task\.assignedCount === task\.volunteersNeeded\) \{\s+task\.status = "in-progress";\s+\}\s+await task\.save\(\);\s+return res\.json\(\s+new ApiResponse\(200, assignment, "Volunteer assigned successfully"\),\s+\);/,
  `task.assignedCount += 1;\n\n  if (task.assignedCount === task.volunteersNeeded) {\n    task.status = "in-progress";\n  }\n\n  await task.save();\n\n  await deleteByPattern("tasks:*");\n  await deleteByPattern("assignments:*");\n\n  return res.json(\n    new ApiResponse(200, assignment, "Volunteer assigned successfully"),\n  );`
);

// updateAssignmentStatus
content = content.replace(
  /assignment\.status = status;\s+await assignment\.save\(\);\s+return res\.json\(\s+new ApiResponse\(200, assignment, "Assignment updated"\)\s+\);/,
  `assignment.status = status;\n\n  await assignment.save();\n\n  await deleteByPattern("tasks:*");\n  await deleteByPattern("assignments:*");\n\n  return res.json(\n    new ApiResponse(200, assignment, "Assignment updated")\n  );`
);

// getMyAssignments
content = content.replace(
  /export const getMyAssignments = asyncHandler\(async \(req, res\) => \{\s+const assignments = await Assignment\.find\(\{/,
  `export const getMyAssignments = asyncHandler(async (req, res) => {\n  const cacheKey = \`assignments:\${req.user?._id}\`;\n  const cached = await redis.get(cacheKey);\n  if (cached) {\n    return res.json(new ApiResponse(200, JSON.parse(cached), "My assignments fetched from cache"));\n  }\n\n  const assignments = await Assignment.find({`
);

content = content.replace(
  /\.populate\('volunteer', 'name email'\)\s+\.sort\(\{ createdAt: -1 \}\);\s+return res\.json\(\s+new ApiResponse\(200, assignments, "My assignments fetched"\)\s+\);/,
  `.populate('volunteer', 'name email')\n    .sort({ createdAt: -1 });\n\n  await redis.set(cacheKey, JSON.stringify(assignments), "EX", 60);\n\n  return res.json(\n    new ApiResponse(200, assignments, "My assignments fetched")\n  );`
);

// deleteAssignment
content = content.replace(
  /await task\.save\(\);\s+\}\s+await assignment\.deleteOne\(\);\s+return res\.json\(\s+new ApiResponse\(200, \{\}, "Assignment deleted successfully"\)\s+\);/,
  `await task.save();\n  }\n\n  await assignment.deleteOne();\n\n  await deleteByPattern("tasks:*");\n  await deleteByPattern("assignments:*");\n\n  return res.json(\n    new ApiResponse(200, {}, "Assignment deleted successfully")\n  );`
);

fs.writeFileSync('src/controllers/assignTask.controller.ts', content);
console.log('assignTask.controller.ts patched successfully');
