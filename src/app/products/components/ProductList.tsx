'use client';

import { useState, useCallback } from 'react';
import { useProducts } from '@/contexts/ProductContext';
import { ProductStatus } from '@/types/products';
import IconRenderer from '@/components/common/IconRenderer';
import { formatDate, formatPrice } from '@/lib/utils';
import { debounce } from 'lodash';

interface ProductListProps {
  onEdit: (id: string) => void;
}

export default function ProductList({ onEdit }: ProductListProps) {
  const { 
    products, 
    loading, 
    filters, 
    setFilters,
    deleteProduct,
    refreshProducts 
  } = useProducts();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Búsqueda con debounce
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setFilters({ ...filters, search: term, page: 1 });
    }, 500),
    [setFilters]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    debouncedSearch(term);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        await deleteProduct(id);
        await refreshProducts();
      } catch (error) {
        console.error('Error al eliminar producto:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-gray-800 p-4 rounded-lg space-y-4">
        <div className="flex flex-wrap gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-gray-200"
            />
          </div>

          {/* Filtros de estado */}
          <select
            value={filters.status || ''}
            onChange={(e) => setFilters({ ...filters, status: e.target.value as ProductStatus })}
            className="bg-gray-700 border border-gray-600 rounded px-3 py-2"
          >
            <option value="">Todos los estados</option>
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
            <option value="archived">Archivado</option>
          </select>

          {/* Filtro destacados */}
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
          >
            <IconRenderer icon="FaStar" className="w-4 h-4" />
            Destacados
          </button>
        </div>
      </div>

      {/* Lista de productos */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-400">Cargando productos...</div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400">
            {searchTerm ? 'No se encontraron productos' : 'No hay productos disponibles'}
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Categorías
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {products.map(product => (
                <tr 
                  key={product.id}
                  className="hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="w-10 h-10 rounded object-cover mr-3"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-200">
                          {product.title}
                        </div>
                        {product.featured && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/20 text-yellow-300">
                            <IconRenderer icon="FaStar" className="w-3 h-3 mr-1" />
                            Destacado
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={product.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {product.categories.map(category => (
                        <span
                          key={category}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-300"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {formatDate(product.created_at)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onEdit(product.id)}
                        className="text-gray-400 hover:text-blue-400"
                        title="Editar"
                      >
                        <IconRenderer icon="FaEdit" className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-gray-400 hover:text-red-400"
                        title="Eliminar"
                      >
                        <IconRenderer icon="FaTrash" className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: ProductStatus }) {
  const statusConfig = {
    draft: { color: 'gray', label: 'Borrador' },
    published: { color: 'green', label: 'Publicado' },
    archived: { color: 'red', label: 'Archivado' }
  };

  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-${config.color}-500/20 text-${config.color}-300`}
    >
      {config.label}
    </span>
  );
} 