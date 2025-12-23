import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, 
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
  const pathname = window.location.pathname;
  if (pathname !== '/reset-password' && pathname !== '/forgot-password') {
    window.location.href = '/login';
  }
}
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/current-user'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

export const taskAPI = {
  getTasks: (params) => api.get('/tasks', { params }),
  getTask: (id) => api.get(`/tasks/${id}`),
  createTask: (taskData) => api.post('/tasks', taskData),
  updateTask: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
};

export const userAPI = {
  getUsers: () => api.get('/users'),
  getUser: (id) => api.get(`/users/${id}`),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

export const statsAPI = {
  getStats: () => api.get('/stats'),
};

export const constantsAPI = {
  getAll: () => api.get('/constants/app'),
  getTaskStatuses: () => api.get('/constants/task-statuses'),
  getEmptyMessages: () => api.get('/constants/empty-messages'),
  getPagination: () => api.get('/constants/pagination'),
};

export const loginUser = (email, password) => {
  return authAPI.login({ email, password });
};

export const registerUser = (name, email, password) => {
  return authAPI.register({ name, email, password });
};

export default api;