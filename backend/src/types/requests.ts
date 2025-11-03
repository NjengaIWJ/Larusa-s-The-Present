export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: 'customer' | 'vendor' | 'admin';
}

export interface ProductRequest {
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
}

export interface OrderRequest {
  items: Array<{
    product: string;
    quantity: number;
  }>;
}