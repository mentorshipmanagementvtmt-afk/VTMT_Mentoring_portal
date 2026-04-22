const express = require('express');
const router = express.Router();

const Student = require('../models/student.model.js');
const User = require('../models/user.model.js');
const Assessment = require('../models/assessment.model.js');
const Intervention = require('../models/intervention.model.js');
const AcademicLog = require('../models/academicLog.model.js');
const ActivityLog = require('../models/activityLog.model.js');

const { protect, isHod, isAdminOrHod } = require('../middleware/auth.middleware.js');
const upload = require('../middleware/upload.middleware.js');
const { uploadImage, deleteImage } = require('../utils/cloudinary.js');


// -----------------------------------------------------------
// ROUTE 1: Create a new student (HOD ONLY)
// -----------------------------------------------------------
router.post('/', protect, isAdminOrHod, upload.single('profileImage'), async (req, res) => {
  try {
    const {
      name,
      registerNumber,
      vmNumber,
      batch,
      section,
      semester,
      mentorMtsNumber,
      personal,
      parents,
      addresses,
      contact,
      academics,
      health,
      achievements
    } = req.body;

    const department = req.user.role === 'admin' ? req.body.department : req.user.department;
    if (!department) return res.status(400).json({ message: 'Department is required.' });

    const mentor = await User.findOne({ mtsNumber: mentorMtsNumber });
    if (!mentor) {
      return res
        .status(404)
        .json({ message: `Mentor with MTS Number ${mentorMtsNumber} not found.` });
    }

    let profileImage = { url: '', publicId: '' };
    if (req.file) {
      const result = await uploadImage(req.file.buffer);
      profileImage = { url: result.secure_url, publicId: result.public_id };
    }

    // Since nested objects like 'personal' come as JSON string when using FormData, we might need to parse them.
    // Assuming the frontend will parse or send JSON.stringify for objects if it's formData.
    const parseIfString = (val) => typeof val === 'string' ? JSON.parse(val) : val;

    const newStudent = new Student({
      name,
      registerNumber,
      vmNumber,
      department,
      batch,
      section,
      semester,
      currentMentor: mentor._id,
      personal: personal ? parseIfString(personal) : {},
      parents: parents ? parseIfString(parents) : {},
      addresses: addresses ? parseIfString(addresses) : {},
      contact: contact ? parseIfString(contact) : {},
      academics: academics ? parseIfString(academics) : {},
      health: health ? parseIfString(health) : {},
      achievements: achievements ? parseIfString(achievements) : {},
      profileImage
    });

    const savedStudent = await newStudent.save();
    res.status(201).json(savedStudent);
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: 'Student with this Register Number or VM Number already exists.' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// -----------------------------------------------------------
// ROUTE 1.5: Get all students with optional filters (Admin/HOD)
// -----------------------------------------------------------
router.get('/', protect, isAdminOrHod, async (req, res) => {
  try {
    const { department, batch, section } = req.query;
    const user = req.user;
    
    let filter = {};
    
    // Role-based restrictions
    if (user.role === 'hod') {
      filter.department = user.department;
    } else if (user.role === 'admin' && department) {
      filter.department = department; // Admin can filter by any requested department
    }
    
    if (batch) filter.batch = batch;
    if (section) filter.section = section;

    const students = await Student.find(filter)
      .select('name registerNumber vmNumber department batch section currentMentor')
      .populate('currentMentor', 'name mtsNumber')
      .lean();
      
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching students', error: error.message });
  }
});

// -----------------------------------------------------------
// ROUTE 2: Get all students for logged-in mentor
// -----------------------------------------------------------
router.get('/my-mentees', protect, async (req, res) => {
  try {
    const mentorId = req.user._id;
    const mentees = await Student.find({ currentMentor: mentorId }).select(
      'name registerNumber vmNumber department batch section'
    ).lean();
    res.status(200).json(mentees);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// -----------------------------------------------------------
// ROUTE 3: Get all students for a specific mentor (HOD ONLY)
// -----------------------------------------------------------
router.get('/mentor/:mentorId', protect, isAdminOrHod, async (req, res) => {
  try {
    const { mentorId } = req.params;
    const mentees = await Student.find({ currentMentor: mentorId }).select(
      'name registerNumber vmNumber department batch section'
    ).lean();
    res.status(200).json(mentees);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// -----------------------------------------------------------
// ROUTE 4: Get full details for a single student
// -----------------------------------------------------------
router.get('/:studentId/details', protect, async (req, res) => {
  try {
    const { studentId } = req.params;
    const user = req.user;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    if (user.role !== 'admin' && user.role !== 'hod' && !student.currentMentor.equals(user._id)) {
      return res.status(403).json({ message: 'You are not authorized to view this student.' });
    }

    const [assessments, interventions] = await Promise.all([
      Assessment.find({ studentId }).sort({ academicYear: 1 }).lean(),
      Intervention.find({ studentId }).sort({ createdAt: -1 }).lean()
    ]);

    res.status(200).json({
      profile: student,
      assessments,
      interventions
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// -----------------------------------------------------------
// ROUTE 5: Update a student's profile (Mentor or HOD)
// -----------------------------------------------------------
router.put('/:studentId', protect, upload.single('profileImage'), async (req, res) => {
  try {
    const { studentId } = req.params;
    const user = req.user;
    const updateData = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    if (user.role !== 'admin' && user.role !== 'hod' && !student.currentMentor.equals(user._id)) {
      return res.status(403).json({ message: 'You are not authorized to update this student.' });
    }

    // Parse stringified JSON fields if using FormData
    const parseIfString = (val) => typeof val === 'string' ? JSON.parse(val) : val;
    ['personal', 'parents', 'addresses', 'contact', 'academics', 'health', 'achievements'].forEach(field => {
       if (updateData[field]) {
           updateData[field] = parseIfString(updateData[field]);
       }
    });

    if (req.file) {
      if (student.profileImage && student.profileImage.publicId) {
        await deleteImage(student.profileImage.publicId);
      }
      const result = await uploadImage(req.file.buffer);
      student.profileImage = { url: result.secure_url, publicId: result.public_id };
    } else if (updateData.removeImage === 'true') {
      if (student.profileImage && student.profileImage.publicId) {
        await deleteImage(student.profileImage.publicId);
      }
      student.profileImage = { url: '', publicId: '' };
    }

    delete updateData.removeImage; // Do not apply to Object.assign
    
    // Protect certain fields from being updated directly by arbitrary requests if necessary
    // Example: currentMentor, department shouldn't be updated here usually, but doing Object.assign is easiest.
    Object.assign(student, updateData);

    const updatedStudent = await student.save();
    res.status(200).json(updatedStudent);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Student with this Register Number or VM Number already exists.' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  } 

});

// -----------------------------------------------------------
// ROUTE 6: Re-assign a new mentor to a student (HOD ONLY)
// -----------------------------------------------------------
router.put('/:studentId/assign-mentor', protect, isAdminOrHod, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { newMentorId } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    const newMentor = await User.findById(newMentorId);
    if (!newMentor || newMentor.role !== 'mentor') {
      return res
        .status(404)
        .json({ message: 'New mentor not found or user is not a mentor.' });
    }

    if (req.user.role === 'hod' && (
      newMentor.department !== req.user.department ||
      student.department !== req.user.department
    )) {
      return res
        .status(403)
        .json({ message: 'You can only assign mentors within your own department.' });
    }

    student.currentMentor = newMentorId;
    await student.save();

    res.status(200).json({ message: 'Mentor successfully reassigned.', student });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// -----------------------------------------------------------
// ROUTE 6.4: Assign mentor to a specific list of students (HOD/Admin)
// -----------------------------------------------------------
router.put('/assign-mentor-bulk-list', protect, isAdminOrHod, async (req, res) => {
  try {
    const { studentIds, newMentorId } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ message: 'studentIds array is required and must not be empty.' });
    }
    if (!newMentorId) {
      return res.status(400).json({ message: 'newMentorId is required.' });
    }

    const newMentor = await User.findById(newMentorId);
    if (!newMentor || newMentor.role !== 'mentor') {
      return res.status(404).json({ message: 'Mentor not found or user is not a mentor.' });
    }

    // HOD: mentor must be in the same department
    if (req.user.role === 'hod' && newMentor.department !== req.user.department) {
      return res.status(403).json({ message: 'You can only assign mentors within your own department.' });
    }

    // HOD: students must belong to their department
    if (req.user.role === 'hod') {
      const studentsOutside = await Student.countDocuments({
        _id: { $in: studentIds },
        department: { $ne: req.user.department }
      });
      if (studentsOutside > 0) {
        return res.status(403).json({ message: 'Some selected students do not belong to your department.' });
      }
    }

    const result = await Student.updateMany(
      { _id: { $in: studentIds } },
      { $set: { currentMentor: newMentorId } }
    );

    res.status(200).json({
      message: `Successfully assigned ${result.modifiedCount} student(s) to ${newMentor.name}.`
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// -----------------------------------------------------------
// ROUTE 6.5: Bulk Re-assign students to a new mentor (HOD ONLY)
// -----------------------------------------------------------
router.put('/reassign-mentor-bulk', protect, isAdminOrHod, async (req, res) => {
  try {
    const { oldMentorId, newMentorId } = req.body;
    
    if (!oldMentorId || !newMentorId) {
      return res.status(400).json({ message: 'Both oldMentorId and newMentorId are required.' });
    }

    const newMentor = await User.findById(newMentorId);
    if (!newMentor || newMentor.role !== 'mentor') {
      return res.status(404).json({ message: 'New mentor not found or user is not a mentor.' });
    }

    if (req.user.role === 'hod' && newMentor.department !== req.user.department) {
      return res.status(403).json({ message: 'You can only assign mentees to mentors within your own department.' });
    }

    // Optional: verification that oldMentorId is in the same department
    if (req.user.role === 'hod') {
      const oldMentor = await User.findById(oldMentorId);
      if (oldMentor && oldMentor.department !== req.user.department) {
        return res.status(403).json({ message: 'Cannot reassign students from a mentor outside your department.' });
      }
    }

    await Student.updateMany(
      { currentMentor: oldMentorId },
      { $set: { currentMentor: newMentorId } }
    );

    res.status(200).json({ message: 'Students successfully reassigned to the new mentor.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// -----------------------------------------------------------
// ROUTE 6: Delete a student  (HOD = full power, Mentor = own mentee)
// -----------------------------------------------------------
router.delete('/:studentId', protect, async (req, res) => {
  try {
    const { studentId } = req.params;
    const user = req.user;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    // 🔹 HOD & Admin: can delete ANY student
    if (user.role === 'hod' || user.role === 'admin') {
      // no extra restriction
    }
    // 🔹 Mentor: only their own mentee
    else if (user.role === 'mentor') {
      if (!student.currentMentor.equals(user._id)) {
        return res
          .status(403)
          .json({ message: 'You are not authorized to delete this student.' });
      }
    } else {
      return res.status(403).json({ message: 'Only Admin, HOD, or Mentor can delete a student.' });
    }

    // Delete all associated records for this student
    await Promise.all([
      Assessment.deleteMany({ studentId }),
      Intervention.deleteMany({ studentId }),
      AcademicLog.deleteMany({ studentId }),
      ActivityLog.deleteMany({ studentId })
    ]);

    if (student.profileImage && student.profileImage.publicId) {
      await deleteImage(student.profileImage.publicId);
    }

    await Student.findByIdAndDelete(studentId);

    return res.status(200).json({ message: 'Student deleted successfully.' });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Server error while deleting student.', error: error.message });
  }
});

module.exports = router;
