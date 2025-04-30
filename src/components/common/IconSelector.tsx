'use client';

import { useState, useEffect } from 'react';
import * as FaIcons from 'react-icons/fa';
import * as AiIcons from 'react-icons/ai';
import * as BiIcons from 'react-icons/bi';
import Modal from './Modal';

interface IconSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (iconName: string) => void;
  currentIcon?: string;
}

type IconSet = {
  [key: string]: React.ComponentType;
};

const iconSets: { [key: string]: IconSet } = {
  'Font Awesome': FaIcons,
  'Ant Design': AiIcons,
  'Bootstrap Icons': BiIcons,
};

export default function IconSelector({ isOpen, onClose, onSelect, currentIcon }: IconSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSet, setSelectedSet] = useState<string>('Font Awesome');
  const [filteredIcons, setFilteredIcons] = useState<string[]>([]);

  useEffect(() => {
    const icons = Object.keys(iconSets[selectedSet]);
    const filtered = icons.filter(name => 
      name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredIcons(filtered.slice(0, 100)); // Limitamos a 100 resultados para mejor rendimiento
  }, [searchTerm, selectedSet]);

  const renderIcon = (iconName: string) => {
    const IconComponent = iconSets[selectedSet][iconName];
    return <IconComponent className="w-6 h-6" />;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Seleccionar Ícono"
      size="lg"
    >
      <div className="flex flex-col h-full">
        {/* Header con búsqueda y selector de set */}
        <div className="p-4 border-b border-gray-700">
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
              {renderIcon(currentIcon)}
              <span className="text-sm text-gray-400">({currentIcon})</span>
            </div>
          )}
        </div>

        {/* Grid de íconos */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
            {filteredIcons.map(iconName => (
              <button
                key={iconName}
                onClick={() => onSelect(iconName)}
                className={`
                  p-3 flex flex-col items-center gap-2 rounded-lg
                  hover:bg-gray-700 transition-colors
                  ${currentIcon === iconName ? 'bg-blue-600' : 'bg-gray-800'}
                `}
              >
                {renderIcon(iconName)}
                <span className="text-xs text-gray-400 truncate w-full text-center">
                  {iconName.replace(/^(Fa|Ai|Bi)/, '')}
                </span>
              </button>
            ))}
          </div>
          {filteredIcons.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No se encontraron íconos
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-md"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
} 