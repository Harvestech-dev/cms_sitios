export interface MediaFile {
  id: string;
  url: string;
  name: string;
  type: string;
  alt?: string;
  size: number;
  storage_path?: string;
  categories?: string[];
  created_at: string;
}

export interface MediaFilters {
  type?: string;
  category?: string;
  search?: string;
} 