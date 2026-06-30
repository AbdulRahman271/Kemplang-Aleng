import { Product, Category, ContactMessage, Review } from '@kemplang/types';

// Helper for fetch calls
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(path, {
    ...options,
    headers,
    credentials: 'include', // Important for Better Auth session cookies
  });

  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch (_) {
      // ignore json parse error on non-json error responses
    }
    throw new Error(errorMessage);
  }

  // Handle empty or text responses
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json() as Promise<T>;
  }
  
  return null as unknown as T;
}

// --- Better Auth API Helpers ---

export async function login(email: string, password: string) {
  return apiFetch<any>('/api/auth/sign-in/email', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function logout() {
  return apiFetch<any>('/api/auth/sign-out', {
    method: 'POST',
  });
}

export async function getSession() {
  return apiFetch<any>('/api/auth/get-session');
}

export async function uploadProductImage(file: File): Promise<{ imageUrl: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'kemplang_unsigned');

  const response = await fetch(
    'https://api.cloudinary.com/v1_1/dekleqgy2/image/upload',
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || 'Gagal upload gambar ke Cloudinary');
  }

  const data = await response.json();
  return { imageUrl: data.secure_url };
}

// --- Products API ---

export async function getProducts(category?: string, sortBy?: string): Promise<Product[]> {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (sortBy) params.set('sortBy', sortBy);
  
  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiFetch<Product[]>(`/api/products${queryString}`);
}

export async function getProductById(id: string): Promise<Product> {
  return apiFetch<Product>(`/api/products/${id}`);
}

export async function createProduct(product: Omit<Product, 'id'> & { id?: string }): Promise<Product> {
  // If no ID is provided, generate a simple unique ID
  const newProduct = {
    ...product,
    id: product.id || `prod-${Date.now()}`,
  };
  return apiFetch<Product>('/api/products', {
    method: 'POST',
    body: JSON.stringify(newProduct),
  });
}

export async function updateProduct(id: string, product: Partial<Product>): Promise<Product> {
  return apiFetch<Product>(`/api/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(product),
  });
}

export async function deleteProduct(id: string): Promise<Product> {
  return apiFetch<Product>(`/api/products/${id}`, {
    method: 'DELETE',
  });
}

// --- Categories API ---

export async function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>('/api/categories');
}

export async function createCategory(category: Category): Promise<Category> {
  return apiFetch<Category>('/api/categories', {
    method: 'POST',
    body: JSON.stringify(category),
  });
}

export async function updateCategory(id: string, category: Partial<Category>): Promise<Category> {
  return apiFetch<Category>(`/api/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(category),
  });
}

export async function deleteCategory(id: string): Promise<Category> {
  return apiFetch<Category>(`/api/categories/${id}`, {
    method: 'DELETE',
  });
}

// --- Settings API ---

export async function getSettings(): Promise<Record<string, string>> {
  return apiFetch<Record<string, string>>('/api/settings');
}

export async function updateSettings(settings: Record<string, string>): Promise<{ settings: Record<string, string> }> {
  return apiFetch<any>('/api/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
}

// --- Contact Messages API ---

export async function submitContactMessage(data: { name: string; phone: string; message: string }): Promise<ContactMessage> {
  return apiFetch<ContactMessage>('/api/contact', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  return apiFetch<ContactMessage[]>('/api/contact');
}

export async function updateContactMessageStatus(id: string, status: 'unread' | 'read' | 'replied'): Promise<ContactMessage> {
  return apiFetch<ContactMessage>(`/api/contact/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// --- Reviews API ---
export async function getReviews(): Promise<Review[]> {
  return apiFetch<Review[]>('/api/reviews');
}

export async function getAdminReviews(): Promise<Review[]> {
  return apiFetch<Review[]>('/api/reviews/admin');
}

export async function createReview(review: Omit<Review, 'id' | 'initial' | 'avatarBg' | 'avatarColor'> & { isApproved?: boolean }): Promise<Review> {
  return apiFetch<Review>('/api/reviews', {
    method: 'POST',
    body: JSON.stringify(review),
  });
}

export async function updateReview(id: string, review: Partial<Review>): Promise<Review> {
  return apiFetch<Review>(`/api/reviews/${id}`, {
    method: 'PUT',
    body: JSON.stringify(review),
  });
}

export async function updateReviewApproval(id: string, isApproved: boolean): Promise<Review> {
  return apiFetch<Review>(`/api/reviews/${id}/approve`, {
    method: 'PATCH',
    body: JSON.stringify({ isApproved }),
  });
}

export async function deleteReview(id: string): Promise<Review> {
  return apiFetch<Review>(`/api/reviews/${id}`, {
    method: 'DELETE',
  });
}
