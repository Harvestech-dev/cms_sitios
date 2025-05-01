export interface MediaFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  alt?: string;
  storage_path?: string;
  created_at: string;
  updated_at?: string;
} 