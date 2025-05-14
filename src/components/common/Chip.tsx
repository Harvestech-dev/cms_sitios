'use client';

import React from 'react';
import IconRenderer from './IconRenderer';

export interface ChipProps {
  label: string;
  onClick?: () => void;
  onDelete?: () => void;
  className?: string;
  icon?: string;
  active?: boolean;
}

export function Chip({ 
  label, 
  onClick, 
  onDelete, 
  className = '', 
  icon,
  active = false
}: ChipProps) {
  return (
    <div
      className={`
        inline-flex items-center rounded-full px-3 py-1 text-sm
        ${onClick ? 'cursor-pointer' : ''}
        ${active 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }
        ${className}
      `}
      onClick={onClick}
    >
      {icon && (
        <IconRenderer icon={icon} className="w-3 h-3 mr-1" />
      )}
      <span>{label}</span>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="ml-2 text-gray-400 hover:text-white"
        >
          <IconRenderer icon="FaTimes" className="w-3 h-3" />
        </button>
      )}
    </div>
  );
} 