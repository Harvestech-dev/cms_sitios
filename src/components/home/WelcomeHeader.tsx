'use client';

import { useState, useEffect } from 'react';
import IconRenderer from '@/components/common/IconRenderer';

interface WelcomeHeaderProps {
  username: string;
}

export default function WelcomeHeader({ username }: WelcomeHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    // Actualizar la hora cada minuto
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Determinar el saludo según la hora del día
    const hour = currentTime.getHours();
    if (hour < 12) {
      setGreeting('Buenos días');
    } else if (hour < 18) {
      setGreeting('Buenas tardes');
    } else {
      setGreeting('Buenas noches');
    }
  }, [currentTime]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-gradient-to-r from-blue-800 to-indigo-900 rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {greeting}, {username}
          </h1>
          <p className="text-blue-200">
            {formatDate(currentTime)} · Último acceso: hace 2 horas
          </p>
        </div>
        <div className="hidden md:block">
          <div className="flex items-center space-x-3 text-white">
            <IconRenderer icon="FaBell" className="w-5 h-5" />
            <span className="text-sm">3 notificaciones pendientes</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex flex-wrap gap-3">
        <div className="bg-blue-700/50 px-3 py-2 rounded-md flex items-center">
          <IconRenderer icon="FaThumbsUp" className="w-4 h-4 text-blue-200 mr-2" />
          <span className="text-white text-sm">Todo funcionando correctamente</span>
        </div>
        <div className="bg-yellow-600/50 px-3 py-2 rounded-md flex items-center">
          <IconRenderer icon="FaExclamationTriangle" className="w-4 h-4 text-yellow-200 mr-2" />
          <span className="text-white text-sm">2 productos sin imagen destacada</span>
        </div>
      </div>
    </div>
  );
} 