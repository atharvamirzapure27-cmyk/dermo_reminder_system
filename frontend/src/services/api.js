import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging & attaching JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    if (import.meta.env.DEV) {
      console.log(`📡 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging & clearing session on 401
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth-expired'));
    }
    console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`, error.response?.data);
    return Promise.reject(error);
  }
);

// Authentication APIs
export const login = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Patient APIs
export const getPatients = async () => {
  const response = await api.get('/patients');
  return response.data;
};

export const createPatient = async (patientData) => {
  const response = await api.post('/patients', patientData);
  return response.data;
};

// Get patient appointment history
export const getPatientHistory = async (patientId) => {
  const response = await api.get(`/patients/${patientId}/history`);
  return response.data;
};

// Appointment APIs
export const getAppointments = async () => {
  const response = await api.get('/appointments');
  return response.data;
};

export const createAppointment = async (appointmentData) => {
  const response = await api.post('/appointments', appointmentData);
  return response.data;
};

export const markVisited = async (id) => {
  const response = await api.put(`/appointments/${id}/visited`);
  return response.data;
};

export const markMissed = async (id) => {
  const response = await api.put(`/appointments/${id}/missed`);
  return response.data;
};

export const cancelAppointment = async (id) => {
  const response = await api.put(`/appointments/${id}/cancel`);
  return response.data;
};

export const rescheduleAppointment = async (id, newDate, newTime) => {
  const response = await api.put(`/appointments/${id}/reschedule`, {
    appointment_date: newDate,
    appointment_time: newTime,
  });
  return response.data;
};

// User Administration APIs (Super Admin only)
export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

export const createUser = async (userData) => {
  const response = await api.post('/users', userData);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

// Audit Log APIs (Admin/Super Admin only)
export const getAuditLogs = async (limit = 100) => {
  const response = await api.get('/users/audit-logs', { params: { limit } });
  return response.data;
};

// Notification Settings APIs (Admin/Super Admin only)
export const getNotificationSettings = async () => {
  const response = await api.get('/settings/notifications');
  return response.data;
};

export const updateNotificationSettings = async (settingsData) => {
  const response = await api.put('/settings/notifications', settingsData);
  return response.data;
};

// Notification Tracking APIs (Admin/Super Admin only)
export const getNotificationsHistory = async (params = {}) => {
  const queryParams = typeof params === 'number' ? { page: params, limit: 50 } : params;
  const response = await api.get('/notifications/history', { params: queryParams });
  return response.data;
};

export const retryNotification = async (id) => {
  const response = await api.post(`/notifications/${id}/retry`);
  return response.data;
};

export const triggerNotificationTest = async (appointmentId) => {
  const response = await api.post('/notifications/test', { appointment_id: appointmentId });
  return response.data;
};

export const getSchedulerStatus = async () => {
  const response = await api.get('/notifications/scheduler-status');
  return response.data;
};

// Analytics and Reporting APIs
export const getDashboardAnalytics = async () => {
  const response = await api.get('/analytics/dashboard');
  return response.data;
};

export const getReport = async (type) => {
  const response = await api.get(`/reports/${type}`);
  return response.data;
};

export const getReportExportUrl = (type, format) => `${API_URL}/reports/${type}/export/${format}`;

export default api;
