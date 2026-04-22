const express = require('express');
const router = express.Router();
const WeeklyAttendance = require('../models/attendance.model.js');
const Student = require('../models/student.model.js');
const { protect } = require('../middleware/auth.middleware.js');
const { buildAttendanceOverview } = require('../utils/attendanceMetrics.js');

const canViewAttendanceOverview = (user) =>
    user && ['admin', 'hod', 'mentor'].includes(user.role);

// 1. Bulk submit attendance (Mentor)
router.post('/bulk', protect, async (req, res) => {
    try {
        const mentorId = req.user._id;
        const { weekStartDate, classesHeld, records } = req.body;
        
        if (!weekStartDate || !classesHeld || !records || !Array.isArray(records)) {
            return res.status(400).json({ message: 'Invalid payload.' });
        }

        const date = new Date(weekStartDate);
        
        const bulkOps = records.map(record => {
            const percentage = classesHeld > 0 ? (record.classesAttended / classesHeld) * 100 : 0;
            return {
                updateOne: {
                    filter: { studentId: record.studentId, weekStartDate: date },
                    update: {
                        $set: {
                            mentorId,
                            classesHeld,
                            classesAttended: record.classesAttended,
                            percentage: Number(percentage.toFixed(2))
                        }
                    },
                    upsert: true
                }
            };
        });

        if (bulkOps.length > 0) {
            await WeeklyAttendance.bulkWrite(bulkOps);
        }

        res.status(200).json({ message: 'Attendance records successfully saved.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// 2. Get student history
router.get('/student/:studentId', protect, async (req, res) => {
    try {
        const student = await Student.findById(req.params.studentId).select('currentMentor department attendanceAction').lean();
        if (!student) {
            return res.status(404).json({ message: 'Student not found.' });
        }

        if (req.user.role === 'mentor' && String(student.currentMentor) !== String(req.user._id)) {
            return res.status(403).json({ message: 'You are not authorized to view this student attendance.' });
        }

        if (req.user.role === 'hod' && student.department !== req.user.department) {
            return res.status(403).json({ message: 'You are not authorized to view this student attendance.' });
        }

        const records = await WeeklyAttendance.find({ studentId: req.params.studentId })
            .sort({ weekStartDate: -1 })
            .lean();
        
        let cumulativeHeld = 0;
        let cumulativeAttended = 0;
        records.forEach(r => {
            cumulativeHeld += r.classesHeld;
            cumulativeAttended += r.classesAttended;
        });
        
        const cumulativePercentage = cumulativeHeld > 0 ? (cumulativeAttended / cumulativeHeld) * 100 : 0;

        res.status(200).json({
            records,
            cumulativePercentage: Number(cumulativePercentage.toFixed(2)),
            attendanceAction: student.attendanceAction?.note
                ? {
                    note: student.attendanceAction.note,
                    updatedAt: student.attendanceAction.updatedAt || null,
                    updatedBy: student.attendanceAction.updatedBy || null
                }
                : null
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// 3. Unified overview for attendance monitoring pages (Admin, HOD, Mentor)
router.get('/overview', protect, async (req, res) => {
    try {
        if (!canViewAttendanceOverview(req.user)) {
            return res.status(403).json({ message: 'Not authorized to view attendance overview.' });
        }

        const overview = await buildAttendanceOverview(req.user);
        res.status(200).json(overview);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// 4. Update attendance action for a student
router.put('/student/:studentId/action', protect, async (req, res) => {
    try {
        const note = String(req.body?.note || '').trim();

        if (!note) {
            return res.status(400).json({ message: 'Action note is required.' });
        }

        const student = await Student.findById(req.params.studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found.' });
        }

        if (req.user.role === 'mentor' && String(student.currentMentor) !== String(req.user._id)) {
            return res.status(403).json({ message: 'You are not authorized to update this student attendance action.' });
        }

        if (req.user.role === 'hod' && student.department !== req.user.department) {
            return res.status(403).json({ message: 'You are not authorized to update this student attendance action.' });
        }

        if (!['admin', 'hod', 'mentor'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Not authorized to update attendance action.' });
        }

        student.attendanceAction = {
            note,
            updatedAt: new Date(),
            updatedBy: req.user._id
        };

        await student.save();

        res.status(200).json({
            message: 'Attendance action updated successfully.',
            attendanceAction: {
                note: student.attendanceAction.note,
                updatedAt: student.attendanceAction.updatedAt,
                updatedBy: {
                    _id: req.user._id,
                    name: req.user.name,
                    role: req.user.role
                }
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// 5. Monitor Dashboard (Admin, HOD, Mentor scoped)
router.get('/monitor', protect, async (req, res) => {
    try {
        if (!canViewAttendanceOverview(req.user)) {
            return res.status(403).json({ message: 'Not authorized to view attendance monitor.' });
        }

        const overview = await buildAttendanceOverview(req.user);
        res.status(200).json(overview.monitor);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// 6. Low attendance students with mentor details (Admin, HOD, Mentor scoped)
router.get('/low-attendance-students', protect, async (req, res) => {
    try {
        if (!canViewAttendanceOverview(req.user)) {
            return res.status(403).json({ message: 'Not authorized to view low attendance students.' });
        }

        const overview = await buildAttendanceOverview(req.user);
        res.status(200).json(overview.lowAttendanceStudents);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
