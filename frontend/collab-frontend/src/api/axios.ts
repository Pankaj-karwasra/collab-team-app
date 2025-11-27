import axios from 'axios';
import { auth } from '../config/firebase';

// UPDATED: Use Environment variable or your Render URL
const BASE_URL = import.meta.env.VITE_API_URL || 'https://collab-team-app.onrender.com';

const api = axios.create({
  // We append '/api' because your backend routes likely start with it
  baseURL: `${BASE_URL}/api`, 
});

// Request Interceptor: Add Token
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;