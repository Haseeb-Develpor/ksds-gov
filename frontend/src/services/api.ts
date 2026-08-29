import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  sendOtp: (phone: string, purpose: 'login' | 'reset' = 'login') =>
    api.post('/auth/otp/send', { phone, purpose }),
  verifyOtp: (data: { phone: string; code: string; purpose?: 'login' | 'reset'; newPassword?: string }) =>
    api.post('/auth/otp/verify', data),
  me: () => api.get('/auth/me'),
  idTypes: () => api.get('/auth/id-types'),
  uploadKyc: (data: { idDocumentType: string; idImageBase64: string; idDocumentSource?: string }) =>
    api.post('/auth/kyc', data),
};

export const adminApi = {
  users: () => api.get('/admin/users'),
  stats: () => api.get('/admin/stats'),
  applications: () => api.get('/admin/applications'),
  approveApplication: (id: string) => api.post(`/admin/applications/${id}/approve`),
  rejectApplication: (id: string) => api.post(`/admin/applications/${id}/reject`),
};

export const mailApi = {
  status: () => api.get('/admin/mail/status'),
  folder: (folder: string, q?: string) =>
    api.get(`/admin/mail/folder/${folder}`, { params: q ? { q } : undefined }),
  message: (id: string) => api.get(`/admin/mail/message/${id}`),
  composeForm: (form: FormData) =>
    api.post('/admin/mail/compose', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  replyForm: (id: string, form: FormData) =>
    api.post(`/admin/mail/reply/${id}`, form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  forwardForm: (id: string, form: FormData) =>
    api.post(`/admin/mail/forward/${id}`, form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  star: (id: string) => api.post(`/admin/mail/message/${id}/star`),
  unread: (id: string) => api.post(`/admin/mail/message/${id}/unread`),
  remove: (id: string, permanent = false) =>
    api.delete(`/admin/mail/message/${id}`, { params: permanent ? { permanent: true } : undefined }),
};

/** Client-only APIs — always scoped to the logged-in user on the server */
export const clientApi = {
  overview: () => api.get('/me/overview'),
  applications: () => api.get('/me/applications'),
  documents: () => api.get('/me/documents'),
  notifications: () => api.get('/me/notifications'),
  readNotification: (id: string) => api.post(`/me/notifications/${id}/read`),
};

export const contentApi = {
  news: () => api.get('/news'),
  newsBySlug: (slug: string) => api.get(`/news/${slug}`),
  contact: (data: any) => api.post('/contact', data),
  newsletter: (email: string) => api.post('/newsletter', { email }),
  apply: (data: any) => api.post('/applications', data),
};
