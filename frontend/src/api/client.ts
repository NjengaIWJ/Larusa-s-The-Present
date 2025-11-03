import axios from 'axios';

const baseURL = (import.meta.env && (import.meta.env as any).VITE_API_BASE) || 'http://localhost:4000/api'

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' }
});

// Attach token from localStorage if present
api.interceptors.request.use((cfg) => {
  try {
    const token = localStorage.getItem('tp_token')
    if (token) (cfg.headers as any) = { ...(cfg.headers || {}), Authorization: `Bearer ${token}` }
  } catch (e) {
    // ignore
  }
  return cfg
})

export default api;
