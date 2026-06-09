import api from './api';

export const getTeachers = async () => {
  const response = await api.get('/users/teachers');
  return response.data;
};
