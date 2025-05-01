'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNews } from '@/contexts/NewsContext';
import { NewsStatus, NewsFilters } from '@/types/news';
import IconRender from '@/components/common/IconRender';
import { formatDate } from '@/lib/utils';

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
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(() => {
    // Recuperar estado del localStorage
    const saved = localStorage.getItem('newsFiltersExpanded');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Extraer categorías y tags únicos
  const uniqueCategories = [...new Set(news.flatMap(item => item.categories))];
  const uniqueTags = [...new Set(news.flatMap(item => item.tags))];

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

  // Guardar estado en localStorage
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

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabecera de filtros */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div 
          className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-700"
          onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
        >
          <div className="flex items-center gap-2">
            <IconRender 
              icon={isFiltersExpanded ? 'FaChevronDown' : 'FaChevronRight'} 
              className="w-4 h-4 text-gray-400" 
            />
            <span className="font-medium text-gray-200">Filtros y búsqueda</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            {(selectedCategories.length > 0 || selectedTags.length > 0 || dateRange.from || dateRange.to || filters.search) && (
              <span className="bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs">
                Filtros activos
              </span>
            )}
          </div>
        </div>

        {/* Contenido de filtros */}
        <div 
          className={`transition-all duration-300 ease-in-out ${
            isFiltersExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
          }`}
        >
          <div className="p-4 space-y-4 border-t border-gray-700">
            <div className="flex flex-wrap gap-4">
              {/* Búsqueda */}
              <div className="flex-1 min-w-[200px]">
                <input
                  type="text"
                  placeholder="Buscar noticias..."
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                  value={filters.search || ''}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>

              {/* Estado */}
              <div className="w-48">
                <select
                  value={filters.status || ''}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value as NewsStatus })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                >
                  <option value="">Todos los estados</option>
                  <option value="draft">Borrador</option>
                  <option value="published">Publicado</option>
                  <option value="archived">Archivado</option>
                </select>
              </div>

              {/* Rango de fechas */}
              <div className="flex gap-2">
                <input
                  type="date"
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-2"
                  value={dateRange.from || ''}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                />
                <input
                  type="date"
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-2"
                  value={dateRange.to || ''}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                />
              </div>
            </div>

            {/* Categorías y Tags */}
            <div className="flex flex-wrap gap-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Categorías</label>
                <div className="flex flex-wrap gap-2">
                  {uniqueCategories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategories(prev => 
                        prev.includes(category) 
                          ? prev.filter(c => c !== category)
                          : [...prev, category]
                      )}
                      className={`px-3 py-1 rounded-full text-sm ${
                        selectedCategories.includes(category)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {uniqueTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTags(prev => 
                        prev.includes(tag) 
                          ? prev.filter(t => t !== tag)
                          : [...prev, tag]
                      )}
                      className={`px-3 py-1 rounded-full text-sm ${
                        selectedTags.includes(tag)
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Filtros activos */}
            {(selectedCategories.length > 0 || selectedTags.length > 0 || dateRange.from || dateRange.to) && (
              <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Filtros activos:</span>
                  <div className="flex gap-1">
                    {selectedCategories.map(cat => (
                      <span key={cat} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">
                        {cat}
                      </span>
                    ))}
                    {selectedTags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                    {(dateRange.from || dateRange.to) && (
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                        Rango de fechas
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedCategories([]);
                    setSelectedTags([]);
                    setDateRange({});
                    setFilters({ ...filters, search: '' });
                  }}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Limpiar todos
                </button>
              </div>
            )}
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