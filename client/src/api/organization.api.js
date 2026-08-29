import api from "./axios";

export const organizationApi = {
  list: () => api.get("/organizations/mine"),
  get: (id) => api.get(`/organizations/${id}`),
  create: (payload) => api.post("/organizations", payload),
};
