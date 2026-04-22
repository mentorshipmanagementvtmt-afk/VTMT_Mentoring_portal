const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const User = require('./models/user.model');

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('Connected to MongoDB');

        const email = 'ranjikutti790@gmail.com';
        const password = 'password123'; // Default password
        const mtsNumber = 'ADMIN01';

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('User already exists');
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name: 'Ranjith (Admin)',
            email: email,
            password: hashedPassword,
            mtsNumber: mtsNumber,
            designation: 'HOD',
            department: 'CSE',
            role: 'hod'
        });

        await newUser.save();
        console.log(`User created successfully!`);
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log(`Role: hod`);

        process.exit(0);
    } catch (error) {
        console.error('Error creating user:', error);
        process.exit(1);
    }
};

createAdmin();
