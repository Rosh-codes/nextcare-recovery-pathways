import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getAllUsers: () => api.get('/users'),
  deleteUser: (id) => api.delete(`/users/${id}`)
};

// Appointment API
export const appointmentAPI = {
  getAll: () => api.get('/appointments'),
  getAllAdmin: () => api.get('/appointments/admin/all'),
  getOne: (id) => api.get(`/appointments/${id}`),
  create: (data) => api.post('/appointments', data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  delete: (id) => api.delete(`/appointments/${id}`)
};

// Care Plan API
export const carePlanAPI = {
  getAll: () => api.get('/care-plans'),
  getOne: (id) => api.get(`/care-plans/${id}`),
  create: (data) => api.post('/care-plans', data),
  update: (id, data) => api.put(`/care-plans/${id}`, data),
  delete: (id) => api.delete(`/care-plans/${id}`)
};

// Health Resource API
export const healthResourceAPI = {
  getAll: (params) => api.get('/health-resources', { params }),
  getOne: (id) => api.get(`/health-resources/${id}`),
  create: (data) => api.post('/health-resources', data),
  update: (id, data) => api.put(`/health-resources/${id}`, data),
  delete: (id) => api.delete(`/health-resources/${id}`)
};

// Doctor API
export const doctorAPI = {
  getAll: (params) => api.get('/doctors', { params }),
  create: (data) => api.post('/doctors', data),
  update: (id, data) => api.put(`/doctors/${id}`, data),
  delete: (id) => api.delete(`/doctors/${id}`)
};

export default api;
