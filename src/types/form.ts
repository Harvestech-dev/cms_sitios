export type FieldType = 
  | 'txt' 
  | 'txtp' 
  | 'img' 
  | 'icon' 
  | 'link' 
  | 'btn' 
  | 'item' 
  | 'gallery'
  | 'social'
  | 'contact'
  | 'template_email';

export interface ImageField {
  id: string;
  url: string;
  name: string;
  alt?: string;
  type: string;
  categories?: string[];
}

export interface LinkField {
  label: string;
  url: string;
  icon?: string;
}
export interface ContactField {
  label: string;
  url: string;
  icon?: string;
}

export interface ItemField {
  icon: string;
  text: string;
}

export interface EmailTemplate {
  text_body: string;
  text_subject: string;
}

export interface FormField {
  key: string;
  type: FieldType;
  label: string;
  value: string | ImageField | LinkField | ItemField | EmailTemplate | Array<any>;
  required: boolean;
  isArray?: boolean;
  group?: string;
  metadata?: {
    title?: string;
    description?: string;
    group?: string;
  };
}

// Tipos para los valores de los campos
export type FieldValue = 
  | string 
  | string[] 
  | ImageField 
  | ImageField[] 
  | LinkField 
  | LinkField[] 
  | ItemField[]
  | ContactField[]
  | EmailTemplate;