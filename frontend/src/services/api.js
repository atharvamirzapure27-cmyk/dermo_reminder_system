import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
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

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`, error.response?.data);
    return Promise.reject(error);
  }
);

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

export const rescheduleAppointment = async (id, newDate) => {
  const response = await api.put(`/appointments/${id}/reschedule`, {
    appointment_date: newDate,
  });
  return response.data;
};

export default api;

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
