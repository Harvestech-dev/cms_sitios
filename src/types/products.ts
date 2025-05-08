export type ProductStatus = 'draft' | 'published' | 'archived';

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  summary: string;
  price: number;
  featured: boolean;
  image_url: string;
  gallery: string[];
  tags: string[];
  categories: string[];
  status: ProductStatus;
  order: number;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface ProductFormData extends Omit<Product, 'id' | 'created_at' | 'updated_at' | 'user_id'> {
  id?: string;
}

export interface ProductFilters {
  search?: string;
  status?: ProductStatus;
  featured?: boolean;
  categories?: string[];
  tags?: string[];
  page: number;
  limit: number;
  sortBy: keyof Product;
  sortOrder: 'asc' | 'desc';
} 