'use client';

import { useState } from 'react';
import Modal from '@/components/common/Modal';
import IconRenderer from '@/components/common/IconRenderer';
import { MediaFile } from '@/types/media';
import { formatFileSize, formatDate } from '@/lib/utils';
import { useToast } from '@/contexts/ToastContext';

interface FileDetailsModalProps {
  file: MediaFile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (file: MediaFile) => Promise<void>;
}

export default function FileDetailsModal({ file, isOpen, onClose, onSave }: FileDetailsModalProps) {
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedFile, setEditedFile] = useState(file);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(editedFile);
      setIsEditing(false);
      showToast('Cambios guardados correctamente', 'success');
    } catch (error) {
      console.error('Error al guardar:', error);
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
            value={editedFile[key] as string}
            onChange={(e) => setEditedFile({ ...editedFile, [key]: e.target.value })}
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
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 cursor-pointer"
              >
                Editar
              </button>
            )}
          </div>
          {renderField('Nombre', file.name, 'name')}
          {renderField('Texto alternativo', file.alt, 'alt')}
          
          {/* Acciones de edición */}
          {isEditing && (
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setEditedFile(file);
                  setIsEditing(false);
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