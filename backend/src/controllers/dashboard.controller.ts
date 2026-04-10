import { Task } from "../models/task.model.js";
import { User } from "../models/user.model.js";
import { Assignment } from "../models/assignment.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
  const user = req.user;

  if (user.role === 'admin') {
    const totalTasks = await Task.countDocuments();
    const totalVolunteers = await User.countDocuments({ role: 'volunteer' });
    const activeMissions = await Task.countDocuments({ status: { $in: ['open', 'in-progress'] } });
    const completedMissions = await Task.countDocuments({ status: 'completed' });

    return res.status(200).json(new ApiResponse(200, {
      totalTasks,
      totalVolunteers,
      activeMissions,
      completedMissions
    }, "Admin stats fetched"));
  } else {
    const assignments = await Assignment.find({ volunteer: user._id });
    const totalAssigned = assignments.filter(a => a.status === 'assigned' || a.status === 'accepted').length;
    const completed = assignments.filter(a => a.status === 'completed').length;

    return res.status(200).json(new ApiResponse(200, {
      totalAssigned,
      completed
    }, "Volunteer stats fetched"));
  }
});
