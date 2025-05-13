'use client';

import '@uiw/react-markdown-preview/markdown.css';
import '@uiw/react-md-editor/markdown-editor.css';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Product, ProductFormData, ProductStatus } from '@/types/products';
import { useProducts } from '@/contexts/ProductContext';
import { useToast } from '@/contexts/ToastContext';
import IconRenderer from '@/components/common/IconRenderer';
import ImagePicker from '@/components/common/ImagePicker';
import ProductPreview from '@/app/products/components/ProductPreview';
import { MediaFile } from '@/types/media';

import { Chip } from '@/components/common/Chip';
import MDEditor from '@uiw/react-md-editor';

interface ProductFormProps {
  initialData?: Product;
  isEdit?: boolean;
}

const PRODUCT_CATEGORIES = [
  'Electrónica',
  'Ropa',
  'Hogar',
  'Deportes',
  'Juguetes',
  'Libros',
  'Otros'
] as const;

const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-z0-9]+/g, '-')     // Reemplazar caracteres especiales por guiones
    .replace(/^-+|-+$/g, '')         // Eliminar guiones del inicio y final
    .substring(0, 80);               // Limitar longitud
};

// Función para sanitizar el slug manual (más permisiva)
/* const sanitizeSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-\s]/g, '') // Permite letras, números, guiones y espacios
    .substring(0, 80);
}; */

interface ProductFormData {
  title: string;
  slug: string;
  description: string;
  price: number;
  status: ProductStatus;
  image_url?: string;
  gallery: string[];
  tags: string[];
  featured: boolean;
  categories: string[];
}

