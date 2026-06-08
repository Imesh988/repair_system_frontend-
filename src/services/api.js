import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor – token attach කිරීම පමණයි
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor – 401 error එක auto logout නොකරන්න
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // මෙතනදී token ඉවත් කිරීම හෝ redirect නොකරන්න
    // component level එකේදී handle කිරීමට ඉඩ දෙන්න
    return Promise.reject(error);
  }
);

export default api;