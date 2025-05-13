'use client';

import { ProductFormData } from '@/types/products';
import { formatPrice } from '@/lib/utils';
import { marked } from 'marked';
import rehypeRaw from 'rehype-raw';
import Image from 'next/image';

interface ProductPreviewProps {
  product: ProductFormData;
}

export default function ProductPreview({ product }: ProductPreviewProps) {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      {/* Galería de imágenes */}
      <div className="relative">
        <Image
          src={product.image_url || '/placeholder-product.jpg'}
          alt={product.title}
          width={800}
          height={600}
          className="w-full aspect-video object-cover"
        />
        {product.featured && (
          <span className="absolute top-4 right-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-medium">
            Destacado
          </span>
        )}
      </div>

      <div className="p-6">
        {/* Encabezado */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">{product.title}</h1>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-blue-400">
              {formatPrice(product.price)}
            </div>
            <div className="flex items-center gap-2">
              {product.categories.map(category => (
                <span
                  key={category}
                  className="px-2 py-1 bg-gray-700 text-gray-300 rounded-full text-sm"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Resumen */}
        {product.summary && (
          <div className="mb-6 text-gray-300">{product.summary}</div>
        )}

        {/* Descripción */}
        <div className="prose prose-invert max-w-none">
          <div 
            dangerouslySetInnerHTML={{ 
              __html: marked(product.description, { 
                breaks: true,
                gfm: true,
                rehypePlugins: [rehypeRaw] 
              }) 
            }} 
          />
        </div>

        {/* Galería */}
        {product.gallery.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-white mb-4">Galería</h3>
            <div className="grid grid-cols-3 gap-4">
              {product.gallery.map((imageUrl, index) => (
                <img
                  key={index}
                  src={imageUrl}
                  alt={`${product.title} - Imagen ${index + 1}`}
                  className="w-full aspect-square object-cover rounded-lg"
                />
              ))}
            </div>
          </div>
        )}

        {/* Etiquetas */}
        {product.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {product.tags.map(tag => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-700 text-gray-300 rounded-full text-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Estado */}
        <div className="mt-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Estado:</span>
            <span className={`
              px-2 py-1 rounded-full text-sm
              ${product.status === 'published' ? 'bg-green-500/20 text-green-300' :
                product.status === 'draft' ? 'bg-gray-500/20 text-gray-300' :
                'bg-red-500/20 text-red-300'}
            `}>
              {product.status === 'published' ? 'Publicado' :
               product.status === 'draft' ? 'Borrador' : 'Archivado'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 