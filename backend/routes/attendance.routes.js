const express = require('express');
const router = express.Router();
const WeeklyAttendance = require('../models/attendance.model.js');
const Student = require('../models/student.model.js');
const User = require('../models/user.model.js');
const { protect, isAdminOrHod } = require('../middleware/auth.middleware.js');

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
        const records = await WeeklyAttendance.find({ studentId: req.params.studentId }).sort({ weekStartDate: -1 });
        
        let cumulativeHeld = 0;
        let cumulativeAttended = 0;
        records.forEach(r => {
            cumulativeHeld += r.classesHeld;
            cumulativeAttended += r.classesAttended;
        });
        
        const cumulativePercentage = cumulativeHeld > 0 ? (cumulativeAttended / cumulativeHeld) * 100 : 0;

        res.status(200).json({
            records,
            cumulativePercentage: Number(cumulativePercentage.toFixed(2))
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// 3. Monitor Dashboard (Admin & HOD)
router.get('/monitor', protect, isAdminOrHod, async (req, res) => {
    try {
        const user = req.user;
        const query = { role: 'mentor' };
        if (user.role === 'hod') {
            query.department = user.department;
        }

        const mentors = await User.find(query).select('name department email mtsNumber profileImage');
        const metrics = [];
        const hodCache = {};

        for (const mentor of mentors) {
            // Fetch HOD for this department 
            if (!hodCache[mentor.department]) {
                const searchDept = mentor.department ? mentor.department.trim() : '';
                const hod = await User.findOne({ 
                    role: 'hod', 
                    department: { $regex: new RegExp(`^${searchDept.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } 
                }).select('name');
                hodCache[mentor.department] = hod ? hod.name : 'Unassigned';
            }

            // Find latest attendance record by this mentor
            const lastRecord = await WeeklyAttendance.findOne({ mentorId: mentor._id }).sort({ createdAt: -1 });
            
            let missingWeeksFlag = true; // Default to true if they never logged
            let lastLoggedDate = null;
            if (lastRecord) {
                lastLoggedDate = lastRecord.createdAt;
                const daysSinceLog = (Date.now() - new Date(lastLoggedDate).getTime()) / (1000 * 3600 * 24);
                missingWeeksFlag = daysSinceLog > 7; // Flag if older than 7 days
            }

            // Find mentees assigned to this mentor
            const mentees = await Student.find({ currentMentor: mentor._id }).select('_id name');
            let lowAttendanceCount = 0;
            let totalHeld = 0;
            let totalAttended = 0;

            for (const mentee of mentees) {
                const recs = await WeeklyAttendance.find({ studentId: mentee._id });
                let pHeld = 0;
                let pAtt = 0;
                recs.forEach(r => { pHeld += r.classesHeld; pAtt += r.classesAttended; });
                
                totalHeld += pHeld;
                totalAttended += pAtt;

                if (pHeld > 0) {
                    const pct = (pAtt / pHeld) * 100;
                    if (pct < 75) lowAttendanceCount++;
                }
            }

            const avgMenteePercentage = totalHeld > 0 ? (totalAttended / totalHeld) * 100 : 0;

            metrics.push({
                mentorId: mentor._id,
                mentorName: mentor.name,
                mentorEmail: mentor.email,
                mentorMts: mentor.mtsNumber,
                mentorProfileImage: mentor.profileImage,
                department: mentor.department,
                hodName: hodCache[mentor.department],
                lastLoggedDate,
                isFlagged: missingWeeksFlag || (avgMenteePercentage > 0 && avgMenteePercentage < 75), // Flag if not logged or avg < 75%
                missingWeeksFlag,
                avgMenteePercentage: Number(avgMenteePercentage.toFixed(2)),
                lowAttendanceCount,
                totalMentees: mentees.length
            });
        }

        res.status(200).json(metrics);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// 4. Low attendance students with mentor details (Admin & HOD)
router.get('/low-attendance-students', protect, isAdminOrHod, async (req, res) => {
    try {
        const studentQuery = {};
        if (req.user.role === 'hod') {
            studentQuery.department = req.user.department;
        }

        const students = await Student.find(studentQuery)
            .select('_id name registerNumber department batch section currentMentor')
            .populate('currentMentor', 'name email mtsNumber profileImage');

        const lowAttendanceStudents = [];

        for (const student of students) {
            const records = await WeeklyAttendance.find({ studentId: student._id }).select('classesHeld classesAttended');
            const totals = records.reduce(
                (acc, item) => {
                    acc.held += item.classesHeld || 0;
                    acc.attended += item.classesAttended || 0;
                    return acc;
                },
                { held: 0, attended: 0 }
            );

            if (!totals.held) {
                continue;
            }

            const cumulativeAttendance = Number(((totals.attended / totals.held) * 100).toFixed(2));
            if (cumulativeAttendance >= 75) {
                continue;
            }

            lowAttendanceStudents.push({
                studentId: student._id,
                studentName: student.name,
                registerNumber: student.registerNumber,
                department: student.department,
                batch: student.batch || '',
                section: student.section || '',
                cumulativeAttendance,
                mentor: student.currentMentor
                    ? {
                        mentorId: student.currentMentor._id,
                        name: student.currentMentor.name,
                        email: student.currentMentor.email,
                        mtsNumber: student.currentMentor.mtsNumber,
                        profileImage: student.currentMentor.profileImage
                    }
                    : null
            });
        }

        lowAttendanceStudents.sort((a, b) => a.cumulativeAttendance - b.cumulativeAttendance);
        res.status(200).json(lowAttendanceStudents);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
