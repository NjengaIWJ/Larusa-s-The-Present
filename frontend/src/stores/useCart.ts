import { create } from 'zustand'

type CartItem = { productId: string; name: string; price: number; quantity: number }

interface CartState {
  items: CartItem[]
  add: (item: CartItem) => void
  remove: (productId: string) => void
  clear: () => void
}

const CART_KEY = 'tp_cart'
const initial = typeof window !== 'undefined' ? (() => {
  try { const raw = localStorage.getItem(CART_KEY); return raw ? JSON.parse(raw) as CartItem[] : [] } catch { return [] }
})() : []

export const useCart = create<CartState>((set) => ({
  items: initial,
  add: (item) => set((state: CartState) => {
    const found = state.items.find(i => i.productId === item.productId)
    let next
    if (found) {
      next = state.items.map(i => i.productId === item.productId ? { ...i, quantity: i.quantity + item.quantity } : i)
    } else {
      next = [...state.items, item]
    }
    try { localStorage.setItem(CART_KEY, JSON.stringify(next)) } catch {
      console.error('Failed to save cart to localStorage')
    }
    return { items: next }
  }),
  remove: (productId) => set((state: CartState) => {
    const next = state.items.filter(i => i.productId !== productId)
    try { localStorage.setItem(CART_KEY, JSON.stringify(next)) } catch {
      console.error('Failed to save cart to localStorage')  
    }
    return { items: next }
  }),
  clear: () => set(() => { try { localStorage.removeItem(CART_KEY) } catch {
    console.error('Failed to remove cart from localStorage')
  }; return { items: [] } })
}))

export default useCart
