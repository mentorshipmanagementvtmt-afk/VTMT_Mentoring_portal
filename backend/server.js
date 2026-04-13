const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const dotenv = require('dotenv');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;

// --------------------------------------------------
// 1. CORS
// --------------------------------------------------
const allowedOrigins = [
  'https://veltech-mentoring-portal.vercel.app', 
  'http://localhost:3000', 
  'http://localhost:3001', 
  'http://localhost:3002', 
  'http://localhost:3003',
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
  process.env.HOD_URL,
  process.env.MENTOR_URL
].filter(Boolean);

const allowedOriginSet = new Set(allowedOrigins);
const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  try {
    const { protocol, hostname } = new URL(origin);
    if (protocol !== 'https:' && protocol !== 'http:') {
      return false;
    }

    if (allowedOriginSet.has(origin)) {
      return true;
    }

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return true;
    }

    return hostname.endsWith('.vercel.app');
  } catch (error) {
    return false;
  }
};

app.use(cors({
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// --------------------------------------------------
// 2. Body Parsing + Cookie Parsing
// --------------------------------------------------
app.use(express.json());
app.use(cookieParser());

// --------------------------------------------------
// 3. Security Middlewares
// --------------------------------------------------
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "blob:"],
      connectSrc: ["'self'", ...allowedOrigins, "https://*.vercel.app"],
    }
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate Limiting: 300 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', limiter);

// --------------------------------------------------
// 4. Database Connection (MUST be before routes)
// --------------------------------------------------
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  const dbUrl = process.env.DATABASE_URL;
  await mongoose.connect(dbUrl, { 
    family: 4,
    serverSelectionTimeoutMS: 5000
  });
  console.log('✅ MongoDB connected successfully!');
};

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('❌ DB connection error:', error.message);
    return res.status(500).json({ message: 'Database connection failed.', error: error.message });
  }
});

// --------------------------------------------------
// 5. Health Check (before CSRF so it always works)
// --------------------------------------------------
app.get('/', (req, res) => {
  res.send('Mentoring Portal API is running!');
});

// --------------------------------------------------
// 6. CSRF Protection (after cookie-parser, before API routes)
// --------------------------------------------------
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

// --------------------------------------------------
// 7. API Routes
// --------------------------------------------------
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

// --------------------------------------------------
// 8. Global Error Handler (catches unhandled crashes)
// --------------------------------------------------
app.use((err, req, res, next) => {
  console.error('💥 Unhandled Error:', err.message);
  // CSRF token errors
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({ message: 'Invalid or missing CSRF token. Please refresh and try again.' });
  }
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

// --------------------------------------------------
// 9. Start Server (local dev only)
// --------------------------------------------------
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
}

// Export the Express API for Vercel Serverless Functions
module.exports = app;
