import api from "./client"
import type { AxiosProgressEvent } from 'axios'

export type Product = {
  _id: string
  name: string
  description?: string
  price: number
  images?: string[]
  category?: string
}

export type UserPayload = { id: string; name: string; email: string; role: string }

// Products
export const getProducts = async (): Promise<Product[]> => {
  const res = await api.get('/products')
  return res.data
}

export const getProduct = async (id: string): Promise<Product> => {
  const res = await api.get(`/products/${id}`)
  return res.data
}

export const createProduct = async (payload: Partial<Product>) => {
  const res = await api.post('/products', payload)
  return res.data
}

export const updateProduct = async (id: string, payload: Partial<Product>) => {
  const res = await api.put(`/products/${id}`, payload)
  return res.data
}

export const deleteProduct = async (id: string) => {
  const res = await api.delete(`/products/${id}`)
  return res.data
}

// Auth
export const login = async (email: string, password: string) => {
  const res = await api.post('/auth/login', { email, password })
  return res.data as { token: string; user: UserPayload }
}

export const register = async (name: string, email: string, password: string) => {
  const res = await api.post('/auth/register', { name, email, password })
  return res.data as { token: string; user: UserPayload }
}

// Orders
export type OrderItem = { product: string; quantity: number; price: number }
export type OrderPayload = { items: OrderItem[]; total: number }

export const createOrder = async (payload: OrderPayload) => {
  const res = await api.post('/orders', payload)
  return res.data
}

export const getOrders = async () => {
  const res = await api.get('/orders')
  return res.data
}

// Upload
export const uploadImage = async (file: File, onProgress?: (percent: number) => void) => {
  const fd = new FormData()
  fd.append('file', file)
  const res = await api.post('/upload/image', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e: AxiosProgressEvent) => {
      try {
        const loaded = (e && (e.loaded as number)) || 0
        const total = (e && (e.total as number)) || 0
        if (onProgress && total) {
          const pct = Math.round((loaded / total) * 100)
          onProgress(pct)
        }
      } catch (error) {
        console.warn('upload progress error', error)
      }
    }
  })
  return res.data as { url: string }
}

export default {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  login,
  register,
  createOrder,
  getOrders,
  uploadImage
}
