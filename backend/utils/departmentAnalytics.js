const Department = require('../models/department.model.js');
const User = require('../models/user.model.js');
const Student = require('../models/student.model.js');
const Assessment = require('../models/assessment.model.js');
const ActivityLog = require('../models/activityLog.model.js');
const WeeklyAttendance = require('../models/attendance.model.js');
const { ExamRecord } = require('../models/examRecord.model.js');
const { calculateTotalScore } = require('./scoring.js');

const normalizeDepartmentName = (name = '') => String(name).trim();

const buildDepartmentCode = (name = '') => {
  const normalized = normalizeDepartmentName(name).toUpperCase().replace(/[^A-Z0-9]+/g, '');
  return normalized || 'DEPT';
};

const average = (values = []) => {
  if (!values.length) return 0;
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
};

const getKnownDepartments = async () => {
  const [departmentDocs, userDepartments, studentDepartments] = await Promise.all([
    Department.find().sort({ name: 1 }).lean(),
    User.distinct('department', { department: { $nin: [null, ''] } }),
    Student.distinct('department', { department: { $nin: [null, ''] } })
  ]);

  const departmentMap = new Map();

  departmentDocs.forEach((department) => {
    departmentMap.set(normalizeDepartmentName(department.name).toLowerCase(), {
      ...department,
      name: normalizeDepartmentName(department.name)
    });
  });

  [...userDepartments, ...studentDepartments]
    .map(normalizeDepartmentName)
    .filter(Boolean)
    .forEach((name) => {
      const key = name.toLowerCase();
      if (!departmentMap.has(key)) {
        departmentMap.set(key, {
          _id: null,
          name,
          code: buildDepartmentCode(name),
          description: '',
          hodId: null,
          isVirtual: true
        });
      }
    });

  return Array.from(departmentMap.values()).sort((a, b) => a.name.localeCompare(b.name));
};

