const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/activityLog.model.js');
const Student = require('../models/student.model.js');
const User = require('../models/user.model.js');
const { protect, isAdmin } = require('../middleware/auth.middleware.js');
const { buildAttendanceOverview } = require('../utils/attendanceMetrics.js');
const {
  buildDepartmentLeaderboard,
  getDepartmentDashboard
} = require('../utils/departmentAnalytics.js');

const getDepartmentScores = async () => {
  return buildDepartmentLeaderboard();
};

// -----------------------------------------------------------
// ROUTE 1: Get Leaderboard of All Departments
// -----------------------------------------------------------
router.get('/departments', protect, async (req, res) => {
  try {
    const departmentScores = await getDepartmentScores();
    res.status(200).json(departmentScores);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching department analytics', error: err.message });
  }
});

router.get('/dashboard-summary', protect, isAdmin, async (req, res) => {
  try {
    const [departmentScores, attendanceOverview, hods, mentors, students] = await Promise.all([
      getDepartmentScores(),
      buildAttendanceOverview(req.user),
      User.countDocuments({ role: 'hod' }),
      User.countDocuments({ role: 'mentor' }),
      Student.countDocuments()
    ]);

    res.status(200).json({
      departmentScores,
      alerts: attendanceOverview.monitor.filter((item) => item.isFlagged),
      stats: {
        hods,
        mentors,
        students
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching dashboard summary', error: err.message });
  }
});

// -----------------------------------------------------------
// ROUTE 2: Get Ranked Mentors within a Specific Department
// -----------------------------------------------------------
router.get('/department/:deptName/mentors', protect, async (req, res) => {
  try {
    const { deptName } = req.params;
    const dashboard = await getDepartmentDashboard(deptName);
    const mentorRankings = dashboard.mentorActivity.map((mentor) => ({
      _id: mentor.mentorId,
      name: mentor.mentorName,
      mtsNumber: mentor.mtsNumber,
      profileImage: mentor.profileImage,
      totalScore: mentor.activityPoints
    }));

    res.status(200).json(mentorRankings);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching mentor analytics', error: err.message });
  }
});

module.exports = router;
