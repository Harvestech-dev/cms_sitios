'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/common/Modal';
import IconRenderer from '@/components/common/IconRenderer';
import { MediaFile } from '@/types/media';
import { formatFileSize, formatDate } from '@/lib/utils';
import { useToast } from '@/contexts/ToastContext';
import { Chip } from '@/components/common/Chip';

const MEDIA_CATEGORIES = [
  'noticias',
  'productos',
  'banners',
  'logos',
  'iconos',
  'componentes'
] as const;

interface FileDetailsModalProps {
  file: MediaFile;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (file: MediaFile) => Promise<void>;
}

export default function FileDetailsModal({ file, isOpen, onClose, onUpdate }: FileDetailsModalProps) {
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(file.name);
  const [alt, setAlt] = useState(file.alt || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    Array.isArray(file.categories) ? file.categories : 
    typeof file.categories === 'object' && file.categories !== null
      ? Object.values(file.categories)
      : []
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(file.name);
    setAlt(file.alt || '');
    setSelectedCategories(
      Array.isArray(file.categories) ? file.categories : 
      typeof file.categories === 'object' && file.categories !== null
        ? Object.values(file.categories)
        : []
    );
  }, [file]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const updatedFile: MediaFile = {
        ...file,
        name,
        alt,
        categories: selectedCategories
      };
      await onUpdate(updatedFile);
      setIsEditing(false);
      showToast('Cambios guardados correctamente', 'success');
    } catch (error) {
      console.error('Error al actualizar archivo:', error);
      showToast('Error al guardar los cambios', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(file.url);
      showToast('URL copiada al portapapeles', 'success');
    } catch (error) {
      console.error('Error al copiar URL:', error);
      showToast('Error al copiar la URL', 'error');
    }
  };

  const renderField = (label: string, value: string, key: keyof MediaFile) => {
    const isEditable = ['name', 'alt'].includes(key);

    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-gray-400">{label}</label>
          {isEditable && isEditing && (
            <span className="text-xs text-blue-400">Editable</span>
          )}
        </div>
        {isEditing && isEditable ? (
          <input
            type="text"
            value={value}
            onChange={(e) => {
              if (key === 'name') {
                setName(e.target.value);
              } else if (key === 'alt') {
                setAlt(e.target.value);
              }
            }}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-200"
          />
        ) : (
          <div className="text-gray-200 bg-gray-800 rounded px-3 py-2">
            {value}
          </div>
        )}
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalles del archivo"
      size="xl"
    >
      <div className="p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex gap-8">
          {/* Preview - Lado izquierdo */}
          <div className="w-1/3">
            <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
              {file.type.startsWith('image/') ? (
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <IconRenderer 
                    icon={file.type.includes('pdf') ? 'FaFilePdf' : 'FaFile'} 
                    className="w-20 h-20 text-gray-600" 
                  />
                </div>
              )}
            </div>
          </div>

          {/* Información - Lado derecho */}
          <div className="flex-1">
            {/* Información técnica */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-white mb-4">Información técnica</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-400">Tipo</span>
                    <div className="text-gray-200">{file.type}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Tamaño</span>
                    <div className="text-gray-200">{formatFileSize(file.size)}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-400">Fecha de creación</span>
                    <div className="text-gray-200">{formatDate(file.created_at)}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">ID</span>
                    <div className="text-gray-200 font-mono text-sm">{file.id}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* URL */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-white mb-4">URL del archivo</h3>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={file.url}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 pr-20 text-gray-300 font-mono text-sm"
                />
                <button
                  onClick={handleCopyUrl}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 text-sm cursor-pointer"
                >
                  Copiar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Información editable - Abajo */}
        <div className="mt-8 border-t border-gray-700 pt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">Información básica</h3>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600"
              >
                Editar
              </button>
            )}
          </div>

          <div className="space-y-4">
            {renderField('Nombre', name, 'name')}
            {renderField('Texto alternativo', alt, 'alt')}

            {/* Categorías movidas aquí */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-gray-400">Categorías</label>
                {isEditing && (
                  <span className="text-xs text-blue-400">Selecciona las categorías</span>
                )}
              </div>
              {isEditing ? (
                <div className="flex flex-wrap gap-2 p-3 bg-gray-700 rounded-lg">
                  {MEDIA_CATEGORIES.map(category => (
                    <Chip
                      key={category}
                      label={category}
                      selected={selectedCategories.includes(category)}
                      onClick={() => {
                        setSelectedCategories(prev => 
                          prev.includes(category)
                            ? prev.filter(c => c !== category)
                            : [...prev, category]
                        );
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 p-3 bg-gray-800 rounded-lg">
                  {selectedCategories.map(category => (
                    <span
                      key={category}
                      className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs"
                    >
                      {category}
                    </span>
                  ))}
                  {selectedCategories.length === 0 && (
                    <span className="text-gray-500">Sin categorías</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Acciones de edición */}
          {isEditing && (
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setName(file.name);
                  setAlt(file.alt || '');
                  setSelectedCategories(
                    Array.isArray(file.categories) ? file.categories : 
                    typeof file.categories === 'object' && file.categories !== null
                      ? Object.values(file.categories)
                      : []
                  );
                }}
                className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-md cursor-pointer"
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSaving}
              >
                {isSaving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
} 