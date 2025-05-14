'use client';

import { useState, useEffect } from 'react';
import { MediaFile } from '@/types/media';
import IconRenderer from '@/components/common/IconRenderer';
import { Chip } from '@/components/common/Chip';
import { formatFileSize, formatDate } from '@/lib/utils';
import SafeImage from '@/components/common/SafeImage';

interface FileDetailsModalProps {
  file: MediaFile;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (file: MediaFile) => Promise<void>;
}

const MEDIA_CATEGORIES = [
  'noticias',
  'productos',
  'banners',
  'logos',
  'iconos',
  'componentes'
] as const;

export default function FileDetailsModal({ file, isOpen, onClose, onUpdate }: FileDetailsModalProps) {
  const [editedFile, setEditedFile] = useState<MediaFile>(file);
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    setEditedFile(file);
  }, [file]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditedFile({
      ...editedFile,
      [e.target.name]: e.target.value
    });
  };

  const toggleCategory = (category: string) => {
    const currentCategories = Array.isArray(editedFile.categories) 
      ? [...editedFile.categories] 
      : [];
    
    if (currentCategories.includes(category)) {
      setEditedFile({
        ...editedFile,
        categories: currentCategories.filter(c => c !== category)
      });
    } else {
      setEditedFile({
        ...editedFile,
        categories: [...currentCategories, category]
      });
    }
  };

  const handleSave = async () => {
    await onUpdate(editedFile);
    setIsEditing(false);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return 'FaImage';
    if (type.startsWith('video/')) return 'FaVideo';
    if (type.startsWith('audio/')) return 'FaMusic';
    if (type.includes('pdf')) return 'FaFilePdf';
    if (type.includes('word')) return 'FaFileWord';
    if (type.includes('excel') || type.includes('spreadsheet')) return 'FaFileExcel';
    return 'FaFile';
  };

  const getImagePreview = (file: MediaFile) => {
    if (file.url?.startsWith('http')) {
      return file.url;
    }

    if (file.storage_path) {
      return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${file.storage_path}`;
    }

    return file.url || '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-900 p-4 flex items-center justify-between">
          <h2 className="text-white text-lg font-medium truncate">
            {isEditing ? 'Editar archivo' : file.name}
          </h2>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-gray-300 hover:text-white"
                title="Editar"
              >
                <IconRenderer icon="FaEdit" className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-300 hover:text-white"
              title="Cerrar"
            >
              <IconRenderer icon="FaTimes" className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Contenido con scroll */}
        <div className="flex-grow overflow-y-auto p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Vista previa */}
            <div className="md:w-1/2">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-900 flex items-center justify-center mb-4">
                {file.type.startsWith('image/') ? (
                  <SafeImage
                    src={file.url}
                    alt={file.alt || file.name}
                    width={400}
                    height={400}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center p-4">
                    <IconRenderer 
                      icon={getFileIcon(file.type)} 
                      className="w-20 h-20 text-gray-500 mx-auto mb-4" 
                    />
                    <div className="text-white font-medium truncate">{file.name}</div>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <IconRenderer icon="FaFileAlt" className="w-4 h-4" />
                  <span>Tipo: {file.type}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <IconRenderer icon="FaWeight" className="w-4 h-4" />
                  <span>Tamaño: {formatFileSize(file.size)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <IconRenderer icon="FaCalendar" className="w-4 h-4" />
                  <span>Creado: {formatDate(file.created_at)}</span>
                </div>
                {file.updated_at && (
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <IconRenderer icon="FaEdit" className="w-4 h-4" />
                    <span>Actualizado: {formatDate(file.updated_at)}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Detalles */}
            <div className="md:w-1/2">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-1">
                      Nombre
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editedFile.name}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-1">
                      Texto alternativo
                    </label>
                    <input
                      type="text"
                      name="alt"
                      value={editedFile.alt || ''}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-1">
                      URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editedFile.url || ''}
                        readOnly
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(editedFile.url || '');
                        }}
                        className="px-2 bg-gray-600 rounded"
                        title="Copiar URL"
                      >
                        <IconRenderer icon="FaCopy" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-1">
                      Categorías
                    </label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {MEDIA_CATEGORIES.map(category => (
                        <Chip
                          key={category}
                          label={category}
                          onClick={() => toggleCategory(category)}
                          active={Array.isArray(editedFile.categories) && editedFile.categories.includes(category)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-white font-medium">Nombre</h3>
                    <p className="text-gray-300">{file.name}</p>
                  </div>
                  
                  {file.alt && (
                    <div>
                      <h3 className="text-white font-medium">Texto alternativo</h3>
                      <p className="text-gray-300">{file.alt}</p>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-white font-medium">URL</h3>
                    <div className="flex gap-2 items-center">
                      <p className="text-gray-300 truncate">{file.url}</p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(file.url || '');
                        }}
                        className="p-1 text-gray-400 hover:text-white"
                        title="Copiar URL"
                      >
                        <IconRenderer icon="FaCopy" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-white font-medium">Categorías</h3>
                    {Array.isArray(file.categories) && file.categories.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {file.categories.map(category => (
                          <span 
                            key={category} 
                            className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm">Sin categorías</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Footer actions */}
        {isEditing && (
          <div className="bg-gray-900 p-4 flex justify-end gap-2">
            <button
              onClick={() => {
                setEditedFile(file);
                setIsEditing(false);
              }}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Guardar
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 