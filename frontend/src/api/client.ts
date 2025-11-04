import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE ?? '/api';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000 // network timeout for requests (10s)
});

// Attach token from localStorage if present
api.interceptors.request.use((cfg: any) => {
  try {
    const token = localStorage.getItem('tp_token')
    if (token) cfg.headers = { ...(cfg.headers || {}), Authorization: `Bearer ${token}` }
  } catch (_) {
    // ignore localStorage errors
  }
  return cfg
})

// Global response handling: auto-logout on 401 to keep UX consistent
api.interceptors.response.use(
  (res) => res,
  (err) => {
    try {
      if (err?.response?.status === 401) {
        try { localStorage.removeItem('tp_token') } catch (_) { }
        // redirect to login preserving current path
        const next = window.location.pathname + window.location.search
        window.location.href = `/login?next=${encodeURIComponent(next)}`
      }
    } catch (_) {
      // swallow errors from interceptor
    }
    return Promise.reject(err)
  }
)

export default api;
