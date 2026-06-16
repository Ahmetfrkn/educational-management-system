import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  // If you only use Token (Bearer), you can turn off withCredentials
  // withCredentials: true, 
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

// REQUEST INTERCEPTOR
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // Always add the updated token to the header
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;