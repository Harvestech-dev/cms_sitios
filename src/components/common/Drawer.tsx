'use client';

import { useEffect } from 'react';
import IconRenderer from './IconRenderer';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  position?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-64',
  md: 'w-96',
  lg: 'w-[600px]'
};

export default function Drawer({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  position = 'right',
  size = 'md'
}: DrawerProps) {
  // Prevenir scroll cuando el drawer está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 bg-opacity-50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div 
        className={`
          fixed top-0 bottom-0 ${position === 'right' ? 'right-0' : 'left-0'}
          ${sizeClasses[size]} bg-gray-800 border-l border-gray-700
          transform transition-transform duration-300 ease-in-out z-50
          ${isOpen ? 'translate-x-0' : position === 'right' ? 'translate-x-full' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded-full transition-colors"
          >
            <IconRenderer icon="FaTimes" className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="h-[calc(100vh-64px)]">
          {children}
        </div>
      </div>
    </>
  );
} 