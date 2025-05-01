'use client';

import { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import IconRender from './IconRender';
import * as FaIcons from 'react-icons/fa';
import * as AiIcons from 'react-icons/ai';
import * as BiIcons from 'react-icons/bi';
import { IconType } from 'react-icons';

interface IconSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (iconName: string) => void;
  currentIcon?: string;
}

interface IconSet {
  prefix: string;
  icons: { [key: string]: IconType };
}

const iconSets: { [key: string]: IconSet } = {
  'Font Awesome': { prefix: 'Fa', icons: FaIcons },
  'Ant Design': { prefix: 'Ai', icons: AiIcons },
  'Bootstrap Icons': { prefix: 'Bi', icons: BiIcons }
};

const ICONS_PER_PAGE = 48; // Múltiplo de 8, 10 y 12 para la grid

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';

export default function IconSelector({ isOpen, onClose, onSelect, currentIcon }: IconSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSet, setSelectedSet] = useState<string>('Font Awesome');
  const [allIcons, setAllIcons] = useState<string[]>([]);
  const [visibleIcons, setVisibleIcons] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const loaderRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>();

  // Cargar todos los íconos filtrados
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      const { prefix, icons } = iconSets[selectedSet];
      const filtered = Object.keys(icons)
        .filter(name => name.startsWith(prefix))
        .filter(name => 
          name.toLowerCase().includes(searchTerm.toLowerCase())
        );

      setAllIcons(filtered);
      setVisibleIcons(filtered.slice(0, ICONS_PER_PAGE));
      setPage(1);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, selectedSet]);

  // Configurar IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && visibleIcons.length < allIcons.length) {
          const nextPage = page + 1;
          const nextIcons = allIcons.slice(0, nextPage * ICONS_PER_PAGE);
          setVisibleIcons(nextIcons);
          setPage(nextPage);
        }
      },
      {
        root: null,
        rootMargin: '20px',
        threshold: 0.1
      }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [visibleIcons, allIcons, page]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Seleccionar Ícono"
      size={'3xl' as ModalSize}
      className="p-4 z-[100]"
    >
      <div className="flex flex-col h-[calc(100vh-16rem)]  mx-auto bg-gray-900 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <div className="flex gap-4 mb-4">
            <select
              value={selectedSet}
              onChange={(e) => setSelectedSet(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.keys(iconSets).map(set => (
                <option key={set} value={set}>{set}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Buscar ícono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {currentIcon && (
            <div className="flex items-center gap-2 text-gray-300">
              <span>Ícono actual:</span>
              <IconRender icon={currentIcon} className="w-6 h-6" />
              <span className="text-sm text-gray-400">({currentIcon})</span>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-4">
            {visibleIcons.map(iconName => (
              <button
                key={iconName}
                onClick={() => onSelect(iconName)}
                className={`
                  p-4 flex flex-col items-center gap-2 rounded-lg
                  hover:bg-gray-700 transition-colors
                  ${currentIcon === iconName ? 'bg-blue-600' : 'bg-gray-800'}
                `}
              >
                <IconRender icon={iconName} className="w-6 h-6" />
                <span className="text-xs text-gray-400 truncate w-full text-center">
                  {iconName.replace(/^(Fa|Ai|Bi)/, '')}
                </span>
              </button>
            ))}
          </div>

          {/* Loader indicator */}
          {visibleIcons.length < allIcons.length && (
            <div 
              ref={loaderRef}
              className="flex justify-center items-center py-8"
            >
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          )}

          {/* No results message */}
          {allIcons.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No se encontraron íconos
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
} 