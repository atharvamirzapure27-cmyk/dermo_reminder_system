const express = require('express');
const cors = require('cors');
const { isProduction, port } = require('./config/appConfig');
const { scheduleReminderJob } = require('./cron/reminderCron');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const logStartup = (message) => {
  if (!isProduction) {
    console.log(message);
  }
};

app.use(cors());
app.use(express.json());

logStartup('Middleware loaded: CORS and express.json()');

const { authenticateToken, requireRole } = require('./middleware/authMiddleware');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const reportRoutes = require('./routes/reportRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

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

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/patients', authenticateToken, patientRoutes);
app.use('/appointments', authenticateToken, appointmentRoutes);
app.use('/reports', authenticateToken, requireRole(['super_admin', 'admin']), reportRoutes);
app.use('/analytics', authenticateToken, requireRole(['super_admin', 'admin']), analyticsRoutes);
app.use('/notifications', notificationRoutes);
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
