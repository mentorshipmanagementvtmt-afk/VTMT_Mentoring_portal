const express = require('express');
const router = express.Router();

const Student = require('../models/student.model.js');
const { ExamRecord, EXAM_TYPES } = require('../models/examRecord.model.js');
const { protect } = require('../middleware/auth.middleware.js');

const EXAM_ORDER = EXAM_TYPES.reduce((acc, exam, index) => {
  acc[exam] = index;
  return acc;
}, {});

const canViewStudent = (user, student) => {
  if (user.role === 'admin') return true;
  if (user.role === 'hod') return student.department === user.department;
  if (user.role === 'mentor') return student.currentMentor.equals(user._id);
  return false;
};

const canEditStudentMarks = (user, student) => {
  return user.role === 'mentor' && student.currentMentor.equals(user._id);
};

const buildSummary = (records) => {
  if (!records.length) {
    return {
      completedExams: 0,
      totalExams: EXAM_TYPES.length,
      cumulativePercentage: 0,
      averageAttendancePercent: 0,
      progressDeltaPercent: 0
    };
  }

  const withPercent = records.map((record) => {
    const max = Number(record.maxMarks) > 0 ? Number(record.maxMarks) : 100;
    const mark = Number(record.marksObtained) || 0;
    return {
      ...record,
      markPercent: Number(((mark / max) * 100).toFixed(2))
    };
  });

  const cumulativePercentage =
    withPercent.reduce((sum, record) => sum + record.markPercent, 0) / withPercent.length;
  const averageAttendancePercent =
    withPercent.reduce((sum, record) => sum + (Number(record.attendancePercent) || 0), 0) /
    withPercent.length;

  const cat1 = withPercent.find((record) => record.examType === 'CAT-1');
  const cat2 = withPercent.find((record) => record.examType === 'CAT-2');
  const progressDeltaPercent =
    cat1 && cat2 ? Number((cat2.markPercent - cat1.markPercent).toFixed(2)) : 0;

  return {
    completedExams: withPercent.length,
    totalExams: EXAM_TYPES.length,
    cumulativePercentage: Number(cumulativePercentage.toFixed(2)),
    averageAttendancePercent: Number(averageAttendancePercent.toFixed(2)),
    progressDeltaPercent
  };
};

router.get('/exam-types', protect, async (_req, res) => {
  res.status(200).json(EXAM_TYPES);
});

router.get('/student/:studentId', protect, async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId).populate(
      'currentMentor',
      'name email mtsNumber'
    );

    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    if (!canViewStudent(req.user, student)) {
      return res.status(403).json({ message: 'You are not authorized to view this student.' });
    }

    const records = await ExamRecord.find({ studentId }).sort({ createdAt: 1 }).lean();
    const normalized = EXAM_TYPES.map((examType) => {
      const record = records.find((item) => item.examType === examType);
      if (!record) return null;
      const max = Number(record.maxMarks) > 0 ? Number(record.maxMarks) : 100;
      const mark = Number(record.marksObtained) || 0;
      return {
        ...record,
        markPercent: Number(((mark / max) * 100).toFixed(2))
      };
    }).filter(Boolean);

    const orderedRecords = normalized.sort(
      (a, b) => EXAM_ORDER[a.examType] - EXAM_ORDER[b.examType]
    );

    const summary = buildSummary(orderedRecords);

    res.status(200).json({
      student: {
        _id: student._id,
        name: student.name,
        registerNumber: student.registerNumber,
        department: student.department
      },
      mentor: student.currentMentor
        ? {
            _id: student.currentMentor._id,
            name: student.currentMentor.name,
            email: student.currentMentor.email,
            mtsNumber: student.currentMentor.mtsNumber
          }
        : null,
      records: orderedRecords,
      summary
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const {
      studentId,
      examType,
      marksObtained = 0,
      maxMarks = 100,
      attendancePercent = 0,
      remarks = '',
      examDate
    } = req.body;

    if (!studentId || !examType) {
      return res.status(400).json({ message: 'studentId and examType are required.' });
    }

    if (!EXAM_TYPES.includes(examType)) {
      return res.status(400).json({ message: 'Invalid exam type.' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    if (!canEditStudentMarks(req.user, student)) {
      return res
        .status(403)
        .json({ message: 'Only the assigned mentor can enter or modify marks.' });
    }

    const sanitizedMax = Number(maxMarks) > 0 ? Number(maxMarks) : 100;
    const sanitizedMarks = Math.max(0, Math.min(Number(marksObtained) || 0, sanitizedMax));
    const sanitizedAttendance = Math.max(0, Math.min(Number(attendancePercent) || 0, 100));

    const saved = await ExamRecord.findOneAndUpdate(
      { studentId, examType },
      {
        studentId,
        mentorId: req.user._id,
        examType,
        marksObtained: sanitizedMarks,
        maxMarks: sanitizedMax,
        attendancePercent: sanitizedAttendance,
        remarks: remarks || '',
        examDate: examDate ? new Date(examDate) : new Date()
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:recordId', protect, async (req, res) => {
  try {
    const { recordId } = req.params;
    const record = await ExamRecord.findById(recordId);
    if (!record) {
      return res.status(404).json({ message: 'Exam record not found.' });
    }

    const student = await Student.findById(record.studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    if (!canEditStudentMarks(req.user, student)) {
      return res
        .status(403)
        .json({ message: 'Only the assigned mentor can enter or modify marks.' });
    }

    const {
      marksObtained = record.marksObtained,
      maxMarks = record.maxMarks,
      attendancePercent = record.attendancePercent,
      remarks = record.remarks,
      examDate = record.examDate
    } = req.body;

    const sanitizedMax = Number(maxMarks) > 0 ? Number(maxMarks) : 100;
    const sanitizedMarks = Math.max(0, Math.min(Number(marksObtained) || 0, sanitizedMax));
    const sanitizedAttendance = Math.max(0, Math.min(Number(attendancePercent) || 0, 100));

    record.marksObtained = sanitizedMarks;
    record.maxMarks = sanitizedMax;
    record.attendancePercent = sanitizedAttendance;
    record.remarks = remarks || '';
    record.examDate = examDate ? new Date(examDate) : record.examDate;
    record.mentorId = req.user._id;

    await record.save();
    res.status(200).json(record);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:recordId', protect, async (req, res) => {
  try {
    const { recordId } = req.params;
    const record = await ExamRecord.findById(recordId);
    if (!record) {
      return res.status(404).json({ message: 'Exam record not found.' });
    }

    const student = await Student.findById(record.studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    if (!canEditStudentMarks(req.user, student)) {
      return res
        .status(403)
        .json({ message: 'Only the assigned mentor can delete marks.' });
    }

    await ExamRecord.findByIdAndDelete(recordId);
    res.status(200).json({ message: 'Exam record deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
