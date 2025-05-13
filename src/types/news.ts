export interface NewsImage {
  src: string;
  alt: string;
}

export interface NewsItem {
  id: string;
  title: string;
  subtitle?: string;
  summary: string;
  content: string;
  img_src?: string;
  img_alt?: string;
  author: string;
  status: NewsStatus;
  tags: string[];
  featured: boolean;
  categories: string[];
  user_id: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  slug: string;
}

export type NewsStatus = 'draft' | 'published' | 'archived';

export interface NewsFilters {
  status?: NewsStatus;
  category?: string;
  tag?: string;
  featured?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'title' | 'created_at' | 'published_at' | 'author';
  sortOrder?: 'asc' | 'desc';
}

export interface NewsFormData {
  title: string;
  subtitle?: string;
  summary: string;
  content: string;
  author: string;
  status: NewsStatus;
  featured: boolean;
  tags: string[];
  categories: string[];
  img_src?: string;
  img_alt?: string;
  slug?: string;
  created_at?: string;
  updated_at?: string;
} 