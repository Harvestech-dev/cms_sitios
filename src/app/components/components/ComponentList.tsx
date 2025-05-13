'use client';

import { useState } from 'react';
import { useComponents } from '@/contexts/ComponentsContext';
import IconRender from '@/components/common/IconRender';
import PageRender from '@/components/common/PageRender';
import { ComponentData } from '@/types/components';

interface ComponentListProps {
  onSelect?: (component: ComponentData) => void;
}

export default function ComponentList({ onSelect }: ComponentListProps) {
  const { components, loading } = useComponents();
  const [selectedComponent, setSelectedComponent] = useState<ComponentData | null>(null);
  const [expandedPages, setExpandedPages] = useState<string[]>([]);

  if (loading) return <p className="text-gray-400">Cargando componentes...</p>;

  const pages = Object.entries(
    components.reduce((acc, comp) => {
      const page = comp.page || 'Sin página';
      acc[page] = [...(acc[page] || []), comp];
      return acc;
    }, {} as Record<string, ComponentData[]>)
  );

  const togglePage = (page: string) => {
    setExpandedPages(prev => 
      prev.includes(page) 
        ? prev.filter(p => p !== page)
        : [...prev, page]
    );
  };

  const handleSelect = (component: ComponentData) => {
    setSelectedComponent(component);
    onSelect?.(component);
  };

  return (
    <div className="space-y-2">
      {/* Lista acordeón */}
      <div className="bg-gray-800 rounded-lg divide-y divide-gray-700">
        {pages.map(([page, comps]) => (
          <div key={page} className="overflow-hidden">
            {/* Cabecera del acordeón */}
            <button
              onClick={() => togglePage(page)}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <IconRender 
                  icon={expandedPages.includes(page) ? 'FaFolderOpen' : 'FaFolder'} 
                  className="w-4 h-4 text-gray-400" 
                />
                <h3 className="text-lg font-medium text-white">{page}</h3>
                <span className="text-sm text-gray-400">({comps.length})</span>
              </div>
              <IconRender 
                icon={expandedPages.includes(page) ? 'FaChevronDown' : 'FaChevronRight'} 
                className={`
                  w-4 h-4 text-gray-400 transition-transform duration-200
                  ${expandedPages.includes(page) ? 'transform rotate-0' : ''}
                `}
              />
            </button>

            {/* Contenido del acordeón */}
            <div className={`
              grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 
              transition-all duration-200 ease-in-out
              ${expandedPages.includes(page) 
                ? 'max-h-[1000px] opacity-100' 
                : 'max-h-0 opacity-0 overflow-hidden p-0'
              }
            `}>
              {comps.map(comp => (
                <button
                  key={comp.id}
                  onClick={() => handleSelect(comp)}
                  className={`
                    flex items-center ml-4 my-4 p-3 rounded-lg text-left
                    transition-all duration-200
                    ${selectedComponent?.id === comp.id 
                      ? 'bg-blue-500/20 border-2 border-blue-500' 
                      : 'bg-gray-700 hover:bg-gray-600 border-2 border-transparent'
                    }
                  `}
                >
                  <IconRender 
                    icon={comp.icon || 'FaPuzzlePiece'} 
                    className="w-5 h-5 text-gray-400 mr-3" 
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white truncate">{comp.name}</h4>
                    <p className="text-sm text-gray-400 truncate">{comp.type}</p>
                  </div>
                  {comp.status === 'published' && (
                    <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 ml-2" />
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Preview */}
      {selectedComponent && (
        <div className="bg-gray-800 rounded-lg mt-4">
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-lg font-medium text-white">
              {selectedComponent.name}
            </h2>
            <button
              onClick={() => setSelectedComponent(null)}
              className="text-gray-400 hover:text-gray-300"
            >
              <IconRender icon="FaTimes" className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6">
            <PageRender 
              type={selectedComponent.type}
              page={selectedComponent.page}
            />
          </div>
        </div>
      )}
    </div>
  );
} 