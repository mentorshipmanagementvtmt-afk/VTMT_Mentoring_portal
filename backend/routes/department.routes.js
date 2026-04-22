const express = require('express');
const router = express.Router();

const Department = require('../models/department.model.js');
const User = require('../models/user.model.js');
const Student = require('../models/student.model.js');
const { protect, isAdmin } = require('../middleware/auth.middleware.js');
const {
  buildDepartmentCode,
  buildDepartmentLeaderboard,
  getDepartmentDashboard,
  normalizeDepartmentName
} = require('../utils/departmentAnalytics.js');

const departmentExistsInData = async (name) => {
  const normalizedName = normalizeDepartmentName(name);
  const [departmentDoc, userCount, studentCount] = await Promise.all([
    Department.findOne({ name: normalizedName }).lean(),
    User.countDocuments({ department: normalizedName }),
    Student.countDocuments({ department: normalizedName })
  ]);

  return Boolean(departmentDoc || userCount || studentCount);
};

const assignHodToDepartment = async (departmentName, hodId, currentDepartmentId = null) => {
  if (!hodId) return null;

  const normalizedDepartment = normalizeDepartmentName(departmentName);
  const hod = await User.findOne({ _id: hodId, role: 'hod' });
  if (!hod) {
    throw new Error('Selected HOD was not found.');
  }

  const conflictingHod = await User.findOne({
    role: 'hod',
    department: normalizedDepartment,
    _id: { $ne: hodId }
  }).lean();

  if (conflictingHod) {
    throw new Error(`Department ${normalizedDepartment} is already assigned to ${conflictingHod.name}.`);
  }

  const previousDepartment = hod.department;
  hod.department = normalizedDepartment;
  await hod.save();

  if (previousDepartment && previousDepartment !== normalizedDepartment) {
    await Department.updateOne(
      { name: previousDepartment, ...(currentDepartmentId ? { _id: { $ne: currentDepartmentId } } : {}) },
      { $set: { hodId: null } }
    );
  }

  return hod;
};

router.get('/', protect, async (_req, res) => {
  try {
    const leaderboard = await buildDepartmentLeaderboard();
    res.status(200).json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load departments.', error: error.message });
  }
});

router.get('/name/:deptName', protect, async (req, res) => {
  try {
    const departmentName = normalizeDepartmentName(req.params.deptName);
    if (!departmentName) {
      return res.status(400).json({ message: 'Department name is required.' });
    }

    const exists = await departmentExistsInData(departmentName);
    if (!exists) {
      return res.status(404).json({ message: 'Department not found.' });
    }

    const dashboard = await getDepartmentDashboard(departmentName);
    res.status(200).json(dashboard);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load department details.', error: error.message });
  }
});

router.post('/', protect, isAdmin, async (req, res) => {
  try {
    const name = normalizeDepartmentName(req.body?.name);
    const code = String(req.body?.code || buildDepartmentCode(name)).trim().toUpperCase();
    const description = String(req.body?.description || '').trim();
    const hodId = req.body?.hodId || null;

    if (!name) {
      return res.status(400).json({ message: 'Department name is required.' });
    }

    if (await departmentExistsInData(name)) {
      return res.status(400).json({ message: 'Department already exists.' });
    }

    if (await Department.findOne({ code }).lean()) {
      return res.status(400).json({ message: 'Department code already exists.' });
    }

    const department = await Department.create({
      name,
      code,
      description,
      hodId: null
    });

    if (hodId) {
      const assignedHod = await assignHodToDepartment(name, hodId, department._id);
      department.hodId = assignedHod._id;
      await department.save();
    }

    const dashboard = await getDepartmentDashboard(name);
    res.status(201).json(dashboard);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to create department.' });
  }
});

router.put('/name/:deptName', protect, isAdmin, async (req, res) => {
  try {
    const sourceName = normalizeDepartmentName(req.params.deptName);
    const nextName = normalizeDepartmentName(req.body?.name || sourceName);
    const code = String(req.body?.code || buildDepartmentCode(nextName)).trim().toUpperCase();
    const description = req.body?.description;
    const hodId = req.body?.hodId;

    if (!sourceName || !nextName) {
      return res.status(400).json({ message: 'Department name is required.' });
    }

    const sourceExists = await departmentExistsInData(sourceName);
    if (!sourceExists) {
      return res.status(404).json({ message: 'Department not found.' });
    }

    const conflictingDepartment = sourceName !== nextName
      ? await Department.findOne({ name: nextName }).lean()
      : null;
    if (sourceName !== nextName && conflictingDepartment) {
      return res.status(400).json({ message: 'Another department with this name already exists.' });
    }

    const conflictingCode = await Department.findOne({
      code,
      ...(sourceName ? { name: { $ne: sourceName } } : {})
    }).lean();
    if (conflictingCode) {
      return res.status(400).json({ message: 'Another department with this code already exists.' });
    }

    let department = await Department.findOne({ name: sourceName });
    if (!department) {
      department = new Department({
        name: sourceName,
        code: buildDepartmentCode(sourceName),
        description: '',
        hodId: null
      });
    }

    if (sourceName !== nextName) {
      await Promise.all([
        User.updateMany({ department: sourceName }, { $set: { department: nextName } }),
        Student.updateMany({ department: sourceName }, { $set: { department: nextName } })
      ]);
      department.name = nextName;
    }

    department.code = code;
    if (description !== undefined) {
      department.description = String(description || '').trim();
    }

    if (hodId) {
      const assignedHod = await assignHodToDepartment(nextName, hodId, department._id);
      department.hodId = assignedHod._id;
    }

    await department.save();

    const dashboard = await getDepartmentDashboard(nextName);
    res.status(200).json(dashboard);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to update department.' });
  }
});

module.exports = router;
