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

export type NewsStatus = 'draft' | 'published';

export interface NewsFilters {
  search?: string;
  status?: string;
  tags?: string[];
  featured?: boolean;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface NewsFormData {
  title: string;
  content: string;
  summary: string;
  status: NewsStatus;
  tags: string[];
  featured: boolean;
  img_src?: string;
  img_alt?: string;
  publish_date?: string;
}

export interface News {
  id: string;
  title: string;
  content: string;
  summary: string;
  status: NewsStatus;
  tags: string[];
  featured: boolean;
  img_src?: string;
  img_alt?: string;
  publish_date?: string;
  created_at: string;
  updated_at?: string;
} 