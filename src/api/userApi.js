import api from './api';

export const getTeachers = async () => {
  const response = await api.get('/users/teachers');
  return response.data;
};

export const getAllUsers = async () => {
  const response = await api.get('/users/all');
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};
