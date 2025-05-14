import React from 'react';
import IconRenderer from '@/components/common/IconRenderer';

export default function Loading() {
  return (
    <div className="flex justify-center items-center h-[50vh]">
      <div className="animate-spin text-blue-500">
        <IconRenderer icon="FaSpinner" className="w-12 h-12" />
      </div>
      <span className="ml-3 text-xl text-gray-300">Cargando...</span>
    </div>
  );
} 