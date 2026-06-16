import api from './api';

// Token-based auth (Bearer) — CSRF cookie is not required
export const registerUser = async (data) => {
  const res = await api.post('/register', data);
  return res.data;
};

export const loginUser = async (data) => {
  const res = await api.post('/login', data);
  return res.data;
};