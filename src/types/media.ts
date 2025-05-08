export interface MediaFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  created_at: string;
  categories?: string[];
  alt?: string;
  storage_path?: string;
} 