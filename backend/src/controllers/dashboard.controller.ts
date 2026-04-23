import { Task } from "../models/task.model.js";
import { User } from "../models/user.model.js";
import { Assignment } from "../models/assignment.model.js";
import { Rating } from "../models/rating.model.js";
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

    // Real-time rating calculation to prevent stale data
    const allRatings = await Rating.find({ volunteerId: user._id });
    const totalRatings = allRatings.length;
    const sum = allRatings.reduce((acc, curr) => acc + curr.rating, 0);
    const averageRating = totalRatings > 0 ? Math.round((sum / totalRatings) * 10) / 10 : 0;

    return res.status(200).json(new ApiResponse(200, {
      totalAssigned,
      completed,
      actualRating: averageRating,
      actualTotalRatings: totalRatings
    }, "Volunteer stats fetched"));
  }
});
