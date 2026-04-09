const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user.model.js');
const Student = require('../models/student.model.js');

const { protect, isHod, isAdmin, isAdminOrHod } = require('../middleware/auth.middleware.js');
const upload = require('../middleware/upload.middleware.js');
const { uploadImage, deleteImage } = require('../utils/cloudinary.js');

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, mtsNumber, designation, department, role } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { mtsNumber }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or MTS Number already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      mtsNumber,
      designation,
      department,
      role
    });

    const savedUser = await newUser.save();

    res.status(201).json({
      _id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password.' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Must be lax or none for cross-port requests locally
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  res.status(200).json({ message: 'Logged out successfully' });
});

router.get('/mentors', protect, isAdminOrHod, async (req, res) => {
  try {
    let query = { role: 'mentor' };
    if (req.user.role === 'hod') {
      query.department = req.user.department;
    } else if (req.query.department) {
      query.department = req.query.department;
    }

    const mentors = await User.find(query)
      .select('name email mtsNumber designation department profileImage')
      .sort({ name: 1 });

    res.status(200).json(mentors);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/create-mentor', protect, isAdminOrHod, upload.single('profileImage'), async (req, res) => {
  try {
    const { name, email, password, mtsNumber, designation, department: bodyDept } = req.body;
    const department = req.user.role === 'admin' ? bodyDept : req.user.department;
    
    if (!department) return res.status(400).json({ message: 'Department is required.' });

    const existingUser = await User.findOne({ $or: [{ email }, { mtsNumber }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or MTS Number already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let profileImage = { url: '', publicId: '' };
    if (req.file) {
      const result = await uploadImage(req.file.buffer);
      profileImage = { url: result.secure_url, publicId: result.public_id };
    }

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      mtsNumber,
      designation,
      department,
      role: 'mentor',
      profileImage
    });

    const savedUser = await newUser.save();

    res.status(201).json({
      _id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      mtsNumber: savedUser.mtsNumber,
      designation: savedUser.designation,
      profileImage: savedUser.profileImage
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/mentor/:mentorId', protect, isAdminOrHod, async (req, res) => {
  try {
    const { mentorId } = req.params;

    const mentees = await Student.find({ currentMentor: mentorId });
    if (mentees.length > 0) {
      // Unassign the mentor from all students
      await Student.updateMany(
        { currentMentor: mentorId },
        { $unset: { currentMentor: "" } }
      );
    }

    const mentor = await User.findById(mentorId);
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found.' });
    }

    if (req.user.role === 'hod' && mentor.department !== req.user.department) {
      return res.status(403).json({ message: 'You can only delete mentors within your own department.' });
    }

    if (mentor.profileImage && mentor.profileImage.publicId) {
      await deleteImage(mentor.profileImage.publicId);
    }

    await User.findByIdAndDelete(mentorId);

    res.status(200).json({ message: 'Mentor deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/mentor/:mentorId', protect, isAdminOrHod, async (req, res) => {
  try {
    const { mentorId } = req.params;

    let query = { _id: mentorId, role: 'mentor' };
    if (req.user.role === 'hod') {
      query.department = req.user.department;
    }

    const mentor = await User.findOne(query).select('name email mtsNumber designation department profileImage');

    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found.' });
    }

    res.status(200).json(mentor);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// -----------------------------------------------------------
// Update a mentor's profile (HOD or Admin)
// -----------------------------------------------------------
router.put('/mentor/:mentorId', protect, isAdminOrHod, upload.single('profileImage'), async (req, res) => {
  try {
    const { mentorId } = req.params;
    const mentor = await User.findOne({ _id: mentorId, role: 'mentor' });
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found.' });
    }

    // HOD can only edit mentors in their own department
    if (req.user.role === 'hod' && mentor.department !== req.user.department) {
      return res.status(403).json({ message: 'You can only edit mentors within your own department.' });
    }

    const { name, email, mtsNumber, designation, password } = req.body;

    // Check for duplicate email/mtsNumber
    if (email || mtsNumber) {
      const conflict = await User.findOne({
        $or: [
          ...(email ? [{ email }] : []),
          ...(mtsNumber ? [{ mtsNumber }] : [])
        ],
        _id: { $ne: mentorId }
      });
      if (conflict) {
        return res.status(400).json({ message: 'Another user with this email or MTS Number already exists.' });
      }
    }

    if (name) mentor.name = name;
    if (email) mentor.email = email;
    if (mtsNumber) mentor.mtsNumber = mtsNumber;
    if (designation) mentor.designation = designation;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      mentor.password = await bcrypt.hash(password, salt);
    }

    if (req.file) {
      if (mentor.profileImage && mentor.profileImage.publicId) {
        await deleteImage(mentor.profileImage.publicId);
      }
      const result = await uploadImage(req.file.buffer);
      mentor.profileImage = { url: result.secure_url, publicId: result.public_id };
    } else if (req.body.removeImage === 'true') {
      if (mentor.profileImage && mentor.profileImage.publicId) {
        await deleteImage(mentor.profileImage.publicId);
      }
      mentor.profileImage = { url: '', publicId: '' };
    }

    const updated = await mentor.save();

    res.status(200).json({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      mtsNumber: updated.mtsNumber,
      designation: updated.designation,
      profileImage: updated.profileImage,
      department: updated.department,
      role: updated.role
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


router.get('/hods', protect, isAdmin, async (req, res) => {
  try {
    const hods = await User.find({ role: 'hod' }).select('-password');
    res.status(200).json(hods);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
router.get('/hod-by-department', protect, isAdminOrHod, async (req, res) => {
  try {
    const deptName = req.query.department;
    if (!deptName) return res.status(400).json({ message: 'Department query parameter is required.' });
    
    if (req.user.role === 'hod' && req.user.department !== deptName) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const hod = await User.findOne({ role: 'hod', department: deptName }).select('-password');
    if (!hod) return res.status(404).json({ message: 'HOD not found for this department' });

    res.status(200).json(hod);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/hods', protect, isAdmin, upload.single('profileImage'), async (req, res) => {
  try {
    const { name, email, password, mtsNumber, department, designation } = req.body;

    const existingHod = await User.findOne({ department, role: 'hod' });
    if (existingHod) {
      return res.status(400).json({ message: 'HOD already exists for this department.' });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { mtsNumber }]
    });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or MTS Number already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let profileImage = { url: '', publicId: '' };
    if (req.file) {
      const result = await uploadImage(req.file.buffer);
      profileImage = { url: result.secure_url, publicId: result.public_id };
    }

    const hod = await User.create({
      name,
      email,
      password: hashedPassword,
      mtsNumber,
      department,
      designation,
      role: 'hod',
      profileImage
    });

    res.status(201).json({
      _id: hod._id,
      name: hod.name,
      email: hod.email,
      mtsNumber: hod.mtsNumber,
      department: hod.department,
      designation: hod.designation,
      role: hod.role,
      profileImage: hod.profileImage
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/hods/:hodId', protect, isAdmin, async (req, res) => {
  try {
    const { hodId } = req.params;

    const hod = await User.findOne({ _id: hodId, role: 'hod' });
    if (!hod) {
      return res.status(404).json({ message: 'HOD not found.' });
    }

    if (hod.profileImage && hod.profileImage.publicId) {
      await deleteImage(hod.profileImage.publicId);
    }

    await User.deleteOne({ _id: hodId });

    res.status(200).json({ message: 'HOD deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/hods/reassign', protect, isAdmin, async (req, res) => {
  try {
    const { oldDepartment, newDepartment } = req.body;
    if (!oldDepartment || !newDepartment) {
      return res.status(400).json({ message: 'Both oldDepartment and newDepartment are required.' });
    }

    // Reassign all mentors from oldDepartment to newDepartment
    await User.updateMany(
      { role: 'mentor', department: oldDepartment },
      { $set: { department: newDepartment } }
    );

    // Reassign all students from oldDepartment to newDepartment
    await Student.updateMany(
      { department: oldDepartment },
      { $set: { department: newDepartment } }
    );

    res.status(200).json({ message: 'Mentors and students successfully reassigned to the new department.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/profile', protect, upload.single('profileImage'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const { name, email, mtsNumber, designation, password } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { mtsNumber }],
      _id: { $ne: req.user._id }
    });
    if (existingUser) {
      return res.status(400).json({ message: 'Another user with this email or MTS Number already exists.' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (mtsNumber) user.mtsNumber = mtsNumber;
    if (designation) user.designation = designation;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    if (req.file) {
      if (user.profileImage && user.profileImage.publicId) {
        await deleteImage(user.profileImage.publicId);
      }
      const result = await uploadImage(req.file.buffer);
      user.profileImage = { url: result.secure_url, publicId: result.public_id };
    } else if (req.body.removeImage === 'true') {
      if (user.profileImage && user.profileImage.publicId) {
        await deleteImage(user.profileImage.publicId);
      }
      user.profileImage = { url: '', publicId: '' };
    }

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      mtsNumber: updatedUser.mtsNumber,
      designation: updatedUser.designation,
      profileImage: updatedUser.profileImage,
      department: updatedUser.department,
      role: updatedUser.role
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
