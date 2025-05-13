'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useNews } from '@/contexts/NewsContext';
import { NewsStatus, NewsFilters } from '@/types/news';
import IconRender from '@/components/common/IconRender';
import { formatDate } from '@/lib/utils';
import { Combobox } from '@headlessui/react';

type SortField = 'title' | 'created_at' | 'published_at' | 'author';
type SortOrder = 'asc' | 'desc';

interface SortConfig {
  field: SortField;
  order: SortOrder;
}

export default function NewsList() {
  const { 
    news, 
    loading, 
    filters, 
    setFilters,
    totalCount,
    deleteNews 
  } = useNews();
  const router = useRouter();

  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ from?: string; to?: string }>({});
  const [sort, setSort] = useState<SortConfig>({ field: 'created_at', order: 'desc' });
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  // Extraer categorías y tags únicos
  const uniqueCategories = [...new Set(news.flatMap(item => item.categories))];
  const uniqueTags = [...new Set(news.flatMap(item => item.tags))];

  // Estado local para el input de búsqueda
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  // Aplicar filtros cuando cambien
  useEffect(() => {
    setFilters({
      ...filters,
      category: selectedCategories.length > 0 ? selectedCategories.join(',') : undefined,
      tag: selectedTags.length > 0 ? selectedTags.join(',') : undefined,
      dateFrom: dateRange.from,
      dateTo: dateRange.to,
      sortBy: sort.field,
      sortOrder: sort.order
    });
  }, [selectedCategories, selectedTags, dateRange, sort]);

  // Cargar estado del localStorage al montar el componente (solo cliente)
  useEffect(() => {
    const saved = localStorage.getItem('newsFiltersExpanded');
    if (saved !== null) {
      setIsFiltersExpanded(JSON.parse(saved));
    }
  }, []);

  // Guardar estado en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('newsFiltersExpanded', JSON.stringify(isFiltersExpanded));
  }, [isFiltersExpanded]);

  const handleSortChange = (field: SortField) => {
    setSort(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (field: SortField) => {
    if (sort.field !== field) return 'FaSort';
    return sort.order === 'asc' ? 'FaSortUp' : 'FaSortDown';
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta noticia?')) return;
    
    try {
      setIsDeleting(id);
      await deleteNews(id);
    } finally {
      setIsDeleting(null);
    }
  };

  const statusColors: Record<NewsStatus, string> = {
    draft: 'bg-gray-500',
    published: 'bg-green-500',
    archived: 'bg-red-500'
  };

  const hasPagination = totalCount > (filters.limit || 10);
  const currentPage = filters.page || 1;
  const totalPages = Math.ceil(totalCount / (filters.limit || 10));

  // Función para manejar la búsqueda con debounce
  const debouncedSearch = useCallback(
    (term: string) => {
      setFilters({
        ...filters,
        search: term,
        page: 1
      });
    },
    [filters, setFilters]
  );

  // Manejador del cambio en el input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value); // Actualizar estado local inmediatamente
    debouncedSearch(value); // Debounce la actualización de filtros
  };

  // Limpiar búsqueda
  const handleClearSearch = () => {
    setSearchTerm('');
    setFilters({
      ...filters,
      search: ''
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Barra de búsqueda fija */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <IconRender 
                icon="FaSearch" 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" 
              />
              <input
                type="text"
                placeholder="Buscar noticias..."
                className="w-full bg-gray-700 border border-gray-600 rounded pl-10 pr-3 py-2"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  title="Limpiar búsqueda"
                >
                  <IconRender icon="FaTimes" className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filtros rápidos en línea */}
          <div className="flex items-center gap-4">
            {/* Estado */}
            <select
              value={filters.status || ''}
              onChange={(e) => setFilters((prev: NewsFilters) => ({ 
                ...prev, 
                status: e.target.value as NewsStatus 
              } as NewsFilters))}
              className="w-48 bg-gray-700 border border-gray-600 rounded px-3 py-2"
            >
              <option value="">Todos los estados</option>
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
              <option value="archived">Archivado</option>
            </select>

            {/* Destacados */}
            <button
                onClick={() => setFilters({
                  ...filters,
                  featured: filters.featured === undefined ? true : undefined
                })}
              className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                filters.featured 
                  ? 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              title={filters.featured ? 'Mostrar todas' : 'Mostrar destacadas'}
            >
              <IconRender 
                icon="FaStar" 
                className={`w-4 h-4 ${filters.featured ? 'text-yellow-300' : ''}`} 
              />
            </button>

            {/* Botón para expandir filtros avanzados */}
            <button
              onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
              className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
                isFiltersExpanded ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <IconRender icon="FaFilter" className="w-4 h-4" />
              <span className="hidden sm:inline">Filtros avanzados</span>
              <IconRender 
                icon={isFiltersExpanded ? 'FaChevronUp' : 'FaChevronDown'} 
                className="w-3 h-3" 
              />
            </button>
          </div>
        </div>

        {/* Filtros activos */}
        {(selectedCategories.length > 0 || selectedTags.length > 0 || dateRange.from || dateRange.to || filters.featured) && (
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="text-gray-400">Filtros activos:</span>
            <div className="flex flex-wrap gap-1">
              {selectedCategories.map(cat => (
                <span key={cat} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs flex items-center gap-1">
                  {cat}
                  <button
                    onClick={() => setSelectedCategories(prev => prev.filter(c => c !== cat))}
                    className="hover:text-blue-200"
                  >
                    <IconRender icon="FaTimes" className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {selectedTags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-xs flex items-center gap-1">
                  {tag}
                  <button
                    onClick={() => setSelectedTags(prev => prev.filter(t => t !== tag))}
                    className="hover:text-green-200"
                  >
                    <IconRender icon="FaTimes" className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {(dateRange.from || dateRange.to) && (
                <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs flex items-center gap-1">
                  {dateRange.from && dateRange.to 
                    ? `${dateRange.from} - ${dateRange.to}`
                    : dateRange.from 
                      ? `Desde ${dateRange.from}`
                      : `Hasta ${dateRange.to}`
                  }
                  <button
                    onClick={() => setDateRange({})}
                    className="hover:text-purple-200"
                  >
                    <IconRender icon="FaTimes" className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.featured && (
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs flex items-center gap-1">
                  <IconRender icon="FaStar" className="w-3 h-3" />
                  Destacadas
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, featured: undefined }))}
                    className="hover:text-yellow-200"
                  >
                    <IconRender icon="FaTimes" className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
            <button
              onClick={() => {
                setSelectedCategories([]);
                setSelectedTags([]);
                setDateRange({});
                setFilters(prev => ({ 
                  ...prev, 
                  search: '', 
                  status: '',
                  featured: undefined 
                }));
              }}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Panel de filtros avanzados colapsable */}
      <div className={`bg-gray-800 rounded-lg overflow-visible transition-all duration-300 ${
        isFiltersExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="p-4">
          <div className="flex items-center gap-4">
            {/* Rango de fechas */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Fecha:</span>
              <input
                type="date"
                className="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-40"
                value={dateRange.from || ''}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                placeholder="Desde"
              />
              <span className="text-gray-500">-</span>
              <input
                type="date"
                className="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-40"
                value={dateRange.to || ''}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                placeholder="Hasta"
              />
            </div>

            {/* Categorías */}
            <div className="flex-1">
              <Combobox
                value={selectedCategories}
                onChange={setSelectedCategories}
                multiple
              >
                <div className="relative">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Categorías:</span>
                    <div className="relative flex-1">
                      <Combobox.Button className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-left flex items-center justify-between">
                        <span className="block truncate">
                          {selectedCategories.length 
                            ? `${selectedCategories.length} seleccionadas` 
                            : 'Seleccionar categorías...'}
                        </span>
                        <IconRender icon="FaChevronDown" className="w-4 h-4 text-gray-400" />
                      </Combobox.Button>
                    </div>
                  </div>
                  <Combobox.Options className="absolute z-50 mt-1 w-full bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                    {uniqueCategories.map(category => (
                      <Combobox.Option
                        key={category}
                        value={category}
                        className={({ active }) =>
                          `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                            active ? 'bg-gray-700 text-white' : 'text-gray-300'
                          }`
                        }
                      >
                        {({ selected }) => (
                          <>
                            <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                              {category}
                            </span>
                            {selected && (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-500">
                                <IconRender icon="FaCheck" className="w-4 h-4" />
                              </span>
                            )}
                          </>
                        )}
                      </Combobox.Option>
                    ))}
                  </Combobox.Options>
                </div>
              </Combobox>
            </div>

            {/* Tags */}
            <div className="flex-1">
              <Combobox
                value={selectedTags}
                onChange={setSelectedTags}
                multiple
              >
                <div className="relative">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Tags:</span>
                    <div className="relative flex-1">
                      <Combobox.Button className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-left flex items-center justify-between">
                        <span className="block truncate">
                          {selectedTags.length 
                            ? `${selectedTags.length} seleccionados` 
                            : 'Seleccionar tags...'}
                        </span>
                        <IconRender icon="FaChevronDown" className="w-4 h-4 text-gray-400" />
                      </Combobox.Button>
                    </div>
                  </div>
                  <Combobox.Options className="absolute z-50 mt-1 w-full bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                    {uniqueTags.map(tag => (
                      <Combobox.Option
                        key={tag}
                        value={tag}
                        className={({ active }) =>
                          `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                            active ? 'bg-gray-700 text-white' : 'text-gray-300'
                          }`
                        }
                      >
                        {({ selected }) => (
                          <>
                            <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                              {tag}
                            </span>
                            {selected && (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-green-500">
                                <IconRender icon="FaCheck" className="w-4 h-4" />
                              </span>
                            )}
                          </>
                        )}
                      </Combobox.Option>
                    ))}
                  </Combobox.Options>
                </div>
              </Combobox>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla con encabezados ordenables */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-900">
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSortChange('title')}
                >
                  <div className="flex items-center gap-2">
                    Título
                    <IconRender icon={getSortIcon('title')} className="w-4 h-4" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Estado
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSortChange('author')}
                >
                  <div className="flex items-center gap-2">
                    Autor
                    <IconRender icon={getSortIcon('author')} className="w-4 h-4" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSortChange('created_at')}
                >
                  <div className="flex items-center gap-2">
                    Fecha
                    <IconRender icon={getSortIcon('created_at')} className="w-4 h-4" />
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {news.map((item) => (
                <tr key={item.id} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {item.featured && (
                        <IconRender 
                          icon="FaStar" 
                          className="w-4 h-4 text-yellow-500 mr-2" 
                        />
                      )}
                      <div className="text-sm text-gray-200">{item.title}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${statusColors[item.status]}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {item.author}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatDate(item.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => router.push(`/news/edit/${item.id}?view=preview`)}
                        className="text-gray-400 hover:text-gray-300"
                        title="Vista previa"
                      >
                        <IconRender icon="FaEye" className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => router.push(`/news/edit/${item.id}`)}
                        className="text-blue-400 hover:text-blue-300"
                        title="Editar"
                      >
                        <IconRender icon="FaEdit" className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={isDeleting === item.id}
                        className="text-red-400 hover:text-red-300 disabled:opacity-50"
                        title="Eliminar"
                      >
                        <IconRender 
                          icon={isDeleting === item.id ? "FaSpinner" : "FaTrash"} 
                          className={`w-4 h-4 ${isDeleting === item.id ? 'animate-spin' : ''}`} 
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {hasPagination && (
          <div className="px-6 py-4 bg-gray-900 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Mostrando {news.length} de {totalCount} noticias
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilters({ ...filters, page: currentPage - 1 })}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setFilters({ ...filters, page: currentPage + 1 })}
                  disabled={currentPage >= totalPages}
                  className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 