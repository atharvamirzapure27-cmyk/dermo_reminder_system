const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { isProduction, port } = require('./config/appConfig');
const { scheduleReminderJob } = require('./cron/reminderCron');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const logStartup = (message) => {
  if (!isProduction) {
    console.log(message);
  }
};

app.use(helmet());

const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) 
  : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || !isProduction) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes'
  }
});

logStartup('Middleware loaded: Helmet, CORS, express.json() and Rate Limiting');

const { authenticateToken, requireRole } = require('./middleware/authMiddleware');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const reportRoutes = require('./routes/reportRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Dermo Reminder System API is running',
    endpoints: {
      auth: {
        login: 'POST /auth/login',
        logout: 'POST /auth/logout',
        me: 'GET /auth/me'
      },
      users: {
        get: 'GET /users',
        create: 'POST /users',
        delete: 'DELETE /users/:id',
        auditLogs: 'GET /users/audit-logs'
      },
      patients: {
        get: 'GET /patients',
        create: 'POST /patients'
      },
      appointments: {
        get: 'GET /appointments',
        create: 'POST /appointments',
        markVisited: 'PUT /appointments/:id/visited',
        reschedule: 'PUT /appointments/:id/reschedule'
      },
      reports: {
        get: 'GET /reports/:type',
        export: 'GET /reports/:type/export/:format'
      },
      analytics: {
        dashboard: 'GET /analytics/dashboard'
      }
    }
  });
});

app.use('/auth', authLimiter, authRoutes);
app.use('/users', authLimiter, userRoutes);
app.use('/patients', authenticateToken, patientRoutes);
app.use('/appointments', authenticateToken, appointmentRoutes);
app.use('/reports', authenticateToken, requireRole(['super_admin', 'admin']), reportRoutes);
app.use('/analytics', authenticateToken, requireRole(['super_admin', 'admin']), analyticsRoutes);
app.use('/notifications', notificationRoutes);
app.use('/settings', settingsRoutes);
logStartup('Routes mounted successfully');

scheduleReminderJob(logStartup);

app.use(errorHandler);

const server = app.listen(port, () => {
  console.log(`Server started on port ${port}`);
  console.log(`API available at: http://localhost:${port}`);
});

server.on('error', (error) => {
  console.error('Server startup failed:', error.message);
  process.exit(1);
});
