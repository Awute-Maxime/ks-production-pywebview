import api from './client'

export const dashboardApi = {
  getStats: () => api.get('/api/dashboard'),
  getAlertes: () => api.get('/api/alertes'),
}
