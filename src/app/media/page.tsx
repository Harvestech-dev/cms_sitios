'use client';

import { useState } from 'react';
import { useMedia } from '@/contexts/MediaContext';
import FileUpload from '@/components/common/FileUpload';
import IconRenderer from '@/components/common/IconRenderer';
import { formatFileSize, formatDate } from '@/lib/utils';
import { MediaFile } from '@/types/media';
import FileDetailsModal from '@/components/media/FileDetailsModal';
import { useToast } from '@/contexts/ToastContext';
import { Chip } from '@/components/common/Chip';

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

  const filterFiles = (files: MediaFile[]) => {
    let filtered = files;

    // Log inicial
    console.log('Filtrando archivos:', {
      totalFiles: files.length,
      selectedCategories,
      filesWithCategories: files.filter(f => Array.isArray(f.categories) && f.categories.length > 0).length
    });

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
        // Asegurarnos de que categories sea un array
        const fileCategories = Array.isArray(file.categories) 
          ? file.categories 
          : typeof file.categories === 'object' && file.categories !== null
            ? Object.values(file.categories)
            : [];

        // Log para debugging
        console.log('Verificando categorías para:', {
          fileName: file.name,
          fileCategories,
          selectedCategories,
          rawCategories: file.categories
        });

        return fileCategories.some(category => selectedCategories.includes(category));
      });
    }

    // Log final
    console.log('Resultado del filtrado:', {
      filteredCount: filtered.length,
      appliedFilters: {
        type: filter,
        hasSearch: !!searchTerm,
        categoryCount: selectedCategories.length
      }
    });

    return filtered;
  };

  const filteredFiles = filterFiles(files);

  const handleUploadComplete = async () => {
    try {
      await refreshMedia();
      showToast('Archivo subido correctamente', 'success');
    } catch (error) {
      showToast('Error al subir el archivo', 'error');
    }
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
      console.error('Error al eliminar archivo:', error);
      showToast('Error al eliminar el archivo', 'error');
    }
  };

  const handleUpdateFile = async (updatedFile: MediaFile) => {
    try {
      await updateFile(updatedFile.id, {
        name: updatedFile.name,
        alt: updatedFile.alt,
        categories: updatedFile.categories
      });
      
      await refreshMedia();
      setSelectedFile(null);
      showToast('Archivo actualizado correctamente', 'success');
    } catch (error) {
      console.error('Error al actualizar archivo:', error);
      showToast(
        'Error al actualizar el archivo. Por favor, inténtalo de nuevo.', 
        'error'
      );
    }
  };

  // Renderizar acciones contextuales
  const renderContextActions = (file: MediaFile) => {
    return (
      <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(file);
          }}
          className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors cursor-pointer"
          title="Eliminar"
        >
          <IconRenderer icon="FaTrash" className="w-4 h-4 text-gray-200" />
        </button>
      </div>
    );
  };

  return (
    <>
      <div className="p-6 px-68">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-4">Biblioteca de medios</h1>
          <div className="flex flex-col gap-4">
            {/* Barra de búsqueda y filtros */}
            <div className="bg-gray-800 p-4 rounded-lg space-y-4">
              {/* Búsqueda y vista */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Buscar archivos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setView('grid')}
                    className={`px-3 py-2 rounded-md ${
                      view === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    <IconRenderer icon="FaThLarge" className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setView('list')}
                    className={`px-3 py-2 rounded-md ${
                      view === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    <IconRenderer icon="FaList" className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Filtros de tipo y categorías */}
              <div className="flex flex-col gap-4">
                {/* Tipos de archivo */}
                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Tipo de archivo</h3>
                  <div className="flex flex-wrap gap-2">
                    {filterButtons.map(({ type, label, icon }) => (
                      <button
                        key={type}
                        onClick={() => setFilter(type)}
                        className={`
                          flex items-center gap-2 px-4 py-2 rounded-md
                          ${filter === type 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
                        `}
                      >
                        <IconRenderer icon={icon} className="w-4 h-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Categorías */}
                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Categorías</h3>
                  <div className="flex flex-wrap gap-2">
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
                </div>
              </div>

              {/* Filtros activos */}
              {selectedCategories.length > 0 && (
                <div className="flex items-center gap-2 pt-4 border-t border-gray-700">
                  <span className="text-sm text-gray-400">Filtros activos:</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedCategories.map(category => (
                      <span
                        key={category}
                        className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs flex items-center gap-1"
                      >
                        {category}
                        <button
                          onClick={() => setSelectedCategories(prev => 
                            prev.filter(c => c !== category)
                          )}
                          className="hover:text-blue-200"
                        >
                          <IconRenderer icon="FaTimes" className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    <button
                      onClick={() => setSelectedCategories([])}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Limpiar filtros
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="mb-8 p-6 bg-gray-800 rounded-lg">
          <FileUpload
            onUploadComplete={handleUploadComplete}
            onError={(error) => console.error(error)}
          />
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredFiles.map(file => (
              <div
                key={file.id}
                onClick={() => handleShowMetadata(file)}
                className="relative group cursor-pointer rounded-lg overflow-hidden border-2 border-transparent hover:border-gray-600 transition-all"
              >
                <div className="aspect-square relative bg-gray-800">
                  {file.type.startsWith('image/') ? (
                    <img
                      src={getImagePreview(file)}
                      alt={file.name}
                      className="absolute inset-0 w-full h-full object-cover"
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
          <div className="bg-gray-800 rounded-lg overflow-hidden">
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