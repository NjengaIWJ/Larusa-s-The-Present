import { create } from 'zustand'

type CartItem = { productId: string; name: string; price: number; quantity: number }

interface CartState {
  items: CartItem[]
  add: (item: CartItem) => void
  remove: (productId: string) => void
  clear: () => void
  updateQuantity: (productId: string, quantity: number) => void
  increment: (productId: string) => void
  decrement: (productId: string) => void
  MAX_QUANTITY?: number
}
const MAX_QUANTITY = 99


const CART_KEY = 'tp_cart'
const initial = typeof window !== 'undefined' ? (() => {
  try { const raw = localStorage.getItem(CART_KEY); return raw ? JSON.parse(raw) as CartItem[] : [] } catch { return [] }
})() : []

export const useCart = create<CartState>((set) => ({
  items: initial,
  MAX_QUANTITY,
  add: (item) => set((state: CartState) => {
    const found = state.items.find(i => i.productId === item.productId)
    let next
    if (found) {
      const updatedQty = Math.min(found.quantity + item.quantity, MAX_QUANTITY)
      next = state.items.map(i => i.productId === item.productId ? { ...i, quantity: updatedQty } : i)
    } else {
      const qty = Math.min(item.quantity, MAX_QUANTITY)
      next = [...state.items, { ...item, quantity: qty }]
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
  updateQuantity: (productId, quantity) => set((state: CartState) => {
    const q = Math.max(1, Math.min(quantity, MAX_QUANTITY))
    const next = state.items.map(i => i.productId === productId ? { ...i, quantity: q } : i)
    try { localStorage.setItem(CART_KEY, JSON.stringify(next)) } catch { console.error('Failed to save cart to localStorage') }
    return { items: next }
  }),
  increment: (productId) => set((state: CartState) => {
    const next = state.items.map(i => i.productId === productId ? { ...i, quantity: Math.min(i.quantity + 1, MAX_QUANTITY) } : i)
    try { localStorage.setItem(CART_KEY, JSON.stringify(next)) } catch { console.error('Failed to save cart to localStorage') }
    return { items: next }
  }),
  decrement: (productId) => set((state: CartState) => {
    const next = state.items.map(i => i.productId === productId ? { ...i, quantity: Math.max(i.quantity - 1, 1) } : i)
    try { localStorage.setItem(CART_KEY, JSON.stringify(next)) } catch { console.error('Failed to save cart to localStorage') }
    return { items: next }
  }),
  clear: () => set(() => { try { localStorage.removeItem(CART_KEY) } catch {
    console.error('Failed to remove cart from localStorage')
  }; return { items: [] } })
}))

export default useCart
