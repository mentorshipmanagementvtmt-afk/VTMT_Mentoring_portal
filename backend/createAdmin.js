const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const User = require('./models/user.model.js');

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL || process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      console.log('Admin already exists:', adminExists.email);
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@veltech.edu.in',
      password: hashedPassword,
      mtsNumber: 'ADMIN001',
      department: 'Administration',
      designation: 'Administrator',
      role: 'admin'
    });

    console.log('Admin created successfully:', admin.email);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();