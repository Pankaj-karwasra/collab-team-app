import api from './axios';

export const teamApi = {
  create: (data: { name: string; description: string }) => api.post('/teams', data),
  addMember: (email: string) => api.post('/teams/add-member', { email }),
  getMembers: () => api.get('/teams/members'),
};

export const projectApi = {
  getAll: () => api.get('/projects'),
  create: (data: any) => api.post('/projects', data),
  update: (id: string, data: any) => api.put(`/projects/${id}`, data), 
  delete: (id: string) => api.delete(`/projects/${id}`),
};

export const taskApi = {
  getAll: (projectId: string) => api.get(`/tasks?projectId=${projectId}`),
  create: (data: any) => api.post('/tasks', data),
  update: (id: string, data: any) => api.put(`/tasks/${id}`, data),
  delete: (id: string) => api.delete(`/tasks/${id}`),
  createAI: (data: { command: string; projectId: string }) => api.post('/tasks/ai-create', data),
};

export const userApi = {
  getAllTeamUsers: () => api.get('/teams/members'), 
  updateRole: (userId: string, role: string) => api.put(`/users/${userId}/role`, { role }),
};

export const messageApi = {
  getAll: (teamId: string) => api.get(`/messages?teamId=${teamId}`),
  send: (data: { content: string; teamId: string }) => api.post('/messages', data),
};