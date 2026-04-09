// services/auth.js — Auth API calls: register, login, Google, me
import api from './api'

export const authService = {
  register: (data)    => api.post('/auth/register', data).then(r => r.data),
  login:    (data)    => api.post('/auth/login',    data).then(r => r.data),
  google:   (idToken) => api.post('/auth/google', { id_token: idToken }).then(r => r.data),
  me:       ()        => api.get('/auth/me').then(r => r.data),
  logout:   ()        => api.post('/auth/logout').then(r => r.data),
  updateMe: (data)    => api.put('/auth/me', data).then(r => r.data),
}
