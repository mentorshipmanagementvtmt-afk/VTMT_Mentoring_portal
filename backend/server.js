const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: ['https://veltech-mentoring-portal.vercel.app', 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Security Middlewares
app.use(helmet()); 
app.use(cookieParser());

// CSRF Protection
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

const userRoutes = require('./routes/user.routes.js');
const studentRoutes = require('./routes/student.routes.js');
const assessmentRoutes = require('./routes/assessment.routes.js');
const interventionRoutes = require('./routes/intervention.routes.js');
const academicLogRoutes = require('./routes/academicLog.routes.js');
const activityLogRoutes = require('./routes/activityLog.routes.js');
const analyticsRoutes = require('./routes/analytics.routes.js');

app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/interventions', interventionRoutes);
app.use('/api/academic-logs', academicLogRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/analytics', analyticsRoutes);

const connectDB = async () => {
  try {
    const dbUrl = process.env.DATABASE_URL;
    // family: 4 forces IPv4, bypassing the known Render/Node issue with DNS SRV lookups (ENOTFOUND)
    await mongoose.connect(dbUrl, { family: 4 });
    console.log('✅ MongoDB connected successfully!');
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

app.get('/', (req, res) => {
  res.send('Mentoring Portal API is running!');
});

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
};

startServer();