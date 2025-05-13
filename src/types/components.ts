export interface ComponentData {
  id: string;
  name: string;
  type: string;
  page: string;
  icon?: string;
  status?: 'draft' | 'published';
  content?: Record<string, unknown>;
  order?: number;
}

export interface ComponentContent {
  [key: string]: unknown;
}

export interface ImageField {
  id: string;
  url: string;
  alt: string;
}

export interface LinkField {
  label: string;
  url: string;
  icon?: string;
}

export interface ButtonField extends LinkField {
  variant?: 'primary' | 'secondary';
} 