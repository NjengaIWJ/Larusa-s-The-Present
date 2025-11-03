import { create } from 'zustand'

type User = { id: string; name: string; email: string; role: string }

interface AuthState {
  token: string | null
  user: User | null
  setAuth: (token: string, user: User) => void
  clearAuth: () => void
}

const initialToken = typeof window !== 'undefined' ? localStorage.getItem('tp_token') : null
const initialUser = typeof window !== 'undefined' ? (() => {
  try { const raw = localStorage.getItem('tp_user'); return raw ? JSON.parse(raw) : null } catch { return null }
})() : null

export const useAuth = create<AuthState>((set: any) => ({
  token: initialToken,
  user: initialUser,
  setAuth: (token: string, user: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tp_token', token)
      localStorage.setItem('tp_user', JSON.stringify(user))
    }
    set(() => ({ token, user }))
  },
  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tp_token')
      localStorage.removeItem('tp_user')
    }
    set(() => ({ token: null, user: null }))
  }
}))

export default useAuth
