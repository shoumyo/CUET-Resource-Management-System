import api from './api';

export const createHold = async (bookingData) => {
  const response = await api.post('/bookings/hold', bookingData);
  return response.data;
};

export const submitBooking = async (bookingId, referenceTeacherId) => {
  const response = await api.put(`/bookings/${bookingId}/submit`, { referenceTeacherId });
  return response.data;
};

export const getMyBookings = async () => {
  const response = await api.get('/bookings/my');
  return response.data;
};

export const studentCancelBooking = async (bookingId) => {
  const response = await api.put(`/bookings/${bookingId}/cancel`);
  return response.data;
};

export const getBookingsForResourceOnDate = async (resourceId, date) => {
  const response = await api.get(`/bookings/resource/${resourceId}/date/${date}`);
  return response.data;
};

// Teacher endpoints
export const getPendingReferenceBookings = async () => {
  const response = await api.get('/bookings/pending-reference');
  return response.data;
};

export const teacherApprove = async (bookingId) => {
  const response = await api.put(`/bookings/${bookingId}/teacher-approve`);
  return response.data;
};

export const teacherReject = async (bookingId) => {
  const response = await api.put(`/bookings/${bookingId}/teacher-reject`);
  return response.data;
};

// Admin endpoints
export const getPendingAdminBookings = async () => {
  const response = await api.get('/bookings/pending-admin');
  return response.data;
};

export const getAllBookings = async () => {
  const response = await api.get('/bookings/all');
  return response.data;
};

export const adminApprove = async (bookingId) => {
  const response = await api.put(`/bookings/${bookingId}/admin-approve`);
  return response.data;
};

export const adminReject = async (bookingId) => {
  const response = await api.put(`/bookings/${bookingId}/admin-reject`);
  return response.data;
};

export const deleteBooking = async (bookingId) => {
  const response = await api.delete(`/bookings/${bookingId}`);
  return response.data;
};
