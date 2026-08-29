import api from './axios'

export const projectApi = {
  list: (organizationId) => api.get('/projects', { params: { organizationId } }),
  get: (id) => api.get(`/projects/${id}`),
  create: (payload) => api.post('/projects', payload),
  update: (id, payload) => api.patch(`/projects/${id}`, payload),
  remove: (id) => api.delete(`/projects/${id}`),
}
