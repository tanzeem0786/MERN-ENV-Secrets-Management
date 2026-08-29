import api from "./axios";

export const environmentApi = {
  list: (projectId) => api.get("/environments", { params: { projectId } }),
  get: (id) => api.get(`/environments/${id}`),
  create: (payload) => api.post("/environments", payload),
  update: (id, payload) => api.patch(`/environments/${id}`, payload),
  remove: (id) => api.delete(`/environments/${id}`),
};
