import { api } from './client.js';

export const authApi = {
  signup: (payload) => api.post('/auth/signup', payload, { auth: false }),
  resendOtp: (pendingId) => api.post('/auth/resend-otp', { pendingId }, { auth: false }),
  verifyOtp: (pendingId, code) => api.post('/auth/verify-otp', { pendingId, code }, { auth: false }),
  profileSetup: (payload) => api.post('/auth/profile-setup', payload, { auth: false }),
  login: (payload) => api.post('/auth/login', payload, { auth: false }),
  guest: () => api.post('/auth/guest', {}, { auth: false }),
  me: () => api.get('/auth/me'),
};
