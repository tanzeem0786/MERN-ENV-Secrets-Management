import api from './axios'

export const secretApi = {
  list: (environmentId) => api.get('/secrets', { params: { environmentId } }),
  create: (payload) => api.post('/secrets', payload),
  update: (id, payload) => api.patch(`/secrets/${id}`, payload),
  remove: (id) => api.delete(`/secrets/${id}`),
  reveal: (id) => api.post(`/secrets/${id}/reveal`),
}
