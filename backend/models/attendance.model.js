const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const weeklyAttendanceSchema = new Schema({
    studentId: {
        type: Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    mentorId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    weekStartDate: {
        type: Date,
        required: true
    },
    classesHeld: {
        type: Number,
        required: true,
        min: 0
    },
    classesAttended: {
        type: Number,
        required: true,
        min: 0
    },
    percentage: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Ensure a mentor can only submit one attendance record per student per week
weeklyAttendanceSchema.index({ studentId: 1, weekStartDate: 1 }, { unique: true });
weeklyAttendanceSchema.index({ mentorId: 1, createdAt: -1 });

const WeeklyAttendance = mongoose.model('WeeklyAttendance', weeklyAttendanceSchema);
module.exports = WeeklyAttendance;
