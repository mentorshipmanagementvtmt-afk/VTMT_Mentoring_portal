const mongoose = require('mongoose');
const { Schema } = mongoose;

const EXAM_TYPES = [
  'CAT-1',
  'CAT-2',
  'Model Exam',
  'Model Practical',
  'End Semester Theory',
  'End Semester Practical'
];

const examRecordSchema = new Schema(
  {
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
    examType: {
      type: String,
      enum: EXAM_TYPES,
      required: true
    },
    marksObtained: {
      type: Number,
      default: 0,
      min: 0
    },
    maxMarks: {
      type: Number,
      default: 100,
      min: 1
    },
    attendancePercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    remarks: {
      type: String,
      default: ''
    },
    examDate: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

examRecordSchema.index({ studentId: 1, examType: 1 }, { unique: true });

module.exports = {
  ExamRecord: mongoose.model('ExamRecord', examRecordSchema),
  EXAM_TYPES
};
