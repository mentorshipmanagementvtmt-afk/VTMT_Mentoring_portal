const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const dotenv = require('dotenv');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;

// Secret used to sign CSRF tokens (falls back to JWT_SECRET)
const CSRF_SECRET = process.env.CSRF_SECRET || process.env.JWT_SECRET || 'csrf-fallback-secret';

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

app.use(express.json());
app.use(cookieParser());

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com', 'blob:'],
      connectSrc: ["'self'", ...allowedOrigins, 'https://*.vercel.app']
    }
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', limiter);

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;

  const dbUrl = process.env.DATABASE_URL;
  await mongoose.connect(dbUrl, {
    family: 4,
    maxPoolSize: 20,
    minPoolSize: 5,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000
  });
  console.log('MongoDB connected successfully.');
};

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('DB connection error:', error.message);
    return res.status(500).json({ message: 'Database connection failed.', error: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('Mentoring Portal API is running!');
});

// -------------------------------------------------------
// Stateless CSRF protection (no cookies needed)
// -------------------------------------------------------
function generateCsrfToken() {
  const payload = crypto.randomBytes(32).toString('hex');
  const timestamp = Date.now().toString();
  const data = `${payload}.${timestamp}`;
  const signature = crypto.createHmac('sha256', CSRF_SECRET).update(data).digest('hex');
  return `${data}.${signature}`;
}

function verifyCsrfToken(token) {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [payload, timestamp, signature] = parts;
  const data = `${payload}.${timestamp}`;
  const expected = crypto.createHmac('sha256', CSRF_SECRET).update(data).digest('hex');

  // Timing-safe comparison
  if (signature.length !== expected.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

// CSRF token endpoint — returns a signed token (no cookie required)
app.get('/api/csrf-token', (req, res) => {
  const csrfToken = generateCsrfToken();
  res.json({ csrfToken });
});

// CSRF validation middleware for mutating requests
const csrfProtection = (req, res, next) => {
  const method = req.method.toUpperCase();
  // Skip CSRF check for safe/read-only methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return next();
  }

  const token = req.headers['csrf-token'] || req.headers['x-csrf-token'];
  if (!verifyCsrfToken(token)) {
    return res.status(403).json({ message: 'Invalid or missing CSRF token. Please refresh and try again.' });
  }
  next();
};

// Apply CSRF protection to all /api routes
app.use('/api', csrfProtection);

const userRoutes = require('./routes/user.routes.js');
const studentRoutes = require('./routes/student.routes.js');
const assessmentRoutes = require('./routes/assessment.routes.js');
const interventionRoutes = require('./routes/intervention.routes.js');
const academicLogRoutes = require('./routes/academicLog.routes.js');
const activityLogRoutes = require('./routes/activityLog.routes.js');
const analyticsRoutes = require('./routes/analytics.routes.js');
const attendanceRoutes = require('./routes/attendance.routes.js');
const examRecordRoutes = require('./routes/examRecord.routes.js');
const departmentRoutes = require('./routes/department.routes.js');

app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/interventions', interventionRoutes);
app.use('/api/academic-logs', academicLogRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/exam-records', examRecordRoutes);
app.use('/api/departments', departmentRoutes);

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  return res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

module.exports = app;
