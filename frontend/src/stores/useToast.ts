import { create } from 'zustand'
import type { ToastType } from '../components/ui/Toast'

interface ToastState {
  message: string
  type: ToastType
  isVisible: boolean
  showToast: (message: string, type?: ToastType) => void
  hideToast: () => void
}

export const useToast = create<ToastState>((set) => ({
  message: '',
  type: 'info',
  isVisible: false,
  showToast: (message: string, type: ToastType = 'info') => {
    set({ message, type, isVisible: true })
  },
  hideToast: () => set({ isVisible: false })
}))