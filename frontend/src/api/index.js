import axios from 'axios';

const API_BASE_URL = 'http://localhost:8002/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const classApi = {
  getAll: () => api.get('/classes'),
  getById: (id) => api.get(`/classes/${id}`),
  create: (data) => api.post('/classes', data),
  cancel: (id, reason) => api.delete(`/classes/${id}`, { params: { reason } }),
};

export const userApi = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
};

export const coachApi = {
  getAll: () => api.get('/coaches'),
  setOnLeave: (id, leaveStart, leaveEnd) => 
    api.post(`/coaches/${id}/leave`, null, { params: { leaveStart, leaveEnd } }),
};

export const bookingApi = {
  getAll: () => api.get('/bookings'),
  getByUser: (userId) => api.get(`/bookings/user/${userId}`),
  getByClass: (classId) => api.get(`/bookings/class/${classId}`),
  book: (userId, classId) => api.post('/bookings', { userId, classId }),
  cancel: (id, reason) => api.delete(`/bookings/${id}`, { params: { reason } }),
};

export const checkInApi = {
  checkIn: (bookingId, method) => api.post('/checkin', { bookingId, method }),
  getByClass: (classId) => api.get(`/checkin/class/${classId}`),
};

export const waitlistApi = {
  getByClass: (classId) => api.get(`/waitlist/class/${classId}`),
};

export const noShowApi = {
  getAll: () => api.get('/noshow'),
  getByUser: (userId) => api.get(`/noshow/user/${userId}`),
};

export const settlementApi = {
  getAll: () => api.get('/settlements'),
  generate: (year, month) => 
    api.post('/settlements/generate', null, { params: { year, month } }),
  pay: (id) => api.post(`/settlements/${id}/pay`),
};

export const notificationApi = {
  getByUser: (userId) => api.get(`/notifications/user/${userId}`),
  markAsRead: (id) => api.post(`/notifications/${id}/read`),
  markAllAsRead: (userId) => api.post(`/notifications/user/${userId}/read-all`),
};

export const dashboardApi = {
  get: () => api.get('/dashboard'),
};

export default api;
