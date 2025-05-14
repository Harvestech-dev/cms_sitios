'use client';

import { useState } from 'react';
import IconRenderer from '@/components/common/IconRenderer';

interface SystemStatus {
  component: string;
  status: 'ok' | 'warning' | 'error';
  message?: string;
}

const STATUS_COLORS = {
  ok: 'text-green-400',
  warning: 'text-yellow-400',
  error: 'text-red-400'
};

const MOCK_STATUS: SystemStatus[] = [
  { component: 'API', status: 'ok' },
  { component: 'Base de Datos', status: 'ok' },
  { component: 'Storage', status: 'warning', message: 'Espacio limitado' },
  { component: 'Email', status: 'ok' }
];

export default function AdminSection() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-gray-800 rounded-lg p-5 shadow-lg">
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <IconRenderer icon="FaTools" className="w-5 h-5 text-purple-400" />
        Panel de Administración
      </h2>
      
      <div className="space-y-4">
        {/* Estado del sistema */}
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white text-sm font-medium">Estado del Sistema</h3>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-white"
            >
              <IconRenderer icon={isExpanded ? 'FaChevronUp' : 'FaChevronDown'} className="w-4 h-4" />
            </button>
          </div>
          
          {isExpanded && (
            <div className="space-y-2 mt-3 text-sm">
              {MOCK_STATUS.map((item) => (
                <div key={item.component} className="flex items-center justify-between">
                  <span className="text-gray-300">{item.component}</span>
                  <div className="flex items-center gap-2">
                    {item.message && <span className="text-xs text-gray-400">{item.message}</span>}
                    <IconRenderer 
                      icon={item.status === 'ok' ? 'FaCheck' : item.status === 'warning' ? 'FaExclamationTriangle' : 'FaTimes'} 
                      className={`w-4 h-4 ${STATUS_COLORS[item.status]}`} 
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Acciones de administración */}
        <div className="grid grid-cols-2 gap-2">
          <button className="bg-gray-700 hover:bg-gray-650 p-3 rounded-lg transition-colors flex flex-col items-center justify-center">
            <IconRenderer icon="FaDatabase" className="w-5 h-5 text-blue-400 mb-1" />
            <span className="text-gray-300 text-xs">Base de Datos</span>
          </button>
          
          <button className="bg-gray-700 hover:bg-gray-650 p-3 rounded-lg transition-colors flex flex-col items-center justify-center">
            <IconRenderer icon="FaFileExport" className="w-5 h-5 text-green-400 mb-1" />
            <span className="text-gray-300 text-xs">Exportar Datos</span>
          </button>
          
          <button className="bg-gray-700 hover:bg-gray-650 p-3 rounded-lg transition-colors flex flex-col items-center justify-center">
            <IconRenderer icon="FaUsers" className="w-5 h-5 text-purple-400 mb-1" />
            <span className="text-gray-300 text-xs">Usuarios</span>
          </button>
          
          <button className="bg-gray-700 hover:bg-gray-650 p-3 rounded-lg transition-colors flex flex-col items-center justify-center">
            <IconRenderer icon="FaCog" className="w-5 h-5 text-gray-400 mb-1" />
            <span className="text-gray-300 text-xs">Configuración</span>
          </button>
        </div>
        
        {/* Versión del sistema */}
        <div className="text-center text-xs text-gray-500 mt-4">
          Versión del sistema: 1.0.0
        </div>
      </div>
    </div>
  );
} 