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

export const getMyProfile = async () => {
  const response = await api.get('/users/me');
  return response.data;
};

export const updateMyProfile = async (data) => {
  const response = await api.put('/users/me', data);
  return response.data;
};
