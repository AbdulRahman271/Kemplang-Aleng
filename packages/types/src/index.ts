export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  weight: number; // in grams
  category: string; // changed from union to string for dynamic categories
  image: string;
  badge?: string;
  altText: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Review {
  id: string;
  name: string;
  role: string;
  rating: number;
  comment: string;
  initial: string;
  avatarBg: string;
  avatarColor: string;
  isApproved?: boolean;
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Setting {
  key: string;
  value: string;
  updatedAt?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: string;
}

export type CategoryFilter = string;
export type SortOption = 'default' | 'price-low' | 'price-high';

