'use client';

import { useState } from 'react';
import IconRenderer from '@/components/common/IconRenderer';

type SearchCategory = 'all' | 'products' | 'news' | 'media' | 'components';

interface SearchCategoryOption {
  value: SearchCategory;
  label: string;
  icon: string;
}

const SEARCH_CATEGORIES: SearchCategoryOption[] = [
  { value: 'all', label: 'Todo', icon: 'FaSearch' },
  { value: 'products', label: 'Productos', icon: 'FaBox' },
  { value: 'news', label: 'Noticias', icon: 'FaNewspaper' },
  { value: 'media', label: 'Medios', icon: 'FaImage' },
  { value: 'components', label: 'Componentes', icon: 'FaPuzzlePiece' }
];

export default function GlobalSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState<SearchCategory>('all');
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = () => {
    // Aquí implementarías la búsqueda real
    console.log(`Buscando "${searchTerm}" en "${category}"`);
    setIsOpen(false);
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-4">
      <div className="relative">
        <div className="flex">
          <div className="relative flex-grow">
            <input
              type="text"
              className="w-full bg-gray-700 border border-gray-600 rounded-l-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Buscar en todo el sitio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsOpen(true)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <IconRenderer icon="FaSearch" className="w-5 h-5" />
            </div>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="bg-gray-600 text-white h-full px-4 rounded-r-lg border-l border-gray-600 hover:bg-gray-500 transition-colors flex items-center gap-2"
            >
              <IconRenderer 
                icon={SEARCH_CATEGORIES.find(cat => cat.value === category)?.icon || 'FaSearch'} 
                className="w-4 h-4" 
              />
              <span>{SEARCH_CATEGORIES.find(cat => cat.value === category)?.label}</span>
              <IconRenderer icon="FaChevronDown" className="w-3 h-3" />
            </button>
            
            {isOpen && (
              <div className="absolute z-10 right-0 mt-2 w-48 bg-gray-700 rounded-lg shadow-xl overflow-hidden">
                {SEARCH_CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-600 transition-colors ${
                      category === cat.value ? 'bg-gray-600' : ''
                    }`}
                    onClick={() => {
                      setCategory(cat.value);
                      setIsOpen(false);
                    }}
                  >
                    <IconRenderer icon={cat.icon} className="w-4 h-4 text-gray-300" />
                    <span className="text-white">{cat.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {searchTerm && isOpen && (
          <div className="absolute z-10 left-0 right-0 mt-2 bg-gray-700 rounded-lg shadow-xl overflow-hidden">
            <div className="p-4 text-center text-gray-400">
              Presiona Enter para buscar "{searchTerm}" en {SEARCH_CATEGORIES.find(cat => cat.value === category)?.label.toLowerCase()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 