export default function ProductForm({ initialData, isEdit = false }: ProductFormProps) {
  const router = useRouter();
  const { createProduct, updateProduct } = useProducts();
  const { showToast } = useToast();

  const [formData, setFormData] = useState<ProductFormData>({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    price: initialData?.price || 0,
    status: initialData?.status || 'draft',
    image_url: initialData?.image_url || '',
    gallery: initialData?.gallery || [],
    tags: initialData?.tags || [],
    featured: initialData?.featured || false,
    categories: initialData?.categories || []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [newTag, setNewTag] = useState('');

  // Generar slug automáticamente cuando cambia el título
  useEffect(() => {
    if (!formData.slug && formData.title) {
      setFormData(prev => ({
        ...prev,
        slug: slugify(formData.title)
      }));
    }
  }, [formData.title]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (isEdit && initialData) {
        await updateProduct(initialData.id, formData);
        showToast('Producto actualizado correctamente', 'success');
      } else {
        await createProduct(formData);
        showToast('Producto creado correctamente', 'success');
      }
      router.push('/products');
    } catch (error) {
      console.error('Error al guardar producto:', error);
      showToast('Error al guardar el producto', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageSelect = (image: MediaFile) => {
    setFormData(prev => ({
      ...prev,
      image_url: image.url,
      image: {
        url: image.url,
        alt: image.alt || '',
        id: image.id,
        name: image.name,
        type: image.type
      }
    }));
    setShowImagePicker(false);
  };

  const handleRemoveFromGallery = (imageUrl: string) => {
    setFormData(prev => {
      const newGallery = prev.gallery.filter(url => url !== imageUrl);
      return {
        ...prev,
        gallery: newGallery,
        image_url: '',
        image: null
      };
    });
  };

  const handleSetMainImage = (imageUrl: string) => {
    setFormData(prev => {
      const newGallery = prev.gallery.filter(url => url !== imageUrl);
      return {
        ...prev,
        gallery: [imageUrl, ...newGallery],
        image_url: imageUrl,
        image: {
          url: imageUrl,
          alt: '',
          id: '',
          name: '',
          type: ''
        }
      };
    });
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          {isEdit ? 'Editar producto' : 'Nuevo producto'}
        </h2>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600"
          >
            {showPreview ? 'Editar' : 'Vista previa'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600"
          >
            Volver
          </button>
        </div>
      </div>

      {!showPreview ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div className="bg-gray-800 p-6 rounded-lg space-y-4">
            <h3 className="text-lg font-medium text-white mb-4">Información básica</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-200"
                  required
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-300">
                    Slug
                  </label>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-200"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Descripción con Markdown */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-4">Descripción</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Resumen
                  </label>
                  <textarea
                    value={formData.summary}
                    onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-200"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descripción detallada
                  </label>
                  <MDEditor
                    value={formData.description}
                    onChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      description: value || '' 
                    }))}
                    preview="edit"
                    height={400}
                    className="bg-gray-800"
                    textareaProps={{
                      placeholder: "Escribe la descripción del producto usando Markdown..."
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Precios y estado */}
          <div className="bg-gray-800 p-6 rounded-lg space-y-4">
            <h3 className="text-lg font-medium text-white mb-4">Precios y estado</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Precio
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-200"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Estado
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as ProductStatus }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-200"
                >
                  <option value="draft">Borrador</option>
                  <option value="published">Publicado</option>
                  <option value="archived">Archivado</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                className="bg-gray-700 border-gray-600 rounded"
              />
              <label className="text-sm font-medium text-gray-300">
                Destacado
              </label>
            </div>
          </div>

          {/* Imágenes */}
          <div className="bg-gray-800 p-6 rounded-lg space-y-6">
            <h3 className="text-lg font-medium text-white mb-4">Imágenes</h3>
            
            {/* Galería */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-300">
                  Galería de imágenes
                </label>
                <button
                  type="button"
                  onClick={() => setShowImagePicker(true)}
                  className="px-3 py-1 text-sm bg-gray-700 text-gray-300 rounded hover:bg-gray-600 flex items-center gap-2"
                >
                  <IconRenderer icon="FaPlus" className="w-3 h-3" />
                  Agregar imagen
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {formData.gallery.map((imageUrl, index) => (
                  <div 
                    key={index} 
                    className="relative aspect-square rounded-lg overflow-hidden bg-gray-700 group"
                  >
                    <img
                      src={imageUrl}
                      alt={`${formData.title} - ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gray-900/70 bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      {index !== 0 && (
                        <button
                          type="button"
                          onClick={() => handleSetMainImage(imageUrl)}
                          className="absolute top-2 right-2 bg-blue-500/80 text-white rounded-full hover:bg-blue-600"
                          title="Establecer como imagen principal"
                        >
                          <IconRenderer icon="FaStar" className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveFromGallery(imageUrl)}
                        className="p-1 bg-red-500/80 text-white rounded-full hover:bg-red-600"
                        title="Eliminar de la galería"
                      >
                        <IconRenderer icon="FaTrash" className="w-4 h-4" />
                      </button>
                    </div>
                    {index === 0 && (
                      <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 text-xs rounded-full">
                        Principal
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Categorías y etiquetas */}
          <div className="bg-gray-800 p-6 rounded-lg space-y-4">
            <h3 className="text-lg font-medium text-white mb-4">Categorías y etiquetas</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Categorías
              </label>
              <div className="flex flex-wrap gap-2">
                {PRODUCT_CATEGORIES.map(category => (
                  <Chip
                    key={category}
                    label={category}
                    selected={formData.categories.includes(category)}
                    onClick={() => handleCategoryToggle(category)}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Etiquetas
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-200"
                  placeholder="Agregar etiqueta..."
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Agregar
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-700 text-gray-300 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-gray-400 hover:text-gray-200"
                    >
                      <IconRenderer icon="FaTimes" className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      ) : (
        <ProductPreview product={formData} />
      )}

      {/* Modal de selección de imágenes */}
      {showImagePicker && (
        <ImagePicker
          onSelect={handleImageSelect}
          onClose={() => setShowImagePicker(false)}
          isOpen={showImagePicker}
        />
      )}
    </div>
  );
} 