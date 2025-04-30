export type FieldType = 
  | 'txt'    // Texto simple
  | 'txtp'   // Texto largo/párrafos
  | 'img'    // Imagen única
  | 'icon'   // Selector de ícono
  | 'link'   // Link con label y url
  | 'btn'    // Botón
  | 'item'   // Lista de items
  | 'paragraph' // Párrafos
  | 'gallery'; // Galería de imágenes

export interface FormField {
  type: FieldType;
  key: string;
  label: string;
  value: any;
  required?: boolean;
  options?: any[];
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

export interface ItemField {
  icon?: string;
  text: string;
} 