const getDepartmentDashboard = async (departmentName) => {
  const normalizedDepartment = normalizeDepartmentName(departmentName);
  if (!normalizedDepartment) {
    throw new Error('Department name is required.');
  }

  const [departmentDoc, hod, mentors, students] = await Promise.all([
    Department.findOne({ name: normalizedDepartment }).lean(),
    User.findOne({ role: 'hod', department: normalizedDepartment })
      .select('name email mtsNumber designation department profileImage')
      .lean(),
    User.find({ role: 'mentor', department: normalizedDepartment })
      .select('name email mtsNumber designation department profileImage')
      .sort({ name: 1 })
      .lean(),
    Student.find({ department: normalizedDepartment })
      .select('_id name registerNumber batch section currentMentor')
      .lean()
  ]);

  const studentIds = students.map((student) => student._id);
  const mentorIds = mentors.map((mentor) => mentor._id);

  const [latestAssessments, examStats, activityByMentor, attendanceByStudent] = await Promise.all([
    studentIds.length
      ? Assessment.aggregate([
          { $match: { studentId: { $in: studentIds } } },
          { $sort: { updatedAt: -1 } },
          { $group: { _id: '$studentId', latestAssessment: { $first: '$$ROOT' } } }
        ])
      : [],
    studentIds.length
      ? ExamRecord.aggregate([
          { $match: { studentId: { $in: studentIds } } },
          {
            $group: {
              _id: '$studentId',
              avgMarkPercent: {
                $avg: {
                  $multiply: [{ $divide: ['$marksObtained', '$maxMarks'] }, 100]
                }
              },
              examCount: { $sum: 1 }
            }
          }
        ])
      : [],
    mentorIds.length
      ? ActivityLog.aggregate([
          { $match: { mentorId: { $in: mentorIds } } },
          {
            $group: {
              _id: '$mentorId',
              activityPoints: { $sum: '$score' },
              activityCount: { $sum: 1 }
            }
          }
        ])
      : [],
    studentIds.length
      ? WeeklyAttendance.aggregate([
          { $match: { studentId: { $in: studentIds } } },
          {
            $group: {
              _id: '$studentId',
              classesHeld: { $sum: '$classesHeld' },
              classesAttended: { $sum: '$classesAttended' }
            }
          }
        ])
      : []
  ]);

  const assessmentByStudent = new Map(
    latestAssessments.map((entry) => [String(entry._id), entry.latestAssessment])
  );
  const examByStudent = new Map(
    examStats.map((entry) => [String(entry._id), entry])
  );
  const activityByMentorMap = new Map(
    activityByMentor.map((entry) => [String(entry._id), entry])
  );
  const attendanceByStudentMap = new Map(
    attendanceByStudent.map((entry) => [String(entry._id), entry])
  );
  const mentorNameById = new Map(mentors.map((mentor) => [String(mentor._id), mentor.name]));

  const studentPerformance = students
    .map((student) => {
      const latestAssessment = assessmentByStudent.get(String(student._id));
      const assessmentScore = latestAssessment
        ? calculateTotalScore(latestAssessment).totalScore
        : 0;
      const examAveragePercent = Number(
        (examByStudent.get(String(student._id))?.avgMarkPercent || 0).toFixed(2)
      );
      const attendance = attendanceByStudentMap.get(String(student._id)) || {
        classesHeld: 0,
        classesAttended: 0
      };
      const cumulativeAttendance =
        attendance.classesHeld > 0
          ? Number(((attendance.classesAttended / attendance.classesHeld) * 100).toFixed(2))
          : 0;
      const performanceIndex = Number(
        (((assessmentScore / 50) * 100) * 0.6 + examAveragePercent * 0.4).toFixed(2)
      );

      return {
        studentId: student._id,
        studentName: student.name,
        registerNumber: student.registerNumber,
        batch: student.batch || '',
        section: student.section || '',
        mentorId: student.currentMentor || null,
        mentorName: mentorNameById.get(String(student.currentMentor)) || 'Unassigned',
        latestAssessmentScore: Number(assessmentScore.toFixed(2)),
        examAveragePercent,
        cumulativeAttendance,
        performanceIndex
      };
    })
    .sort((a, b) => b.performanceIndex - a.performanceIndex);

  const menteeCountByMentor = students.reduce((acc, student) => {
    const key = student.currentMentor ? String(student.currentMentor) : null;
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const mentorActivity = mentors
    .map((mentor) => {
      const mentorKey = String(mentor._id);
      const mentorStudents = studentPerformance.filter(
        (student) => String(student.mentorId) === mentorKey
      );
      const lowAttendanceCount = mentorStudents.filter(
        (student) => student.cumulativeAttendance > 0 && student.cumulativeAttendance < 75
      ).length;

      return {
        mentorId: mentor._id,
        mentorName: mentor.name,
        email: mentor.email,
        mtsNumber: mentor.mtsNumber,
        designation: mentor.designation,
        profileImage: mentor.profileImage,
        menteeCount: menteeCountByMentor[mentorKey] || 0,
        activityPoints: activityByMentorMap.get(mentorKey)?.activityPoints || 0,
        activityCount: activityByMentorMap.get(mentorKey)?.activityCount || 0,
        averageStudentPerformance: average(
          mentorStudents.map((student) => student.performanceIndex)
        ),
        lowAttendanceCount
      };
    })
    .sort((a, b) => {
      if (b.activityPoints !== a.activityPoints) return b.activityPoints - a.activityPoints;
      return b.averageStudentPerformance - a.averageStudentPerformance;
    });

  const averageAssessmentScore = average(
    studentPerformance
      .map((student) => student.latestAssessmentScore)
      .filter((score) => score > 0)
  );
  const averageExamPercentage = average(
    studentPerformance
      .map((student) => student.examAveragePercent)
      .filter((score) => score > 0)
  );
  const averageAttendance = average(
    studentPerformance
      .map((student) => student.cumulativeAttendance)
      .filter((score) => score > 0)
  );
  const totalActivityPoints = mentorActivity.reduce(
    (sum, mentor) => sum + mentor.activityPoints,
    0
  );
  const totalActivityCount = mentorActivity.reduce(
    (sum, mentor) => sum + mentor.activityCount,
    0
  );
  const lowAttendanceStudents = studentPerformance.filter(
    (student) => student.cumulativeAttendance > 0 && student.cumulativeAttendance < 75
  ).length;
  const studentMarksScore = Number(
    ((((averageAssessmentScore / 50) * 100) * 0.6 + averageExamPercentage * 0.4)).toFixed(2)
  );
  const contributionScore = Number(
    (students.length ? Math.min(100, totalActivityPoints / students.length) : 0).toFixed(2)
  );
  const departmentScore = Number(
    (studentMarksScore * 0.7 + contributionScore * 0.3).toFixed(2)
  );

  return {
    department: {
      _id: departmentDoc?._id || null,
      name: normalizedDepartment,
      code: departmentDoc?.code || buildDepartmentCode(normalizedDepartment),
      description: departmentDoc?.description || '',
      hodId: departmentDoc?.hodId || hod?._id || null
    },
    hod,
    mentors,
    mentorActivity,
    studentPerformance,
    topStudents: studentPerformance.slice(0, 8),
    summary: {
      studentCount: students.length,
      mentorCount: mentors.length,
      averageAssessmentScore,
      averageExamPercentage,
      averageAttendance,
      totalActivityPoints,
      totalActivityCount,
      lowAttendanceStudents,
      studentMarksScore,
      contributionScore,
      departmentScore
    }
  };
};

const buildDepartmentLeaderboard = async () => {
  const knownDepartments = await getKnownDepartments();
  const dashboards = await Promise.all(
    knownDepartments.map((department) => getDepartmentDashboard(department.name))
  );

  return dashboards
    .map((dashboard) => ({
      _id: dashboard.department._id,
      department: dashboard.department.name,
      code: dashboard.department.code,
      description: dashboard.department.description,
      departmentScore: dashboard.summary.departmentScore,
      studentMarksScore: dashboard.summary.studentMarksScore,
      contributionScore: dashboard.summary.contributionScore,
      studentCount: dashboard.summary.studentCount,
      mentorCount: dashboard.summary.mentorCount,
      averageAssessmentScore: dashboard.summary.averageAssessmentScore,
      averageExamPercentage: dashboard.summary.averageExamPercentage,
      totalActivityPoints: dashboard.summary.totalActivityPoints,
      lowAttendanceStudents: dashboard.summary.lowAttendanceStudents,
      hod: dashboard.hod
        ? {
            _id: dashboard.hod._id,
            name: dashboard.hod.name,
            email: dashboard.hod.email,
            mtsNumber: dashboard.hod.mtsNumber
          }
        : null
    }))
    .sort((a, b) => b.departmentScore - a.departmentScore);
};

module.exports = {
  normalizeDepartmentName,
  buildDepartmentCode,
  getKnownDepartments,
  getDepartmentDashboard,
  buildDepartmentLeaderboard
};
