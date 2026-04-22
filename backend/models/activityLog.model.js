const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const activityLogSchema = new Schema(
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

    semester: {
      type: String,
      required: true
    },

    slNo: {
      type: Number,
      required: false
    },

    date: {
      type: Date,
      required: true
    },

    category: {
      type: String,
      enum: [
        'Conference',
        'Journal Publication',
        'Book Publication',
        'Patent',
        'Research Proposal',
        'Mini Project',
        'Workshop',
        'Industrial Visit',
        'Inplant Training',
        'Culturals',
        'Sports',
        'NPTEL Program',
        'External Event',
        'Internal Event',
        'Major Certification'
      ],
      required: true
    },

    // Auto-filled based on category group
    categoryGroup: {
      type: String,
      enum: ['Co-Curricular', 'Extra-Curricular'],
      default: ''
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    notes: {
      type: String,
      default: ''
    },

    studentName: {
      type: String,
      default: ''
    },

    score: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

activityLogSchema.index({ studentId: 1, semester: 1, slNo: 1, date: 1, createdAt: 1 });
activityLogSchema.index({ categoryGroup: 1 });

// Pre-save hook for auto-filling fields
activityLogSchema.pre('save', async function (next) {
  try {
    // Auto-fill student name if missing
    if (!this.studentName) {
      const Student = mongoose.model('Student');
      const student = await Student.findById(this.studentId).select('name');
      if (student) {
        this.studentName = student.name;
      }
    }

    // Auto-assign category group
    const coCurricular = [
      'Conference',
      'Journal Publication',
      'Book Publication',
      'Patent',
      'Research Proposal',
      'Mini Project',
      'Workshop',
      'Industrial Visit',
      'Inplant Training',
      'NPTEL Program',
      'Major Certification'
    ];

    const extraCurricular = ['Culturals', 'Sports', 'External Event', 'Internal Event'];

    if (coCurricular.includes(this.category)) {
      this.categoryGroup = 'Co-Curricular';
    } else if (extraCurricular.includes(this.category)) {
      this.categoryGroup = 'Extra-Curricular';
    }

    // Assign Score based on category
    const pointValues = {
      'Patent': 100,
      'Journal Publication': 75,
      'NPTEL Program': 50,
      'Conference': 50,
      'Major Certification': 40,
      'External Event': 20,
      'Workshop': 20,
      'Book Publication': 20,
      'Research Proposal': 20,
      'Mini Project': 20,
      'Internal Event': 10,
      'Culturals': 10,
      'Sports': 10,
      'Industrial Visit': 10,
      'Inplant Training': 10
    };

    if (this.category && pointValues[this.category]) {
      this.score = pointValues[this.category];
    } else {
      this.score = 0; // Default fallback
    }

    // Auto-increment slNo per semester
    if (!this.slNo) {
      const ActivityLog = mongoose.model('ActivityLog');
      const count = await ActivityLog.countDocuments({
        studentId: this.studentId,
        semester: this.semester
      });
      this.slNo = count + 1;
    }
  } catch (err) {
    // Avoid breaking if any fetch fails
  }

  next();
});

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;
