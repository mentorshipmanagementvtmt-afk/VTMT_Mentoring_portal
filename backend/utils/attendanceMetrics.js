const WeeklyAttendance = require('../models/attendance.model.js');
const Student = require('../models/student.model.js');
const User = require('../models/user.model.js');

const normalizeDepartment = (department = '') => String(department).trim().toLowerCase();

const buildMentorQuery = (user) => {
  const query = { role: 'mentor' };

  if (user.role === 'mentor') {
    query._id = user._id;
  }

  if (user.role === 'hod') {
    query.department = user.department;
  }

  return query;
};

const buildAttendanceOverview = async (user) => {
  const mentors = await User.find(buildMentorQuery(user))
    .select('name department email mtsNumber profileImage')
    .lean();

  if (!mentors.length) {
    return {
      monitor: [],
      lowAttendanceStudents: []
    };
  }

  const mentorIds = mentors.map((mentor) => mentor._id);
  const mentorKey = (id) => String(id);
  const mentorsById = new Map(mentors.map((mentor) => [mentorKey(mentor._id), mentor]));

  const studentQuery =
    user.role === 'mentor'
      ? { currentMentor: user._id }
      : { currentMentor: { $in: mentorIds } };

  if (user.role === 'hod') {
    studentQuery.department = user.department;
  }

  const [hods, lastLogs, students] = await Promise.all([
    User.find({ role: 'hod' }).select('name department').lean(),
    WeeklyAttendance.aggregate([
      { $match: { mentorId: { $in: mentorIds } } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: '$mentorId', lastLoggedDate: { $first: '$createdAt' } } }
    ]),
    Student.find(studentQuery)
      .select('_id name registerNumber department batch section currentMentor attendanceAction')
      .lean()
  ]);

  const attendanceActionUserIds = students
    .map((student) => student.attendanceAction?.updatedBy)
    .filter(Boolean);

  const actionUsers = attendanceActionUserIds.length
    ? await User.find({ _id: { $in: attendanceActionUserIds } }).select('name role').lean()
    : [];

  const actionUsersById = new Map(
    actionUsers.map((entry) => [mentorKey(entry._id), entry])
  );

  const studentIds = students.map((student) => student._id);
  const attendanceByStudent = studentIds.length
    ? await WeeklyAttendance.aggregate([
        { $match: { studentId: { $in: studentIds } } },
        {
          $group: {
            _id: '$studentId',
            held: { $sum: '$classesHeld' },
            attended: { $sum: '$classesAttended' }
          }
        }
      ])
    : [];

  const attendanceMap = new Map(
    attendanceByStudent.map((entry) => [mentorKey(entry._id), entry])
  );
  const statsByMentor = new Map();
  const lowAttendanceStudents = [];

  for (const student of students) {
    const currentMentorId = student.currentMentor ? mentorKey(student.currentMentor) : null;
    if (!currentMentorId) {
      continue;
    }

    const mentorStats = statsByMentor.get(currentMentorId) || {
      totalMentees: 0,
      totalHeld: 0,
      totalAttended: 0,
      lowAttendanceCount: 0
    };

    mentorStats.totalMentees += 1;

    const totals = attendanceMap.get(mentorKey(student._id)) || { held: 0, attended: 0 };
    mentorStats.totalHeld += totals.held || 0;
    mentorStats.totalAttended += totals.attended || 0;

    if (totals.held > 0) {
      const cumulativeAttendance = Number(((totals.attended / totals.held) * 100).toFixed(2));
      if (cumulativeAttendance < 75) {
        mentorStats.lowAttendanceCount += 1;

        const mentor = mentorsById.get(currentMentorId);
        lowAttendanceStudents.push({
          studentId: student._id,
          studentName: student.name,
          registerNumber: student.registerNumber,
          department: student.department,
          batch: student.batch || '',
          section: student.section || '',
          cumulativeAttendance,
          attendanceAction: student.attendanceAction?.note
            ? {
                note: student.attendanceAction.note,
                updatedAt: student.attendanceAction.updatedAt || null,
                updatedBy: student.attendanceAction.updatedBy
                  ? {
                      _id: student.attendanceAction.updatedBy,
                      name:
                        actionUsersById.get(mentorKey(student.attendanceAction.updatedBy))?.name ||
                        'Unknown user',
                      role:
                        actionUsersById.get(mentorKey(student.attendanceAction.updatedBy))?.role ||
                        ''
                    }
                  : null
              }
            : null,
          mentor: mentor
            ? {
                mentorId: mentor._id,
                name: mentor.name,
                email: mentor.email,
                mtsNumber: mentor.mtsNumber,
                profileImage: mentor.profileImage
              }
            : null
        });
      }
    }

    statsByMentor.set(currentMentorId, mentorStats);
  }

  const hodByDepartment = new Map(
    hods.map((hod) => [normalizeDepartment(hod.department), hod.name])
  );
  const lastLogByMentor = new Map(
    lastLogs.map((entry) => [mentorKey(entry._id), entry.lastLoggedDate])
  );

  const monitor = mentors.map((mentor) => {
    const mentorId = mentorKey(mentor._id);
    const stats = statsByMentor.get(mentorId) || {
      totalMentees: 0,
      totalHeld: 0,
      totalAttended: 0,
      lowAttendanceCount: 0
    };

    const totalHeld = stats.totalHeld || 0;
    const totalAttended = stats.totalAttended || 0;
    const avgMenteePercentage = totalHeld > 0 ? (totalAttended / totalHeld) * 100 : 0;
    const lastLoggedDate = lastLogByMentor.get(mentorId) || null;
    const missingWeeksFlag = !lastLoggedDate
      ? true
      : (Date.now() - new Date(lastLoggedDate).getTime()) / (1000 * 3600 * 24) > 7;

    return {
      mentorId: mentor._id,
      mentorName: mentor.name,
      mentorEmail: mentor.email,
      mentorMts: mentor.mtsNumber,
      mentorProfileImage: mentor.profileImage,
      department: mentor.department,
      hodName: hodByDepartment.get(normalizeDepartment(mentor.department)) || 'Unassigned',
      lastLoggedDate,
      isFlagged: missingWeeksFlag || (avgMenteePercentage > 0 && avgMenteePercentage < 75),
      missingWeeksFlag,
      avgMenteePercentage: Number(avgMenteePercentage.toFixed(2)),
      lowAttendanceCount: stats.lowAttendanceCount || 0,
      totalMentees: stats.totalMentees || 0
    };
  });

  lowAttendanceStudents.sort((a, b) => a.cumulativeAttendance - b.cumulativeAttendance);

  return {
    monitor,
    lowAttendanceStudents
  };
};

module.exports = {
  buildAttendanceOverview
};
