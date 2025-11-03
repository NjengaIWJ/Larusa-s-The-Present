import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE ?? '/api';

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
    if (e instanceof Error) {
      console.error('Failed to attach auth token to request:', e.message)
    }
    // ignore
  }
  return cfg
})

export default api;
