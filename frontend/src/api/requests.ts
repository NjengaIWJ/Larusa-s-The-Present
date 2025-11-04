import api from "./client"
import type { AxiosProgressEvent } from 'axios'

export type ProductImage = { url: string; publicId?: string }

export type Product = {
  _id: string
  name: string
  description?: string
  price: number
  images?: ProductImage[]
  category?: string
  createdAt?: string
  updatedAt?: string
}

export type UserPayload = { id: string; name: string; email: string; role: string }
export type LoginResponse = { token: string; user: UserPayload }
export type RegisterResponse = { token: string; user: UserPayload }

// Image Upload
export const uploadImage = async (
  formData: FormData,
  onProgress?: (progress: number) => void
): Promise<{ url: string; width?: number; height?: number; format?: string }> => {
  const res = await api.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e: AxiosProgressEvent) => {
      try {
        const loaded = e.loaded || 0
        const total = e.total || 0
        if (onProgress && total) {
          const pct = Math.round((loaded / total) * 100)
          onProgress(pct)
        }
      } catch (error) {
        console.warn('Upload progress error:', error)
      }
    }
  })
  return res.data
}

// Products
export const getProducts = async (): Promise<Product[]> => {
  const res = await api.get('/products')
  return res.data
}

export const getProduct = async (id: string): Promise<Product> => {
  const res = await api.get(`/products/${id}`)
  return res.data
}

export const createProduct = async (payload: Partial<Product>): Promise<Product> => {
  const res = await api.post('/products', payload)
  return res.data
}

export const updateProduct = async (id: string, payload: Partial<Product>): Promise<Product> => {
  const res = await api.put(`/products/${id}`, payload)
  return res.data
}

export const deleteProduct = async (id: string): Promise<void> => {
  await api.delete(`/products/${id}`)
}

// Auth
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const res = await api.post('/auth/login', { email, password })
  return res.data
}

export const register = async (
  name: string,
  email: string,
  password: string,
  role?: string
): Promise<RegisterResponse> => {
  const res = await api.post('/auth/register', { name, email, password, role })
  return res.data
}

export const getMe = async (): Promise<UserPayload> => {
  const res = await api.get('/auth/me')
  return res.data
}

// Orders
export interface OrderItem {
  product: string
  quantity: number
  price: number
}

export interface Order {
  _id: string
  user: string
  items: OrderItem[]
  total: number
  status: 'pending' | 'completed' | 'cancelled'
  createdAt: string
  updatedAt: string
}

export const createOrder = async (items: OrderItem[]): Promise<Order> => {
  const res = await api.post('/orders', { items })
  return res.data
}

export const getOrders = async (): Promise<Order[]> => {
  const res = await api.get('/orders/my-orders')
  return res.data
}

export const getOrder = async (id: string): Promise<Order> => {
  const res = await api.get(`/orders/${id}`)
  return res.data
}

export const updateOrderStatus = async (id: string, status: Order['status']): Promise<Order> => {
  const res = await api.patch(`/orders/${id}`, { status })
  return res.data
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
