'use client';

import { useState, useEffect } from 'react';
import IconRenderer from '@/components/common/IconRenderer';

interface StatItem {
  label: string;
  value: number;
  icon: string;
  color: string;
  change?: {
    value: number;
    isPositive: boolean;
  };
}

const MOCK_STATS: StatItem[] = [
  {
    label: 'Productos',
    value: 128,
    icon: 'FaBox',
    color: 'bg-green-600',
    change: {
      value: 12,
      isPositive: true
    }
  },
  {
    label: 'Noticias',
    value: 36,
    icon: 'FaNewspaper',
    color: 'bg-blue-600',
    change: {
      value: 4,
      isPositive: true
    }
  },
  {
    label: 'Medios',
    value: 215,
    icon: 'FaImage',
    color: 'bg-orange-600',
    change: {
      value: 18,
      isPositive: true
    }
  },
  {
    label: 'Visitantes (hoy)',
    value: 543,
    icon: 'FaUsers',
    color: 'bg-purple-600',
    change: {
      value: 12,
      isPositive: false
    }
  }
];

interface RecentItem {
  id: string;
  title: string;
  type: 'product' | 'news';
  status: 'published' | 'draft';
  date: string;
}

const MOCK_RECENT_ITEMS: RecentItem[] = [
  {
    id: '1',
    title: 'Celular Galaxy S24',
    type: 'product',
    status: 'published',
    date: '2023-10-15'
  },
  {
    id: '2',
    title: 'Nuevos servicios disponibles',
    type: 'news',
    status: 'published',
    date: '2023-10-14'
  },
  {
    id: '3',
    title: 'Notebook ThinkPad X1',
    type: 'product',
    status: 'draft',
    date: '2023-10-13'
  },
  {
    id: '4',
    title: 'Promoción de Verano',
    type: 'news',
    status: 'draft',
    date: '2023-10-12'
  }
];

export default function StatsSummary() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {MOCK_STATS.map((stat, index) => (
          <div key={index} className="bg-gray-800 rounded-lg p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className={`${stat.color} p-3 rounded-lg text-white`}>
                <IconRenderer icon={stat.icon} className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-gray-400 text-sm font-medium">{stat.label}</h3>
                <div className="flex items-baseline mt-1">
                  <p className="text-2xl font-semibold text-white">{stat.value}</p>
                  {stat.change && (
                    <span className={`ml-2 text-xs ${stat.change.isPositive ? 'text-green-400' : 'text-red-400'} flex items-center`}>
                      <IconRenderer 
                        icon={stat.change.isPositive ? 'FaArrowUp' : 'FaArrowDown'} 
                        className="w-3 h-3 mr-1" 
                      />
                      {stat.change.value}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-gray-800 rounded-lg p-5 shadow-lg">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <IconRenderer icon="FaClock" className="w-5 h-5 text-blue-400" />
          Elementos Recientes
        </h2>
        
        <div className="space-y-2">
          {MOCK_RECENT_ITEMS.map((item) => (
            <div key={item.id} className="flex items-center justify-between bg-gray-700 rounded-lg p-3 hover:bg-gray-650 transition-colors">
              <div className="flex items-center gap-3">
                <IconRenderer 
                  icon={item.type === 'product' ? 'FaBox' : 'FaNewspaper'} 
                  className={`w-4 h-4 ${item.type === 'product' ? 'text-green-400' : 'text-blue-400'}`} 
                />
                <div>
                  <h3 className="text-white font-medium">{item.title}</h3>
                  <p className="text-xs text-gray-400">
                    {new Date(item.date).toLocaleDateString('es-ES', { 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                  </p>
                </div>
              </div>
              <div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  item.status === 'published' ? 'bg-green-900 text-green-300' : 'bg-gray-600 text-gray-300'
                }`}>
                  {item.status === 'published' ? 'Publicado' : 'Borrador'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 