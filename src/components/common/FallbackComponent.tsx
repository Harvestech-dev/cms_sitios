'use client';

import React from 'react';

interface FallbackComponentProps {
  content?: any;
}

const FallbackComponent: React.FC<FallbackComponentProps> = ({ content }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700">
      <div className="text-yellow-400 text-xl mb-3">
        Componente no implementado
      </div>
      <div className="text-gray-300 text-center mb-6 max-w-lg">
        El componente que estás intentando cargar no existe o no ha sido implementado todavía.
      </div>
      {content?.type && (
        <div className="bg-gray-900 p-3 rounded text-yellow-300 font-mono text-sm">
          Tipo de componente: "{content.type}"
        </div>
      )}
      <div className="mt-6 text-gray-400 text-sm">
        Comunícate con el administrador del sitio para solicitar la implementación de este componente.
      </div>
    </div>
  );
};

export default FallbackComponent; 