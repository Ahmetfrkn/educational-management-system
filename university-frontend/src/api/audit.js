import api from './api';

export const getAuditLogs = async () => {
  const response = await api.get('/logs');
  return response.data;
};