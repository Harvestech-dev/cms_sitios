'use client';

import { useState } from 'react';
import FileUpload from './FileUpload';
import Modal from './Modal';
import { useMedia } from '@/contexts/MediaContext';
import { MediaFile } from '@/types/media';

interface ImagePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (image: ImageField) => void;
}

interface ImageField {
  id: string;
  url: string;
  alt: string;
}

const getImagePreview = (file: MediaFile) => {
  if (file.url?.startsWith('http')) {
    return file.url;
  }

  if (file.storage_path) {
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${file.storage_path}`;
  }

  return file.url || '';
};

export default function ImagePicker({ isOpen, onClose, onSelect }: ImagePickerProps) {
  const { images, loading, refreshMedia } = useMedia();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredImages = images.filter(img => 
    img.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUploadComplete = async () => {
    await refreshMedia();
  };

  const handleImageSelect = (image: MediaFile) => {
    const previewUrl = getImagePreview(image);
    onSelect({
      id: image.id,
      url: previewUrl,
      alt: image.alt || image.name
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Seleccionar imagen"
      size="xl"
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">Galería de imágenes</h3>
            <input
              type="text"
              placeholder="Buscar imagen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Sección de Upload */}
          <div className="p-4 border-b border-gray-700">
            <div className="mb-2 text-sm font-medium text-gray-300">
              Subir nueva imagen
            </div>
            <FileUpload
              onUploadComplete={handleUploadComplete}
              onError={(error) => console.error(error)}
            />
          </div>

          {/* Galería de imágenes */}
          <div className="p-4">
            <div className="mb-4 text-sm font-medium text-gray-300">
              {filteredImages.length} imágenes disponibles
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="text-gray-400">Cargando imágenes...</div>
              </div>
            ) : filteredImages.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                {searchTerm ? 'No se encontraron imágenes' : 'No hay imágenes disponibles'}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredImages.map(image => {
                  const previewUrl = getImagePreview(image);
                  return (
                    <div
                      key={image.id}
                      onClick={() => handleImageSelect(image)}
                      className="group relative cursor-pointer rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all bg-gray-800"
                    >
                      <div className="aspect-square relative">
                        <img
                          src={previewUrl}
                          alt={image.alt || image.name}
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/images/placeholder-image.png';
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-700">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-md"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
} 