import api from './api';

export const getAllResources = async () => {
  const response = await api.get('/resources');
  return response.data;
};
