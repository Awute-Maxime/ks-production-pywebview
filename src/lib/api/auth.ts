import api from './client'

export const authApi = {
  login: (username: string, password: string) =>
    api.post('/api/login', { username, password }),

  logout: () =>
    api.post('/api/logout'),

  me: () =>
    api.get('/api/me'),
}
