const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();
app.set('trust proxy', 1); // Trust first proxy to allow secure cookies over HTTPS in Vercel
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: [
    'https://veltech-mentoring-portal.vercel.app', 
    'http://localhost:3000', 
    'http://localhost:3001', 
    'http://localhost:3002', 
    'http://localhost:3003',
    process.env.FRONTEND_URL,
    process.env.ADMIN_URL,
    process.env.HOD_URL,
    process.env.MENTOR_URL
  ].filter(Boolean),
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Security Middlewares - Customized CSP for Ant Design + Cloudinary + Google Fonts
const allowedOrigins = corsOptions.origin;
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "blob:"],
      connectSrc: ["'self'", ...allowedOrigins],
    }
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cookieParser());

// Sanitize data to prevent NoSQL Inject & XSS
app.use(mongoSanitize());
app.use(xss());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', limiter);

// CSRF Protection
const csrfProtection = csrf({ 
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  } 
});
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
const attendanceRoutes = require('./routes/attendance.routes.js');

app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/interventions', interventionRoutes);
app.use('/api/academic-logs', academicLogRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/attendance', attendanceRoutes);

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  try {
    const dbUrl = process.env.DATABASE_URL;
    // family: 4 forces IPv4, bypassing the known Render/Node issue with DNS SRV lookups (ENOTFOUND)
    await mongoose.connect(dbUrl, { 
      family: 4,
      serverSelectionTimeoutMS: 5000 // fail fast in 5s if IP is blocked, instead of 30s
    });
    console.log('✅ MongoDB connected successfully!');
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    throw new Error('Database connection failed');
  }
};

// Ensure DB is connected for serverless function invocations
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Database connection failed. Ensure MongoDB Atlas IP Network Access allows Vercel.', error: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('Mentoring Portal API is running!');
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
}

// Export the Express API for Vercel Serverless Functions
module.exports = app;