'use client';

import { useState } from 'react';
import IconRenderer from '@/components/common/IconRenderer';
import SafeImage from '../common/SafeImage';

interface TimelineItem {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  action: 'created' | 'updated' | 'deleted' | 'published';
  entityType: 'product' | 'news' | 'media' | 'component';
  entityName: string;
  timestamp: string;
}

const ACTION_COLORS = {
  created: 'text-green-400',
  updated: 'text-blue-400',
  deleted: 'text-red-400',
  published: 'text-purple-400'
};

const ACTION_ICONS = {
  created: 'FaPlus',
  updated: 'FaEdit',
  deleted: 'FaTrash',
  published: 'FaGlobe'
};

const ENTITY_ICONS = {
  product: 'FaBox',
  news: 'FaNewspaper',
  media: 'FaImage',
  component: 'FaPuzzlePiece'
};

// Datos de ejemplo
const MOCK_TIMELINE: TimelineItem[] = [
  {
    id: '1',
    user: {
      name: 'Ana Silva',
      avatar: '/avatars/ana.png'
    },
    action: 'published',
    entityType: 'news',
    entityName: 'Descuentos de Primavera',
    timestamp: new Date(Date.now() - 25 * 60000).toISOString() // 25 min ago
  },
  {
    id: '2',
    user: {
      name: 'Carlos López',
      avatar: '/avatars/carlos.png'
    },
    action: 'updated',
    entityType: 'product',
    entityName: 'Smartphone XZ Pro',
    timestamp: new Date(Date.now() - 120 * 60000).toISOString() // 2 hrs ago
  },
  {
    id: '3',
    user: {
      name: 'María González',
      avatar: '/avatars/maria.png'
    },
    action: 'created',
    entityType: 'component',
    entityName: 'Banner Principal Home',
    timestamp: new Date(Date.now() - 240 * 60000).toISOString() // 4 hrs ago
  },
  {
    id: '4',
    user: {
      name: 'Juan Pérez',
      avatar: '/avatars/juan.png'
    },
    action: 'deleted',
    entityType: 'media',
    entityName: 'hero-banner-old.jpg',
    timestamp: new Date(Date.now() - 1440 * 60000).toISOString() // 1 día ago
  },
  {
    id: '5',
    user: {
      name: 'Ana Silva',
      avatar: '/default.png'
    },
    action: 'created',
    entityType: 'news',
    entityName: 'Lanzamiento Nueva Colección',
    timestamp: new Date(Date.now() - 2880 * 60000).toISOString() // 2 días ago
  }
];

const formatTimeAgo = (timestamp: string) => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return `hace ${diffInSeconds} segundos`;
  if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} minutos`;
  if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} horas`;
  if (diffInSeconds < 604800) return `hace ${Math.floor(diffInSeconds / 86400)} días`;
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
};

export default function ActivityTimeline() {
  const [timelineItems] = useState<TimelineItem[]>(MOCK_TIMELINE);

  return (
    <div className="bg-gray-800 rounded-lg p-5 shadow-lg">
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <IconRenderer icon="FaHistory" className="w-5 h-5 text-blue-400" />
        Actividad Reciente
      </h2>
      
      <div className="relative pl-8">
        {/* Línea vertical */}
        <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-600"></div>
        
        {timelineItems.map((item) => (
          <div key={item.id} className="mb-6 relative">
            {/* Icono de acción */}
            <div className={`absolute -left-5 w-8 h-8 rounded-full bg-gray-700 p-2 flex items-center justify-center z-10 ${ACTION_COLORS[item.action]}`}>
              <IconRenderer icon={ACTION_ICONS[item.action]} className="w-3 h-3" />
            </div>
            
            <div className="bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                {/* Avatar del usuario */}
                <div className="w-8 h-8 rounded-full bg-gray-600 overflow-hidden flex-shrink-0">
                  {item.user.avatar ? (
                    <SafeImage
                      src={item.user.avatar} 
                      alt={item.user.name}
                      className="w-full h-full object-cover"
                      width={32}
                      height={32}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-700 text-white">
                      {item.user.name.substring(0, 1)}
                    </div>
                  )}
                </div>
                
                <div className="flex-grow">
                  <h3 className="text-white font-medium">
                    {item.user.name}
                    <span className="font-normal text-gray-400"> {getActionText(item.action)} </span>
                    <span className="items-center gap-1 inline-flex">
                      <IconRenderer icon={ENTITY_ICONS[item.entityType]} className="w-3 h-3 text-gray-400" />
                      <span className="font-medium">{item.entityName}</span>
                    </span>
                  </h3>
                </div>
                
                <div className="text-xs text-gray-400">
                  {formatTimeAgo(item.timestamp)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
          Ver toda la actividad
        </button>
      </div>
    </div>
  );
}

function getActionText(action: TimelineItem['action']) {
  switch (action) {
    case 'created': return 'creó';
    case 'updated': return 'actualizó';
    case 'deleted': return 'eliminó';
    case 'published': return 'publicó';
    default: return action;
  }
} 