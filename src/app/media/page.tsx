'use client';

import { useState, useEffect, useRef } from 'react';
import { useMedia } from '@/contexts/MediaContext';
import FileUpload from '@/components/common/FileUpload';
import IconRenderer from '@/components/common/IconRenderer';
import { formatFileSize, formatDate } from '@/lib/utils';
import type { MediaFile } from '@/types/media';
import FileDetailsModal from '@/components/media/FileDetailsModal';
import { useToast } from '@/contexts/ToastContext';
import { Chip } from '@/components/common/Chip';
import Image from 'next/image';
import SafeImage from '@/components/common/SafeImage';
import Header from '@/components/layout/Header';

type FilterType = 'all' | 'images' | 'videos' | 'documents';

const MEDIA_CATEGORIES = [
  'noticias',
  'productos',
  'banners',
  'logos',
  'iconos',
  'componentes'
] as const;

export default function MediaPage() {
  const { files, loading, refreshMedia, deleteFile, updateFile } = useMedia();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<FilterType>('all');
  const { showToast } = useToast();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    refreshMedia();
  }, []);

  const handleUploadClick = () => {
    setShowUploadModal(true);
  };

  const filterFiles = (files: MediaFile[]) => {
    let filtered = [...files];

    // Aplicar filtro por tipo
    switch (filter) {
      case 'images':
        filtered = filtered.filter(file => file.type.startsWith('image/'));
        break;
      case 'videos':
        filtered = filtered.filter(file => file.type.startsWith('video/'));
        break;
      case 'documents':
        filtered = filtered.filter(file => 
          !file.type.startsWith('image/') && 
          !file.type.startsWith('video/')
        );
        break;
    }

    // Aplicar búsqueda
    if (searchTerm) {
      filtered = filtered.filter(file => 
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Aplicar filtro por categoría
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(file => {
        const fileCategories = Array.isArray(file.categories) 
          ? file.categories 
          : [];
        return fileCategories.some(category => selectedCategories.includes(category as string));
      });
    }

    return filtered;
  };

  const filteredFiles = filterFiles(files);

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

  const filterButtons: { type: FilterType; label: string; icon: string }[] = [
    { type: 'all', label: 'Todo', icon: 'FaThLarge' },
    { type: 'images', label: 'Imágenes', icon: 'FaImage' },
    { type: 'videos', label: 'Videos', icon: 'FaVideo' },
    { type: 'documents', label: 'Archivos', icon: 'FaFile' }
  ];

  // Acciones contextuales
  const handleShowMetadata = (file: MediaFile) => {
    setSelectedFile(file);
  };

  const handleDelete = async (file: MediaFile) => {
    try {
      if (window.confirm('¿Estás seguro de que quieres eliminar este archivo?')) {
        await deleteFile(file.id);
        await refreshMedia();
        setSelectedFile(null);
        showToast('Archivo eliminado correctamente', 'success');
      }
    } catch (error) {
      console.error('Error al eliminar:', error);
      showToast('Error al eliminar el archivo', 'error');
    }
  };

  const handleUpdateFile = async (updatedFile: MediaFile) => {
    try {
      await updateFile(updatedFile.id, {
        name: updatedFile.name,
        alt: updatedFile.alt,
        categories: updatedFile.categories || []
      });
      
      await refreshMedia();
      setSelectedFile(null);
      showToast('Archivo actualizado correctamente', 'success');
    } catch (error) {
      console.error('Error al actualizar:', error);
      showToast('Error al actualizar el archivo', 'error');
    }
  };

  const renderContextActions = (file: MediaFile) => {
    return (
      <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(file);
            }}
            className="p-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
            title="Eliminar"
          >
            <IconRenderer icon="FaTrash" className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <>
      <Header
        title="Biblioteca de Medios"
        breadcrumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Medios', href: '/media' }
        ]}
        actions={[
          {
            label: 'Subir archivo',
            onClick: handleUploadClick,
            icon: 'FaUpload',
            variant: 'primary'
          }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Sección de carga de archivos */}
{/*         <div className="mb-6">
          <FileUpload onUploadComplete={refreshMedia} />
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                // Aquí podrías usar el mismo manejador que usa FileUpload
                // o redirigir al usuario a esa funcionalidad
                // Por ahora, simplemente activamos el componente FileUpload
                const fileUploadInput = document.querySelector('.file-upload input[type="file"]') as HTMLInputElement;
                if (fileUploadInput) {
                  fileUploadInput.click();
                }
                e.target.value = ''; // Resetear para permitir seleccionar el mismo archivo
              }
            }}
            multiple
          />
        </div> */}

        {/* Contenedor principal */}
        <div className="bg-gray-900 rounded-lg overflow-hidden">
          <div className="p-6">
            {/* Header */}
            <div className="mb-6">
              <div className="flex flex-col gap-4">
                {/* Barra de búsqueda y filtros */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                  <div className="relative w-full md:w-1/3">
                    <input
                      type="text"
                      placeholder="Buscar archivos..."
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 pl-10 text-white placeholder-gray-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <IconRenderer
                      icon="FaSearch"
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    />
                  </div>

                  <div className="flex gap-2 w-full md:w-auto overflow-x-auto py-1">
                    {filterButtons.map(btn => (
                      <button
                        key={btn.type}
                        onClick={() => setFilter(btn.type)}
                        className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 whitespace-nowrap ${
                          filter === btn.type
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        <IconRenderer icon={btn.icon} className="w-4 h-4" />
                        {btn.label}
                      </button>
                    ))}

                    <button
                      onClick={() => setView(view === 'grid' ? 'list' : 'grid')}
                      className="px-3 py-1.5 rounded-lg text-sm bg-gray-800 text-gray-300 hover:bg-gray-700 ml-2"
                      title={view === 'grid' ? 'Vista de lista' : 'Vista de cuadrícula'}
                    >
                      <IconRenderer icon={view === 'grid' ? 'FaList' : 'FaThLarge'} className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Filtro por categorías */}
                <div>
                  <button
                    onClick={() => document.getElementById('categoryFilters')?.classList.toggle('hidden')}
                    className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
                  >
                    <IconRenderer icon="FaTags" className="w-3 h-3" />
                    Filtrar por categorías
                    <IconRenderer icon="FaChevronDown" className="w-3 h-3 ml-1" />
                  </button>

                  <div id="categoryFilters" className="hidden mt-3">
                    <div className="p-4 border-t border-gray-700">
                      <h3 className="text-sm font-medium text-gray-300 mb-3">Categorías</h3>
                      <div className="flex flex-wrap gap-2">
                        {MEDIA_CATEGORIES.map(category => (
                          <Chip
                            key={category}
                            label={category}
                            onClick={() => toggleCategory(category)}
                            active={selectedCategories.includes(category)}
                            className="text-xs"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Files Display */}
          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-400">Cargando archivos...</div>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400">
                {searchTerm ? 'No se encontraron archivos' : 'No hay archivos disponibles'}
              </div>
            </div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-6">
              {filteredFiles.map(file => (
                <div
                  key={file.id}
                  onClick={() => handleShowMetadata(file)}
                  className="relative group cursor-pointer rounded-lg overflow-hidden border-2 border-transparent hover:border-gray-600 transition-all"
                >
                  <div className="aspect-square relative bg-gray-800">
                    {file.type.startsWith('image/') ? (
                      <SafeImage
                        src={file.url}
                        alt={file.alt || file.name}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <IconRenderer 
                          icon={getFileIcon(file.type)} 
                          className="w-12 h-12 text-gray-400" 
                        />
                      </div>
                    )}
                    {renderContextActions(file)}
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="text-white text-sm truncate">{file.name}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg overflow-hidden m-6">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-900">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tamaño</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredFiles.map(file => (
                    <tr
                      key={file.id}
                      onClick={() => handleShowMetadata(file)}
                      className="relative group cursor-pointer hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <IconRenderer 
                              icon={getFileIcon(file.type)} 
                              className="w-5 h-5 text-gray-400 mr-3" 
                            />
                            <span className="text-gray-300">{file.name}</span>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(file);
                              }}
                              className="p-1 text-gray-400 hover:text-gray-200 cursor-pointer"
                              title="Eliminar"
                            >
                              <IconRenderer icon="FaTrash" className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{file.type}</td>
                      <td className="px-6 py-4 text-gray-300">{formatFileSize(file.size)}</td>
                      <td className="px-6 py-4 text-gray-300">{formatDate(file.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Sección de carga de archivos (modal) */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Subir archivo</h2>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <IconRenderer icon="FaTimes" className="w-5 h-5" />
              </button>
            </div>
            
            <FileUpload 
              onUploadComplete={async () => {
                try {
                  await refreshMedia();
                  showToast('Archivo subido correctamente', 'success');
                  setShowUploadModal(false);
                } catch (uploadError) {
                  console.error('Error al subir:', uploadError);
                  showToast('Error al subir el archivo', 'error');
                }
              }}
              onError={(error) => {
                console.error('Error:', error);
                showToast('Error al subir el archivo', 'error');
              }}
            />
          </div>
        </div>
      )}

      {selectedFile && (
        <FileDetailsModal
          file={selectedFile}
          isOpen={!!selectedFile}
          onClose={() => setSelectedFile(null)}
          onUpdate={handleUpdateFile}
        />
      )}
    </>
  );
} 