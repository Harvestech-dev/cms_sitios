export interface ComponentData {
  id: string;
  name: string;
  type: string;
  status: 'draft' | 'published';
  content: ComponentContent;
}

export interface ComponentContent {
  [key: string]: any; // Esto se puede tipar más específicamente según tus necesidades
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