import api from './api';

export const getAllResources = async () => {
  const response = await api.get('/resources');
  return response.data;
};

export const createResource = async (resourceData) => {
  const response = await api.post('/resources', resourceData);
  return response.data;
};

export const updateResource = async (id, resourceData) => {
  const response = await api.put(`/resources/${id}`, resourceData);
  return response.data;
};

export const deleteResource = async (id) => {
  const response = await api.delete(`/resources/${id}`);
  return response.data;
};
