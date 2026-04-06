const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/activityLog.model.js');
const User = require('../models/user.model.js');
const { protect } = require('../middleware/auth.middleware.js');

// -----------------------------------------------------------
// ROUTE 1: Get Leaderboard of All Departments
// -----------------------------------------------------------
router.get('/departments', protect, async (req, res) => {
  try {
    const departmentScores = await ActivityLog.aggregate([
      // Group by mentor to get total score per mentor first
      {
        $group: {
          _id: "$mentorId",
          totalScore: { $sum: "$score" }
        }
      },
      // Lookup mentor details to get their department
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "mentor"
        }
      },
      { $unwind: "$mentor" },
      // Group by department and sum the mentor scores
      {
        $group: {
          _id: "$mentor.department",
          departmentScore: { $sum: "$totalScore" }
        }
      },
      // Sort descending
      { $sort: { departmentScore: -1 } }
    ]);

    // Format output
    const formattedData = departmentScores.map(d => ({
      department: d._id,
      departmentScore: d.departmentScore
    }));

    res.status(200).json(formattedData);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching department analytics', error: err.message });
  }
});

// -----------------------------------------------------------
// ROUTE 2: Get Ranked Mentors within a Specific Department
// -----------------------------------------------------------
router.get('/department/:deptName/mentors', protect, async (req, res) => {
  try {
    const { deptName } = req.params;

    // We can lookup users first or activity logs first. Let's do ActivityLog->User
    const mentorRankings = await ActivityLog.aggregate([
      // Lookup User to filter by department
      {
        $lookup: {
          from: "users",
          localField: "mentorId",
          foreignField: "_id",
          as: "mentor"
        }
      },
      { $unwind: "$mentor" },
      { $match: { "mentor.department": deptName, "mentor.role": "mentor" } },
      // Calculate scores
      {
        $group: {
          _id: "$mentor._id",
          name: { $first: "$mentor.name" },
          mtsNumber: { $first: "$mentor.mtsNumber" },
          profileImage: { $first: "$mentor.profileImage" },
          totalScore: { $sum: "$score" }
        }
      },
      { $sort: { totalScore: -1 } }
    ]);

    res.status(200).json(mentorRankings);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching mentor analytics', error: err.message });
  }
});

module.exports = router;
